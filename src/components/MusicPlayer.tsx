"use client";
// 全站音乐播放器。
// 桌面端嵌在顶栏左侧的凹槽里：旋转封面 + 一行滚动歌词（日中对照 / 纯中文），
// 点开是播放器面板——左歌单、右完整歌词；手机端退回左下角悬浮圆钮，
// 面板变成底部抽屉，歌单/歌词用分段按钮切换。
// 数据沿用个人主页 Player.vue：歌单走 https://api.qijieya.cn/meting/
//（和主页同一个网易云歌单 7761179667），逐词歌词走网易云官方接口 + 站内代理。
//
// 性能约定（很重要，别再改回去）：
// 1. 播放进度 / 歌词高亮这类每帧都在变的东西，只改 DOM，不进 React state。
//    之前 timeupdate + rAF 每帧 setState，会把 974 行歌单整体重渲染，卡到不能用。
// 2. 歌单必须虚拟滚动：只渲染视口附近的十几行，否则 974 张封面同时挂 DOM。
// 3. 装载歌曲时不要写 localStorage，否则会把上次保存的进度覆盖成 0。
// 4. 进度持久化是「节流」不是「防抖」：timeupdate 约 4 次/秒，
//    防抖计时器会被不断重置，永远不触发，刷新后进度永远是 0。
// 5. 不要用 scrollIntoView 滚歌单：它会连面板一起滚，卡片看起来是歪的。
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import "styles/MusicPlayer.css";
import { Icon } from "@iconify/react";

// 和个人主页 config.ts 里 playlistIdWyy 保持一致，换歌单只改这一处。
const PLAYLIST_ID = "7761179667";
const METING_API = `https://api.qijieya.cn/meting/?type=playlist&id=${PLAYLIST_ID}`;
// 逐词歌词仍然是网易云官方接口，但改走站内代理 /api/lyric：
// 原来的第三方 CORS 代理域名 cors.emasop.cn 已注销（DNS 都解析不到），
// 换成自己的路由转发，不再受别人的域名生死影响。
const YRC_API = "/api/lyric?id=IDZFC";
// 音频地址优先级：meting 解析地址（服务端 302 到真实 mp3，VIP 能力恢复时直接受益）
// → 网易云官方外链兜底。
const metingUrlOf = (id: string) =>
  `https://api.qijieya.cn/meting/?server=netease&type=url&id=${id}`;
const NETEASE_URL_BASE = "https://music.163.com/song/media/outer/url?id=";
const CACHE_KEY = `music-player-playlist-${PLAYLIST_ID}`;
const CACHE_TTL = 30 * 60 * 1000; // 歌单缓存 30 分钟，和主页一致
const PERSIST_GAP = 900; // 进度落盘最小间隔

// 歌单虚拟滚动参数，必须和 CSS 里的高度一致
const TRACK_ROW_H = 44;
const LIST_VIEW_H = 216;

// 逐词歌词代理经常挂，连续失败几次就不再尝试，省得控制台一直报错。
let yrcFailures = 0;
const YRC_MAX_FAILURES = 2;

interface Song {
  id?: string;
  name: string;
  artist: string;
  pic?: string;
  url?: string;
  lrc?: string;
}

interface LrcSeg {
  Duration: number;
  start: number;
  end: number;
  text: string;
}

interface LrcLine {
  time: number;
  text: string;
  etext?: LrcSeg[];
  pairlyric?: string;
}

type PlayMode = "list" | "single" | "random";
const PLAY_MODE_LABEL: Record<PlayMode, string> = {
  list: "列表循环",
  single: "单曲循环",
  random: "随机播放",
};
const PLAY_MODE_ICON: Record<PlayMode, string> = {
  list: "material-symbols:repeat-rounded",
  single: "material-symbols:repeat-one-rounded",
  random: "material-symbols:shuffle-rounded",
};

function extractSongId(song: Song): string | null {
  if (song.id) return String(song.id);
  if (song.url) {
    const match = String(song.url).match(/\d+/g);
    return match ? match[match.length - 1] : null;
  }
  return null;
}

// 兜底的普通 LRC 常把中文翻译写在括号里（网易云「（中文）」），
// 这里把它拆出来当注释层：主行只留原文，括号里没有假名的中文才算翻译，
// 免得把「(feat. 初音ミク)」这类原文信息也当翻译摘掉。
const KANA_RE = /[\u3040-\u30ff]/;
const CJK_RE = /[\u4e00-\u9fff]/;
function splitTranslation(raw: string): { text: string; sub?: string } {
  const subs: string[] = [];
  const main = raw
    .replace(/[（(]([^（）()]*)[）)]/g, (whole, inner: string) => {
      if (CJK_RE.test(inner) && !KANA_RE.test(inner)) {
        const t = inner.trim();
        if (t) subs.push(t);
        return "";
      }
      return whole;
    })
    .replace(/\s+/g, " ")
    .trim();
  return { text: main || raw.trim(), sub: subs.join(" ") || undefined };
}

function parseLRC(lrc: string): LrcLine[] {
  return lrc
    .split("\n")
    .map((line): LrcLine | null => {
      const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
      if (match) {
        const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
        const raw = match[3].trim();
        if (raw === "") return null;
        const { text, sub } = splitTranslation(raw);
        return { time, text, pairlyric: sub } as LrcLine;
      }
      return null;
    })
    .filter((l): l is LrcLine => !!l);
}

// 逐词（YRC）歌词解析，主页原逻辑照搬：优先 YRC，没有就退到普通 LRC + 翻译。
async function parseYrc(datae: any): Promise<LrcLine[]> {
  function prpdl(yrc: any, timesec: number) {
    const timeTagRegex = /\[(\d+):(\d+)(?:[.:](\d+))?\](.*)/;
    let pairtext = "";
    let min_pairtime = 1;
    if (yrc.tlyric?.lyric) {
      let pairlyrics: string[] = yrc.tlyric.lyric
        .split("\n")
        .filter((item: string) => timeTagRegex.test(item));
      if (yrc.ytlrc?.lyric) {
        pairlyrics = yrc.ytlrc.lyric
          .split("\n")
          .filter((item: string) => timeTagRegex.test(item));
        min_pairtime = 0.01;
      }
      for (const item of pairlyrics) {
        const lyricMatch = item.match(timeTagRegex);
        if (!lyricMatch) continue;
        const text = lyricMatch[4];
        const decimal = lyricMatch[3]
          ? lyricMatch[3].toString().length === 2
            ? parseInt(lyricMatch[3]) / 100
            : parseInt(lyricMatch[3]) / 1000
          : 0;
        const timesecp =
          parseInt(lyricMatch[1]) * 60 + parseInt(lyricMatch[2]) + decimal;
        if (min_pairtime > Math.abs(timesec - timesecp)) {
          min_pairtime = Math.abs(timesec - timesecp);
          pairtext = text.replace("//", "");
        }
      }
    }
    return { pairtext };
  }
  const timeTagRegex = /\[(\d+):(\d+)(?:[.:](\d+))?\](.*)/;
  const zqTagRegex = /\[(\d+),(\d+)?\](.*)/;
  const segRegex = /\((\d+),(\d+),\d+\)(.*?)(?=\(\d+,\d+,\d+\)|$)/g;
  const yrc = datae;
  const json: LrcLine[] = [];
  if (!yrc.yrc && !yrc.tlyric) return json; // 大概率纯音乐
  if (yrc.yrc?.lyric) {
    yrc.yrc.lyric = yrc.yrc.lyric.replace(/^\uFEFF/, "");
    const lyrics: string[] = yrc.yrc.lyric.split("\n");
    for (const lyric of lyrics) {
      const lyricMatch = lyric.match(zqTagRegex);
      if (!lyricMatch) continue;
      const text = lyricMatch[3];
      const timesec = Number(lyricMatch[1]) / 1000;
      const eljson: LrcSeg[] = [];
      if (text.includes("(") && text.includes(")")) {
        let ttt: RegExpExecArray | null;
        segRegex.lastIndex = 0;
        while ((ttt = segRegex.exec(lyric)) !== null) {
          const Duration = parseInt(ttt[2]) / 1000;
          const start = parseInt(ttt[1]) / 1000;
          const totalSecondsEnd = (parseInt(ttt[1]) + parseInt(ttt[2])) / 1000;
          // segRegex 里只有「起始、时长」两个捕获组，正文是第 3 个；
          // 这里原来取 ttt[4] 拿到 undefined，一解析就抛错被 catch 掉，
          // 于是每次都退回普通 LRC，逐字歌词从来没生效过。
          const texte = ttt[3].replace(" ", " ");
          eljson.push({ Duration, start, end: totalSecondsEnd, text: texte });
        }
        if (eljson.length && eljson[eljson.length - 1].text === "&nbsp;")
          eljson.pop();
      }
      const clean = text.replace(/\(\d+,\d+,\d+\)/g, "").trim();
      const pdjg = prpdl(yrc, timesec);
      json.push({
        time: timesec,
        text: clean,
        etext: eljson,
        pairlyric: pdjg.pairtext || undefined,
      });
    }
  } else if (yrc.lrc?.lyric) {
    const lyrics: string[] = yrc.lrc.lyric
      .split("\n")
      .filter((item: string) => timeTagRegex.test(item));
    for (const lyric of lyrics) {
      const lyricMatch = lyric.match(timeTagRegex);
      if (!lyricMatch) continue;
      const decimal = lyricMatch[3]
        ? lyricMatch[3].toString().length === 2
          ? parseInt(lyricMatch[3]) / 100
          : parseInt(lyricMatch[3]) / 1000
        : 0;
      const timesec =
        parseInt(lyricMatch[1]) * 60 + parseInt(lyricMatch[2]) + decimal;
      const pdjg = prpdl(yrc, timesec);
      json.push({
        time: timesec,
        text: lyricMatch[4].trim(),
        pairlyric: pdjg.pairtext || undefined,
      });
    }
  }
  return json;
}

function formatTime(sec: number) {
  if (!sec || sec === Infinity || isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function pickRandomIndex(current: number, length: number) {
  if (length <= 1) return 0;
  let next = current;
  while (next === current) next = Math.floor(Math.random() * length);
  return next;
}

// 滑条已播放部分用主题色，未播放部分用「半透明的字色」，
// 直接拿 --aria-line 当底色太实，压在玻璃上很难看。
// 首屏大播放器压在封面图上，字是白的，用 --mp-track 单独给空槽换浅色。
function trackGradient(percent: number) {
  const p = Math.max(0, Math.min(100, percent));
  return `linear-gradient(to right, var(--mp-fill, var(--aria-theme)) ${p}%, var(--mp-track, color-mix(in srgb, var(--aria-fontcolor) 16%, transparent)) ${p}%)`;
}

function readSaved() {
  const fallback = { index: 0, progress: 0, volume: 0.5, wantPlaying: false };
  try {
    // 只有「本地真有记录」才算老访客：第一次来时 key 是空的，
    // 初始化那段会随机挑一首当初始曲，而不是永远从歌单第一首开始。
    const rawIndex = localStorage.getItem("music-player-songIndex");
    const index = parseInt(rawIndex ?? "", 10);
    const progress = Number(localStorage.getItem("music-player-progress") || 0);
    const volume = Number(localStorage.getItem("music-player-volume") ?? NaN);
    const mode = localStorage.getItem("music-player-playMode");
    return {
      index: Number.isFinite(index) ? index : 0,
      hasIndex: rawIndex !== null && Number.isFinite(index),
      progress: Number.isFinite(progress) ? progress : 0,
      volume:
        Number.isFinite(volume) && volume >= 0 && volume <= 1
          ? volume
          : fallback.volume,
      wantPlaying: localStorage.getItem("music-player-isPlaying") === "true",
      mode: (mode === "list" || mode === "single" || mode === "random"
        ? mode
        : "list") as PlayMode,
    };
  } catch {
    return { ...fallback, mode: "list" as PlayMode };
  }
}

export default function MusicPlayer() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  // 手机端面板只放得下一个内容区，歌单/歌词用分段按钮切换
  const [pane, setPane] = useState<"list" | "lyrics">("list");
  // PC 端右侧歌词卡片显隐（默认显示，选择记在本地）
  const [lyricsOpen, setLyricsOpen] = useState(false);
  // 歌单搜索：按歌名 / 歌手过滤
  const [query, setQuery] = useState("");
  const [hasPlayed, setHasPlayed] = useState(false);

  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const [playMode, setPlayMode] = useState<PlayMode>("list");
  const [allLyrics, setAllLyrics] = useState<LrcLine[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [listScrollTop, setListScrollTop] = useState(0);
  // 顶栏凹槽的挂载点：NavBar 先渲染，挂载后再 portal 进去（SSR 阶段没有 DOM）
  const [dockSlot, setDockSlot] = useState<HTMLElement | null>(null);
  // 封面模糊背景的两层：切歌时旧图垫底、新图淡入，不硬切
  const [coverBg, setCoverBg] = useState<{
    cur: string | null;
    prev: string | null;
    seq: number;
  }>({ cur: null, prev: null, seq: 0 });
  // 首屏大播放器的落脚点（首页 Banner 才有），以及播放器现在站在哪一边
  const [heroSlot, setHeroSlot] = useState<HTMLElement | null>(null);
  // 首页顶部：true 表示播放器在 Banner 里；滚进正文后变 false，回顶栏凹槽
  const [heroMode, setHeroMode] = useState(pathname === "/");
  // 面板位置跟着凹槽走：顶栏 sticky，滚动时贴顶样式会让 nav 左右/高度变一点
  const [panelPos, setPanelPos] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  // 滚动中先不挂封面图（解码 300×300 图是小列表里最贵的一步），
  // 停手 160ms 后再补上，避免快速滚动时不断解码新图
  const [listScrolling, setListScrolling] = useState(false);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 只有「用户主动滚动」才隐藏封面；程序化滚动（切歌自动定位）不隐藏，
  // 否则每次切歌列表里的封面都会闪一下。
  const userScrollRef = useRef(false);
  // 已经显示过封面的歌曲：滚动时它们保持显示，只有新进入视口的才先占位
  const revealedCovers = useRef<Set<string>>(new Set());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef(0);
  const lastPersist = useRef(0);
  const cachedDurationId = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const listScrollRaf = useRef(0);
  // 程序化定位（打开面板跳当前歌）时先标记，别让这次 scroll 再回写 state，
  // 否则「跳很远 → scroll → setState → 重排 → 再 scroll」会互相触发
  const listJumping = useRef(false);
  // 已经渲染到的行号：同一行内的滚动完全不碰 state，避免来回 setState
  const lastListRow = useRef(-1);
  // 完整歌词列表：逐词高亮只在这一块里查 data-seg
  const lyricsBoxRef = useRef<HTMLDivElement | null>(null);
  // 凹槽 / 面板 / 手机悬浮钮，用于点击外部收起
  const dockRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const mobileBtnRef = useRef<HTMLButtonElement | null>(null);
  // 凹槽里两行歌词：主行（中文/歌名）和下面那行小字（日文原文），
  // 两行各自量宽度，谁超了谁自己滚
  const dockMainBoxRef = useRef<HTMLSpanElement | null>(null);
  const dockMainTextRef = useRef<HTMLSpanElement | null>(null);
  const dockSubBoxRef = useRef<HTMLSpanElement | null>(null);
  const dockSubTextRef = useRef<HTMLSpanElement | null>(null);
  // 凹槽里的逐字高亮只在这一块里查 data-seg
  const dockKaraokeRef = useRef<HTMLSpanElement | null>(null);
  // 首屏大播放器：结构比凹槽多，逐字高亮 / 进度 / 时间各有一份 DOM，
  // 每帧同步时和凹槽一起写，切换落脚点时不用重新挂载 <audio>
  const heroRef = useRef<HTMLDivElement | null>(null);
  const heroKaraokeRef = useRef<HTMLSpanElement | null>(null);
  const heroMainBoxRef = useRef<HTMLSpanElement | null>(null);
  const heroMainTextRef = useRef<HTMLSpanElement | null>(null);
  const heroSubBoxRef = useRef<HTMLSpanElement | null>(null);
  const heroSubTextRef = useRef<HTMLSpanElement | null>(null);
  const heroProgressInputRef = useRef<HTMLInputElement | null>(null);
  const heroCurTimeRef = useRef<HTMLSpanElement | null>(null);
  const heroDurTimeRef = useRef<HTMLSpanElement | null>(null);
  // 当前站在 Banner（true）还是顶栏（false）：滚动回调里要读最新值，用 ref 兜底
  const heroModeRef = useRef(pathname === "/");
  // 凹槽底部细进度条，每帧只改宽度
  const dockBarRef = useRef<HTMLElement | null>(null);
  const progressInputRef = useRef<HTMLInputElement | null>(null);
  // 按钮外圈进度环：同样每帧直接改 DOM，不走 React 重渲染
  const ringRef = useRef<SVGCircleElement | null>(null);
  const curTimeRef = useRef<HTMLSpanElement | null>(null);
  const durTimeRef = useRef<HTMLSpanElement | null>(null);
  // onError 兜底用：同一首歌只试一次官方外链，避免死循环
  const fallbackTriedFor = useRef<string | null>(null);
  // 刷新恢复用：元数据回来之前 currentTime 写不进去，先记下来等 loadedmetadata
  const pendingSeek = useRef<number | null>(null);
  // 恢复完成前不许写 localStorage，否则会把上次的进度覆盖成 0
  const restored = useRef(false);
  // 歌词数组的 ref 镜像：每帧同步时读它，避免闭包拿旧值
  const lyricsRef = useRef<LrcLine[]>([]);
  const lyricIndexRef = useRef(0);
  const durationRef = useRef(0);
  // 回调里要读最新值，用 ref 兜底，避免闭包拿到旧状态
  const stateRef = useRef({ playlist, currentIndex, playMode, volume });
  stateRef.current = { playlist, currentIndex, playMode, volume };

  // 进度环贴着按钮外沿走：SVG 尺寸和按钮一致（44px），半径 20.5 + 2px 描边
  const radius = 20.5;
  const circumference = 2 * Math.PI * radius;

  const currentSong = playlist[currentIndex];
  const currentLine = allLyrics[currentLyricIndex];
  // 凹槽两行歌词：字号大的主行是日文原文（唱到哪填到哪），
  // 下面一行小字是中文翻译；纯中文歌就只有一行。
  const showDockLyric = hasPlayed && !!currentLine?.text;
  // 首屏大播放器和面板里那张歌词卡用同一个开关：关掉歌词按钮，Banner 里也只留歌名/歌手
  const showHeroLyric = lyricsOpen && !!currentLine?.text;
  const dockMainText = showDockLyric
    ? currentLine!.text
    : currentSong
      ? currentSong.name
      : "歌单加载中…";
  const dockSubText = showDockLyric
    ? currentLine!.pairlyric
    : currentSong?.artist;

  // 挂载后找到顶栏凹槽；NavBar 在 layout 里先于播放器渲染，effect 时一定存在
  useEffect(() => {
    setDockSlot(document.getElementById("nav-music-slot"));
  }, []);

  // 首屏大播放器的落脚点只有首页的 Banner 才有，而且是客户端挂载的：
  // 等它出现再 portal 过去；离开首页就清掉，避免挂到已卸载的节点上。
  useEffect(() => {
    setHeroSlot(null);
    if (pathname !== "/") return;
    const found = document.getElementById("home-player-slot");
    if (found) {
      setHeroSlot(found);
      return;
    }
    let disposed = false;
    const observer = new MutationObserver(() => {
      const slot = document.getElementById("home-player-slot");
      if (!slot) return;
      observer.disconnect();
      if (!disposed) setHeroSlot(slot);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [pathname]);

  // Banner ↔ 顶栏：以「大播放器的落脚点有没有滑到导航下沿」为准，不用滚动阈值。
  // 首页吸附动画里它经过导航下沿时收进顶栏（同一块 DOM 复制品飞上去），
  // 往回滚时再落回 Banner。用 rAF 节流，只有模式真的变了才 setState。
  useLayoutEffect(() => {
    if (!heroSlot) {
      if (heroModeRef.current) {
        heroModeRef.current = false;
        setHeroMode(false);
      }
      return;
    }
    const nav = document.getElementById("navbar");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let disposed = false;
    let ghost: HTMLElement | null = null;
    let flight: Animation | null = null;

    const dropGhost = () => {
      flight?.cancel();
      flight = null;
      ghost?.remove();
      ghost = null;
    };

    const switchTo = (next: boolean) => {
      if (next === heroModeRef.current) return;
      // 只有跨越「首页 Banner ↔ 主内容区」时才收起面板（两个方向都收）；
      // 在内容区里普通滚动、滚歌单/歌词都不动它
      setIsOpen(false);
      // 反向切回 Banner 时把还没飞完的残影立刻收掉，别和刚出来的播放器叠在一起
      if (next) dropGhost();
      const heroEl = heroRef.current;
      const dockEl = document.getElementById("nav-music-slot");
      // 收进顶栏：克隆一份正在显示的大播放器做 FLIP，飞完自己消失。
      // 只有在屏幕上看得到的时候才飞，刷新后直接落在正文不会凭空飞进来。
      if (
        !next &&
        !reduced.matches &&
        heroEl &&
        dockEl &&
        heroEl.getBoundingClientRect().top > -20
      ) {
        const from = heroEl.getBoundingClientRect();
        const slotRect = dockEl.getBoundingClientRect();
        const navRect = nav?.getBoundingClientRect();
        // 凹槽此刻还没挂载，槽位是 0 高，直接量会飞成一条线；
        // 目标高度用凹槽的固定 46px，纵向对准导航中线
        const to = {
          left: slotRect.left,
          width: slotRect.width,
          height: 46,
          top: navRect ? navRect.top + (navRect.height - 46) / 2 : slotRect.top,
        };
        if (from.width > 0 && to.width > 0) {
          dropGhost();
          const clone = heroEl.cloneNode(true) as HTMLElement;
          clone.setAttribute("aria-hidden", "true");
          clone
            .querySelectorAll<HTMLElement>("button, input, a, [tabindex]")
            .forEach((el) => el.setAttribute("tabindex", "-1"));
          Object.assign(clone.style, {
            position: "fixed",
            // 克隆体会重播入场动画，和 FLIP 抢 transform
            animation: "none",
            left: `${from.left}px`,
            top: `${from.top}px`,
            width: `${from.width}px`,
            height: `${from.height}px`,
            margin: "0",
            zIndex: "1003",
            pointerEvents: "none",
            transformOrigin: "top left",
          });
          document.body.appendChild(clone);
          ghost = clone;
          const dx = to.left - from.left;
          const dy = to.top - from.top;
          const sx = to.width / from.width;
          const sy = to.height / from.height;
          flight = clone.animate(
            [
              {
                transform: "translate(0px, 0px) scale(1, 1)",
                opacity: 1,
                offset: 0,
              },
              {
                transform: `translate(${dx * 0.72}px, ${dy * 0.72}px) scale(${1 + (sx - 1) * 0.72}, ${1 + (sy - 1) * 0.72})`,
                opacity: 1,
                offset: 0.72,
              },
              {
                transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
                opacity: 0,
                offset: 1,
              },
            ],
            {
              duration: 560,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
              fill: "forwards",
            },
          );
          flight.onfinish = dropGhost;
        }
      }
      heroModeRef.current = next;
      setHeroMode(next);
    };

    const evaluate = () => {
      raf = 0;
      if (!heroSlot.isConnected) {
        switchTo(false);
        return;
      }
      const rect = heroSlot.getBoundingClientRect();
      // 矮窗口 / 手机上槽位是 display:none，量出来 0 高就老老实实回顶栏
      if (rect.height < 1) {
        switchTo(false);
        return;
      }
      const navBottom = nav?.getBoundingClientRect().bottom ?? 72;
      // 往下滚：滑到导航下沿就收；往上滚：得完全露出来（多 40px）才展开，
      // 留一段迟滞，不会在边界上反复起飞
      switchTo(
        heroModeRef.current
          ? rect.top > navBottom + 24
          : rect.top > navBottom + 64,
      );
    };
    const schedule = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(evaluate);
    };
    evaluate();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    // 字号加载完 Banner 的高度会变，补量一次
    document.fonts.ready.then(schedule);
    return () => {
      disposed = true;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      dropGhost();
    };
  }, [heroSlot]);

  // 大播放器展开面板时，Banner 的标题/快捷按钮让位（style 在 HomeBanner.css）：
  // 半透明卡片后面透着一层大字，会变成两团糊在一起的灰。
  useEffect(() => {
    const root = document.documentElement;
    if (isOpen && heroMode && heroSlot)
      root.setAttribute("data-music-stage", "");
    else root.removeAttribute("data-music-stage");
    return () => root.removeAttribute("data-music-stage");
  }, [isOpen, heroMode, heroSlot]);

  // 歌词卡开关单独恢复：不依赖歌单能不能拉下来，true/false 都要认
  useEffect(() => {
    try {
      const saved = localStorage.getItem("music-player-lyricsCard");
      if (saved === "true" || saved === "false") {
        setLyricsOpen(saved === "true");
      }
    } catch {
      // 读不到就保持默认关闭
    }
  }, []);

  // 当前封面换图：把上一张留在 prev 垫底，新的一张从透明淡入
  useEffect(() => {
    const pic = currentSong?.pic || null;
    setCoverBg((bg) =>
      bg.cur === pic ? bg : { cur: pic, prev: bg.cur, seq: bg.seq + 1 },
    );
  }, [currentSong?.pic]);

  const setLyrics = useCallback((lines: LrcLine[]) => {
    // 「------」/「//」这类空行只是演唱间隙的占位，不算歌词：
    // 过滤掉之后，上一句会一直保持到下一句真正开始，卡片里也不会出现分隔线。
    const usable = lines.filter((line) => {
      const text = (line.text ?? "").trim();
      return text !== "" && !/^[-—–·.]+$/.test(text);
    });
    lyricsRef.current = usable;
    lyricIndexRef.current = 0;
    setAllLyrics(usable);
    setCurrentLyricIndex(0);
  }, []);

  // 节流写盘：timeupdate 很密，防抖会永远不触发
  const persist = useCallback((force = false) => {
    if (!restored.current) return;
    const now = Date.now();
    if (!force && now - lastPersist.current < PERSIST_GAP) return;
    lastPersist.current = now;
    const audio = audioRef.current;
    try {
      localStorage.setItem(
        "music-player-songIndex",
        String(stateRef.current.currentIndex),
      );
      localStorage.setItem(
        "music-player-progress",
        String(audio?.currentTime ?? 0),
      );
      localStorage.setItem(
        "music-player-volume",
        String(audio?.volume ?? stateRef.current.volume),
      );
      localStorage.setItem("music-player-playMode", stateRef.current.playMode);
      localStorage.setItem(
        "music-player-isPlaying",
        String(audio ? !audio.paused : false),
      );
    } catch {
      // 隐私模式写不进 localStorage 就算了，不影响播歌
    }
  }, []);

  // 每帧只更新 DOM：进度条、时间、逐词高亮、当前歌词行。
  // 这里不调用 setState（除了歌词换行这种低频事件）。
  const syncPlaybackDom = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = audio.currentTime || 0;
    const d = audio.duration;
    const pct = d && isFinite(d) && d > 0 ? (t / d) * 100 : 0;

    // 面板和首屏大播放器各有一根进度条，两边都写（另一边没挂载就跳过）
    for (const input of [
      progressInputRef.current,
      heroProgressInputRef.current,
    ]) {
      if (!input) continue;
      if (d && isFinite(d)) input.max = String(d);
      input.value = String(Math.min(t, d && isFinite(d) ? d : t));
      input.style.background = trackGradient(pct);
    }
    if (ringRef.current) {
      // 圆环周长固定，按播放百分比留缺口；0% 时是空环，100% 时闭合
      ringRef.current.style.strokeDashoffset = `${
        circumference * (1 - Math.min(100, Math.max(0, pct)) / 100)
      }px`;
    }
    for (const el of [curTimeRef.current, heroCurTimeRef.current]) {
      if (el) el.textContent = formatTime(t);
    }
    for (const el of [durTimeRef.current, heroDurTimeRef.current]) {
      if (el) el.textContent = formatTime(d);
    }
    if (dockBarRef.current) dockBarRef.current.style.width = `${pct}%`;

    if (d && isFinite(d) && Math.abs(d - durationRef.current) > 0.5) {
      durationRef.current = d;
      setDuration(d);
      const songId =
        stateRef.current.playlist[stateRef.current.currentIndex]?.id;
      if (songId && cachedDurationId.current !== songId) {
        cachedDurationId.current = songId;
        try {
          localStorage.setItem(`music-player-dur-${songId}`, String(d));
        } catch {
          // 存不进就算了
        }
      }
    }

    // 逐词填充：面板歌词卡 + 顶栏凹槽 + 首屏大播放器
    // 只改当前行那几个 span 的 CSS 变量
    for (const track of [
      lyricsBoxRef.current,
      dockKaraokeRef.current,
      heroKaraokeRef.current,
    ]) {
      if (!track) continue;
      const segs = track.querySelectorAll<HTMLElement>("[data-seg]");
      for (let i = 0; i < segs.length; i += 1) {
        const seg = segs[i];
        const start = Number(seg.dataset.start) || 0;
        const end = Number(seg.dataset.end) || start;
        const span = Number(seg.dataset.dur) || Math.max(end - start, 0.001);
        const p =
          t <= start
            ? 0
            : t >= end
              ? 100
              : Math.max(0, ((t - start) / span) * 100);
        seg.style.setProperty("--progress", `${Math.min(100, p)}%`);
      }
    }

    // 当前歌词行：只在换行时 setState
    const lines = lyricsRef.current;
    if (lines.length) {
      let idx = -1;
      for (let i = 0; i < lines.length; i += 1) {
        if (
          t >= lines[i].time &&
          (i === lines.length - 1 || t < lines[i + 1].time)
        ) {
          idx = i;
          break;
        }
      }
      if (idx !== -1 && idx !== lyricIndexRef.current) {
        lyricIndexRef.current = idx;
        setCurrentLyricIndex(idx);
      }
    }

    persist();
  }, [persist]);

  const tick = useCallback(() => {
    syncPlaybackDom();
    rafRef.current = requestAnimationFrame(tick);
  }, [syncPlaybackDom]);

  const startTick = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stopTick = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const loadLyricsForSong = useCallback(
    async (song: Song) => {
      const id = song.id || extractSongId(song);
      if (!id) {
        setLyrics([]);
        return;
      }
      if (yrcFailures < YRC_MAX_FAILURES) {
        try {
          const res = await fetch(YRC_API.replace("IDZFC", id));
          if (!res.ok) throw new Error(String(res.status));
          const lines = await parseYrc(await res.json());
          if (lines.length) {
            setLyrics(lines);
            return;
          }
        } catch {
          // 逐词歌词拿不到就退到普通 lrc，和主页同一个 fallback
          yrcFailures += 1;
        }
      }
      if (song.lrc) {
        try {
          setLyrics(parseLRC(await (await fetch(song.lrc)).text()));
        } catch {
          setLyrics([]);
        }
      } else {
        setLyrics([]);
      }
    },
    [setLyrics],
  );

  // 唯一真正装载音频的地方。autoplay 由调用方显式决定，不猜。
  // 这里不写 localStorage（会覆盖上次的进度）。
  const loadTrack = useCallback(
    async (list: Song[], index: number) => {
      const audio = audioRef.current;
      if (!list.length || !audio) return;
      const safeIndex = index < 0 || index >= list.length ? 0 : index;
      const song = list[safeIndex];
      if (!song.url) {
        const id = song.id || extractSongId(song);
        if (id) song.url = metingUrlOf(id);
      }
      if (!song.url) return;
      fallbackTriedFor.current = null;
      if (audio.src !== song.url) audio.src = song.url;
      if (song.id) {
        try {
          const d = parseFloat(
            localStorage.getItem(`music-player-dur-${song.id}`) || "",
          );
          if (d > 0 && isFinite(d)) {
            durationRef.current = d;
            setDuration(d);
          }
        } catch {
          // 读不到缓存就等 loadedmetadata
        }
      }
      if ("mediaSession" in navigator) {
        try {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: song.name,
            artist: song.artist,
            artwork: song.pic
              ? [{ src: song.pic, sizes: "512x512", type: "image/png" }]
              : [],
          });
        } catch {
          // 老浏览器不支持就跳过
        }
      }
      void loadLyricsForSong(song);
    },
    [loadLyricsForSong],
  );

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
    } catch {
      // 自动播放策略拦住了（刷新后没有用户手势），保持暂停等用户点
      setIsPlaying(false);
    }
  }, []);

  const goToTrack = useCallback(
    async (index: number, autoplay = true) => {
      const { playlist: list } = stateRef.current;
      if (!list.length) return;
      const safe = (index + list.length) % list.length;
      setCurrentIndex(safe);
      pendingSeek.current = null;
      await loadTrack(list, safe);
      if (autoplay) await tryPlay();
      else {
        audioRef.current?.pause();
        setIsPlaying(false);
      }
      persist(true);
    },
    [loadTrack, persist, tryPlay],
  );

  const nextTrack = useCallback(
    (manual: boolean) => {
      const {
        playlist: list,
        currentIndex: idx,
        playMode: mode,
      } = stateRef.current;
      if (!list.length) return;
      // 非手动（播完了）：单曲循环就重播这一首
      if (!manual && mode === "single") {
        void goToTrack(idx, true);
        return;
      }
      const next =
        mode === "random"
          ? pickRandomIndex(idx, list.length)
          : (idx + 1) % list.length;
      void goToTrack(next, true);
    },
    [goToTrack],
  );

  const prevTrack = useCallback(() => {
    const {
      playlist: list,
      currentIndex: idx,
      playMode: mode,
    } = stateRef.current;
    if (!list.length) return;
    const prev =
      mode === "random"
        ? pickRandomIndex(idx, list.length)
        : (idx - 1 + list.length) % list.length;
    void goToTrack(prev, true);
  }, [goToTrack]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !stateRef.current.playlist.length) return;
    if (audio.paused) void tryPlay();
    else audio.pause();
  }, [tryPlay]);

  // 用户主动滚动时临时不挂封面图，停手 160ms 再补回来
  const markUserScroll = useCallback(() => {
    userScrollRef.current = true;
    setListScrolling(true);
    if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
    scrollIdleTimer.current = setTimeout(() => {
      userScrollRef.current = false;
      setListScrolling(false);
    }, 160);
  }, []);

  // 歌单滚动：用 rAF 节流，避免拖动时每像素重渲染
  const onListScroll = useCallback(() => {
    if (listJumping.current) return;
    const el = listRef.current;
    if (!el || listScrollRaf.current) return;
    listScrollRaf.current = requestAnimationFrame(() => {
      listScrollRaf.current = 0;
      const el = listRef.current;
      if (!el) return;
      // 只按整行推进：行号没变就彻底不动 state。
      // 用 ref 记录上次行号，避免函数式 setState 在滚动/尺寸抖动时反复排队。
      const row = Math.floor(el.scrollTop / TRACK_ROW_H);
      if (row !== lastListRow.current) {
        lastListRow.current = row;
        setListScrollTop(row * TRACK_ROW_H);
      }
      if (userScrollRef.current) markUserScroll();
    });
  }, []);

  // 列表空闲时，把当前渲染出来的行都记为「封面已显示」，
  // 下次滚动时这些行就不会被隐藏，只有新进视口的行先给占位图标。
  useEffect(() => {
    if (listScrolling) return;
    const list = listRef.current;
    if (!list) return;
    list
      .querySelectorAll<HTMLElement>(".music-player-track[data-key]")
      .forEach((row) => {
        const key = row.dataset.key;
        if (key) revealedCovers.current.add(key);
      });
  }, [listScrolling, listScrollTop, playlist]);

  // 当前歌滚到列表中间。不能用 scrollIntoView（会连面板一起滚）。
  // 用 instant 定位：展开动画期间做平滑滚动，浏览器有时会把它吞掉，
  // 表现为“打开列表偶尔没跳到当前歌”。
  useEffect(() => {
    if (!isOpen) return;
    // 手机端切到歌词页时列表是 display:none，没有可算的 scrollTop
    if (pane !== "list") return;
    if (query.trim()) return;
    const list = listRef.current;
    if (!list || !playlist.length) return;
    const top = currentIndex * TRACK_ROW_H - LIST_VIEW_H / 2 + TRACK_ROW_H / 2;
    const maxTop = Math.max(0, playlist.length * TRACK_ROW_H - LIST_VIEW_H);
    const target = Math.max(0, Math.min(top, maxTop));
    // 短距离（同一屏附近）用平滑滚动，长跳直接定位：
    // 全局 * { scroll-behavior: smooth } 下，长距离平滑会逐帧触发 scroll →
    // 每帧 setState 重排虚拟列表，跳远处的歌时会炸成 Maximum update depth
    const smooth = Math.abs(target - list.scrollTop) <= LIST_VIEW_H * 2;
    if (smooth) {
      const raf = requestAnimationFrame(() => {
        list.scrollTo({ top: target, behavior: "smooth" });
      });
      return () => cancelAnimationFrame(raf);
    }
    // 先把虚拟窗口拨过去，再滚：反过来的话浏览器会因为行高/占位块变化改写
    // scrollTop，触发一次额外 scroll，又回写 state
    const row = Math.floor(target / TRACK_ROW_H);
    lastListRow.current = row;
    setListScrollTop(row * TRACK_ROW_H);
    listJumping.current = true;
    const raf = requestAnimationFrame(() => {
      list.scrollTo({ top: target, behavior: "instant" });
      requestAnimationFrame(() => {
        listJumping.current = false;
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      listJumping.current = false;
    };
  }, [currentIndex, isOpen, pane, query, playlist.length]);

  // 只在搜索词变化时回到列表顶部。
  // 之前把展开状态也放进依赖，打开列表时会先跳当前歌、又被这里拉回顶部，
  // 这就是“有时候不会跳到当前歌曲”的原因。
  useEffect(() => {
    if (!query) return;
    const list = listRef.current;
    if (!list) return;
    // 短距离平滑、长距离直接回到顶（同上的原因）
    if (list.scrollTop <= LIST_VIEW_H * 2) {
      list.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      listJumping.current = true;
      list.scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => {
        listJumping.current = false;
      });
    }
    setListScrollTop(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // 把指定歌词行滚到中间；自动跟随和点击跳转共用
  const centerLyricLine = useCallback((index: number) => {
    const box = lyricsBoxRef.current;
    if (!box) return;
    const row = box.querySelector<HTMLElement>(`[data-lyric-index="${index}"]`);
    if (!row) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    box.scrollTo({
      top: Math.max(
        0,
        row.offsetTop - box.clientHeight / 2 + row.offsetHeight / 2,
      ),
      behavior: reduce ? "auto" : "smooth",
    });
  }, []);

  // 完整歌词面板：当前行始终滚回中间。
  // 用户手动翻走之后，只要换句 / 跳转就自动跟回来（不再有冷却期）。
  useLayoutEffect(() => {
    if (!isOpen || !allLyrics.length) return;
    centerLyricLine(currentLyricIndex);
  }, [
    currentLyricIndex,
    isOpen,
    pane,
    allLyrics.length,
    lyricsOpen,
    centerLyricLine,
  ]);

  // 面板贴住播放器：顶栏是 sticky 的，滚动到临界点时高度/边距会变，
  // 所以打开期间跟着 scroll/resize 重新量一次（数值没变就不 setState）。
  // 首屏大播放器在 Banner 里，面板改成在它正上方居中展开（像从播放器里长出来），
  // 而不是顶栏下面那个左上角浮窗。
  useLayoutEffect(() => {
    if (!isOpen) return;
    let raf = 0;
    let timers: ReturnType<typeof setTimeout>[] = [];
    const measure = () => {
      raf = 0;
      const nav = document.getElementById("navbar");
      if (!nav) return;
      const navRect = nav.getBoundingClientRect();
      let next: { left: number; top: number; width: number } | null = null;
      if (heroMode && heroSlot) {
        const heroRect = heroSlot.getBoundingClientRect();
        if (heroRect.width > 0) {
          // 卡片宽度是固定值：左卡 320 + 12 间距 + 右卡 300；
          // 歌词卡收起时它的 -12 负边距正好抵掉间距，所以是 320 + 312
          const width = 320 + (lyricsOpen ? 312 : 0);
          const height = panelRef.current?.offsetHeight ?? 0;
          const centered = heroRect.left + (heroRect.width - width) / 2;
          next = {
            left: Math.round(
              Math.max(12, Math.min(centered, window.innerWidth - width - 12)),
            ),
            // 展开后整块盖住 Banner 里的播放器（下沿对齐它的下沿），
            // 上面放不下（矮窗口）就压在导航下面
            top: Math.round(
              Math.max(navRect.bottom + 10, heroRect.bottom - height),
            ),
            width,
          };
        }
      }
      if (!next) {
        const slotRect = (dockSlot ?? nav).getBoundingClientRect();
        next = {
          left: Math.round(slotRect.left),
          top: Math.round(navRect.bottom + 10),
          width: Math.round(
            Math.min(
              560,
              Math.max(320, window.innerWidth - slotRect.left - 24),
            ),
          ),
        };
      }
      const pos = next;
      setPanelPos((prev) =>
        prev &&
        Math.abs(prev.left - pos.left) < 1 &&
        Math.abs(prev.top - pos.top) < 1 &&
        prev.width === pos.width
          ? prev
          : pos,
      );
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
      // 顶栏贴顶/悬空的过渡有 0.5s，滚到底时最后一帧量到的还是动画中间值，
      // 这里在过渡结束后补量两次，面板才不会和凹槽错开几像素。
      for (const timer of timers) clearTimeout(timer);
      timers = [setTimeout(measure, 280), setTimeout(measure, 620)];
    };
    measure();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      for (const timer of timers) clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isOpen, dockSlot, heroMode, heroSlot, lyricsOpen]);

  // 点面板/凹槽/首屏大播放器/悬浮钮以外的地方收起面板（Esc 另有一条）
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (dockRef.current?.contains(target)) return;
      if (heroRef.current?.contains(target)) return;
      if (mobileBtnRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [isOpen]);

  // 凹槽/首屏大播放器的歌词行各自滚动：量出「超出多少」，写进 CSS 变量交给动画。
  // 不放进 state：换行时直接改 DOM，避免每句歌词触发整块重渲染。
  useLayoutEffect(() => {
    const pairs = [
      [dockMainBoxRef.current, dockMainTextRef.current],
      [dockSubBoxRef.current, dockSubTextRef.current],
      [heroMainBoxRef.current, heroMainTextRef.current],
      [heroSubBoxRef.current, heroSubTextRef.current],
    ] as const;
    let raf = 0;
    const applyOne = (box: HTMLElement, inner: HTMLElement) => {
      const over = inner.scrollWidth - box.clientWidth;
      const overflowing = over > 12;
      box.classList.toggle("is-overflow", overflowing);
      inner.classList.remove("is-marquee");
      if (!overflowing) return;
      inner.style.setProperty("--mp-shift", `${-over}px`);
      inner.style.setProperty(
        "--mp-dur",
        `${Math.min(26, Math.max(7, over / 26))}s`,
      );
      // 文本换了要从头开始滚：先摘类再强制回流，动画才会重新计时
      void inner.offsetWidth;
      inner.classList.add("is-marquee");
    };
    const apply = () => {
      raf = 0;
      for (const [box, inner] of pairs) {
        if (box && inner) applyOne(box, inner);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    const observer = new ResizeObserver(schedule);
    for (const [box] of pairs) if (box) observer.observe(box);
    return () => {
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [dockMainText, dockSubText, heroMode]);

  // Esc 收起面板（不暂停，只是藏起来）
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // 初始化：拉歌单 → 恢复上次状态。只跑一次。
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let songs: Song[] = [];
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          if (Date.now() - data.timestamp < CACHE_TTL && data.songs?.length) {
            songs = data.songs.map((s: Song) => ({ ...s }));
          }
        }
      } catch {
        // 缓存坏了就重新拉
      }
      if (!songs.length) {
        try {
          const raw = await (await fetch(METING_API)).json();
          songs = (Array.isArray(raw) ? raw : []).map((s: any) => ({
            ...s,
            id: s.id ?? extractSongId(s),
          }));
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                timestamp: Date.now(),
                songs: songs.map((s) => ({
                  id: s.id,
                  name: s.name,
                  artist: s.artist,
                  pic: s.pic,
                  lrc: s.lrc,
                })),
              }),
            );
          } catch {
            // 存不进就不存
          }
        } catch {
          songs = [];
        }
      }
      if (cancelled || !songs.length) return;

      const saved = readSaved();
      // 第一次来（本地没有记录）随机挑一首当初始曲；老访客还是接着上次那首
      const idx =
        saved.hasIndex && saved.index >= 0 && saved.index < songs.length
          ? saved.index
          : Math.floor(Math.random() * songs.length);
      setPlaylist(songs);
      setPlayMode(saved.mode);
      setVolume(saved.volume);
      setCurrentIndex(idx);
      // persist 读的是 stateRef，而音频的 timeupdate 可能在 React 提交这次
      // setCurrentIndex 之前就触发，把旧的 0 写进本地记录——下次打开会退回第一首。
      // 这里同步改 ref，保证首次随机那首能被正确记住。
      stateRef.current = { ...stateRef.current, currentIndex: idx };
      // 随机初始曲时不能沿用上次的播放进度，否则会跳到这首曲子中间
      if (saved.hasIndex && saved.progress > 0 && isFinite(saved.progress)) {
        pendingSeek.current = saved.progress;
        // 上次听到一半，即使这次是暂停状态，歌词也该在
        setHasPlayed(true);
      }
      await loadTrack(songs, idx);
      if (cancelled) return;
      const audio = audioRef.current;
      if (audio) audio.volume = saved.volume;
      // 恢复完成后才允许写盘
      restored.current = true;
      if (saved.wantPlaying) await tryPlay();
      syncPlaybackDom();
    })();

    const onSpace = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable)
        return;
      if (e.code === "Space") {
        e.preventDefault();
        const audio = audioRef.current;
        if (!audio || !stateRef.current.playlist.length) return;
        if (audio.paused) void tryPlay();
        else audio.pause();
      }
    };
    // 离开页面时强制落盘，别指望 timeupdate 的最后一次
    const flush = () => persist(true);
    document.addEventListener("keydown", onSpace);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flush);

    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.setActionHandler("play", () => void tryPlay());
        navigator.mediaSession.setActionHandler("pause", () =>
          audioRef.current?.pause(),
        );
        navigator.mediaSession.setActionHandler("previoustrack", () => {
          const {
            playlist: list,
            currentIndex: i,
            playMode: m,
          } = stateRef.current;
          if (!list.length) return;
          const p =
            m === "random"
              ? pickRandomIndex(i, list.length)
              : (i - 1 + list.length) % list.length;
          setCurrentIndex(p);
          void loadTrack(list, p).then(() => tryPlay());
        });
        navigator.mediaSession.setActionHandler("nexttrack", () => {
          const {
            playlist: list,
            currentIndex: i,
            playMode: m,
          } = stateRef.current;
          if (!list.length) return;
          const n =
            m === "random"
              ? pickRandomIndex(i, list.length)
              : (i + 1) % list.length;
          setCurrentIndex(n);
          void loadTrack(list, n).then(() => tryPlay());
        });
      } catch {
        // 绑不上就不绑
      }
    }
    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onSpace);
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (listScrollRaf.current) cancelAnimationFrame(listScrollRaf.current);
      if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPlay = () => {
    setIsPlaying(true);
    setHasPlayed(true);
    startTick();
    persist(true);
  };
  const onPause = () => {
    setIsPlaying(false);
    stopTick();
    syncPlaybackDom();
    persist(true);
  };
  const onEnded = () => nextTrack(false);

  // 只处理真正的加载失败；切源时的 abort(1) 要忽略，否则会连环跳歌。
  const onError = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const code = audio.error?.code;
    if (code === 1) return;
    const song = stateRef.current.playlist[stateRef.current.currentIndex];
    const id = song ? song.id || extractSongId(song) : null;
    if (song && id && fallbackTriedFor.current !== song.url) {
      fallbackTriedFor.current = song.url ?? id;
      audio.src = `${NETEASE_URL_BASE}${id}.mp3`;
      void tryPlay();
      return;
    }
    nextTrack(true);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (pendingSeek.current != null) {
      const target = pendingSeek.current;
      pendingSeek.current = null;
      try {
        audio.currentTime = target;
      } catch {
        // 元数据还没齐就等下一次
      }
    }
    syncPlaybackDom();
  };

  const onTimeUpdate = () => {
    // 播放时 rAF 已经在刷了，这里只兜底暂停/拖动的场景
    if (audioRef.current?.paused) syncPlaybackDom();
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    syncPlaybackDom();
    persist(true);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) / 100;
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
    persist(true);
  };

  const toggleLyricsCard = () => {
    setLyricsOpen((v) => {
      const next = !v;
      try {
        localStorage.setItem("music-player-lyricsCard", String(next));
      } catch {
        // 存不进就算了
      }
      return next;
    });
  };

  const switchPlayMode = () => {
    setPlayMode((m) => {
      const next: PlayMode =
        m === "list" ? "single" : m === "single" ? "random" : "list";
      try {
        localStorage.setItem("music-player-playMode", next);
      } catch {
        // 存不进就算了
      }
      return next;
    });
  };

  const needle = query.trim().toLowerCase();
  const visibleTracks = useMemo(
    () =>
      playlist
        .map((song, index) => ({ song, index }))
        .filter(({ song }) =>
          needle
            ? `${song.name} ${song.artist}`.toLowerCase().includes(needle)
            : true,
        ),
    [playlist, needle],
  );

  // 虚拟滚动：只渲染视口附近的行
  const totalRows = visibleTracks.length;
  const maxScrollTop = Math.max(0, totalRows * TRACK_ROW_H - LIST_VIEW_H);
  const scrollTopSafe = Math.min(Math.max(0, listScrollTop), maxScrollTop);
  const sliceStart = Math.max(0, Math.floor(scrollTopSafe / TRACK_ROW_H) - 3);
  const sliceEnd = Math.min(
    totalRows,
    Math.ceil((scrollTopSafe + LIST_VIEW_H) / TRACK_ROW_H) + 3,
  );
  const rows = visibleTracks.slice(sliceStart, sliceEnd);
  const rowKey = (song: Song, index: number) => song.id ?? `i${index}`;
  const padTop = sliceStart * TRACK_ROW_H;
  const padBottom = Math.max(0, (totalRows - sliceEnd) * TRACK_ROW_H);
  // 逐词歌词只给「当前行」挂 data-seg，每帧由 syncPlaybackDom 填 --progress。
  // 其余行保持纯文本，几十行歌词里只有一行参与逐帧写入。
  const renderKaraoke = (line: LrcLine, index: number) => {
    if (line.etext?.length) {
      return (
        <span className="music-player-karaoke">
          {line.etext.map((seg, si) => (
            <span
              key={si}
              data-seg="1"
              data-start={seg.start}
              data-end={seg.end}
              data-dur={seg.Duration}
              style={{ "--progress": "0%" } as React.CSSProperties}
            >
              {seg.text || "------"}
            </span>
          ))}
        </span>
      );
    }
    const start = line.time;
    const end =
      index < allLyrics.length - 1
        ? allLyrics[index + 1].time
        : duration || start + 5;
    return (
      <span className="music-player-karaoke">
        <span
          data-seg="1"
          data-start={start}
          data-end={end}
          data-dur={Math.max(end - start, 0.001)}
          style={{ "--progress": "0%" } as React.CSSProperties}
        >
          {line.text || "------"}
        </span>
      </span>
    );
  };

  // 点歌词 = 跳到这句（暂停状态也跟着跳，只是不强行播放）
  const jumpToLyric = (time: number, index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    syncPlaybackDom();
    persist(true);
    centerLyricLine(index);
  };

  const togglePanel = () => setIsOpen((v) => !v);

  // 播放器现在站在 Banner 里（首页首屏、桌面宽度、槽位真的存在）才算大播放器
  const heroActive = heroMode && !!heroSlot;

  // 位置用 CSS 变量传：手机上要整块盖成底部抽屉，媒体查询得能盖掉 left/top
  const panelStyle = {
    "--mp-left": panelPos ? `${panelPos.left}px` : undefined,
    "--mp-top": panelPos ? `${panelPos.top}px` : undefined,
  } as React.CSSProperties;

  // 封面模糊背景：PC 只铺在歌词卡上，手机铺满整张播放器
  const coverBgLayers = (
    <>
      {coverBg.prev && (
        <span
          className="music-player-bg-img"
          style={{ backgroundImage: `url("${coverBg.prev}")` }}
        />
      )}
      {coverBg.cur && (
        <span
          key={coverBg.seq}
          className="music-player-bg-img is-fading"
          style={{ backgroundImage: `url("${coverBg.cur}")` }}
        />
      )}
    </>
  );

  // 顶栏凹槽：整块都能点（除了右侧播放键），旋转封面 + 日文主行 + 中文小字行
  const dock = (
    <div
      ref={dockRef}
      className="music-player-dock"
      data-open={isOpen || undefined}
      data-single={!dockSubText || undefined}
      data-lyrics={lyricsOpen ? "true" : "false"}
    >
      <button
        type="button"
        className="music-player-dock-main"
        onClick={togglePanel}
        title={isOpen ? "收起播放器" : "展开播放器"}
        aria-label={isOpen ? "收起播放器" : "展开播放器"}
        aria-expanded={isOpen}
        aria-controls="music-player-panel"
      >
        <span className="music-player-dock-disc" aria-hidden="true">
          {currentSong?.pic ? (
            <img
              className="music-player-dock-disc-img"
              src={currentSong.pic}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              style={{ animationPlayState: isPlaying ? "running" : "paused" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Icon icon="mingcute:music-fill" width={14} height={14} />
          )}
        </span>
        <span className="music-player-dock-text" ref={dockKaraokeRef}>
          <span className="music-player-dock-line is-main" ref={dockMainBoxRef}>
            <span className="music-player-dock-line-text" ref={dockMainTextRef}>
              {showDockLyric && currentLine
                ? renderKaraoke(currentLine, currentLyricIndex)
                : dockMainText}
            </span>
          </span>
          {dockSubText && (
            <span className="music-player-dock-line is-sub" ref={dockSubBoxRef}>
              <span
                className="music-player-dock-line-text"
                ref={dockSubTextRef}
              >
                {dockSubText}
              </span>
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        className="music-player-dock-play"
        onClick={togglePlay}
        title={isPlaying ? "暂停" : "播放"}
        aria-label={isPlaying ? "暂停" : "播放"}
      >
        <span className="music-player-dock-play-circle" aria-hidden="true">
          <Icon
            icon={
              isPlaying
                ? "material-symbols:pause-rounded"
                : "material-symbols:play-arrow-rounded"
            }
            width={16}
            height={16}
          />
        </span>
      </button>
      <span className="music-player-dock-progress" aria-hidden="true">
        <i ref={dockBarRef} />
      </span>
    </div>
  );

  // 首屏大播放器：和顶栏凹槽是同一台播放器的两种落脚点。
  // 比凹槽多出歌名/歌手、上一首/下一首、播放模式和时间，滚进正文时收进顶栏。
  const hero = (
    <div
      ref={heroRef}
      className="music-player-hero"
      data-open={isOpen || undefined}
      data-lyric={showHeroLyric && currentLine ? "true" : "false"}
    >
      <button
        type="button"
        className="music-player-hero-main"
        onClick={togglePanel}
        title={isOpen ? "收起播放器" : "展开播放器"}
        aria-label={isOpen ? "收起播放器" : "展开播放器"}
        aria-expanded={isOpen}
        aria-controls="music-player-panel"
      >
        <span className="music-player-hero-disc" aria-hidden="true">
          {currentSong?.pic ? (
            <img
              className="music-player-hero-disc-img"
              src={currentSong.pic}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              style={{ animationPlayState: isPlaying ? "running" : "paused" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Icon icon="mingcute:music-fill" width={26} height={26} />
          )}
        </span>
        <span className="music-player-hero-meta">
          <span className="music-player-hero-name">
            {currentSong?.name || "歌单加载中…"}
          </span>
          <span className="music-player-hero-artist">
            {currentSong?.artist || "稍等一下喵"}
          </span>
        </span>
        <span className="music-player-hero-info" ref={heroKaraokeRef}>
          {showHeroLyric && currentLine && (
            <>
              <span
                className="music-player-hero-line is-main"
                ref={heroMainBoxRef}
              >
                <span
                  className="music-player-hero-line-text"
                  ref={heroMainTextRef}
                >
                  {renderKaraoke(currentLine, currentLyricIndex)}
                </span>
              </span>
              {dockSubText && (
                <span
                  className="music-player-hero-line is-sub"
                  ref={heroSubBoxRef}
                >
                  <span
                    className="music-player-hero-line-text"
                    ref={heroSubTextRef}
                  >
                    {dockSubText}
                  </span>
                </span>
              )}
            </>
          )}
        </span>
      </button>
      <div className="music-player-hero-actions">
        <button
          type="button"
          className="music-player-hero-control"
          onClick={prevTrack}
          title="上一首"
          aria-label="上一首"
        >
          <Icon
            icon="material-symbols:skip-previous-rounded"
            width={18}
            height={18}
          />
        </button>
        <button
          type="button"
          className="music-player-hero-play"
          onClick={togglePlay}
          title={isPlaying ? "暂停" : "播放"}
          aria-label={isPlaying ? "暂停" : "播放"}
        >
          <Icon
            icon={
              isPlaying
                ? "material-symbols:pause-rounded"
                : "material-symbols:play-arrow-rounded"
            }
            width={20}
            height={20}
          />
        </button>
        <button
          type="button"
          className="music-player-hero-control"
          onClick={() => nextTrack(true)}
          title="下一首"
          aria-label="下一首"
        >
          <Icon
            icon="material-symbols:skip-next-rounded"
            width={18}
            height={18}
          />
        </button>
      </div>
      <div className="music-player-hero-progress">
        {/* 非受控：进度由 syncPlaybackDom 直接写 DOM，避免每帧重渲染 */}
        <input
          ref={heroProgressInputRef}
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          defaultValue={0}
          onChange={seek}
          aria-label="播放进度"
          style={{ background: trackGradient(0) }}
        />
        <span className="music-player-hero-times">
          <span ref={heroCurTimeRef}>00:00</span>
          {" / "}
          <span ref={heroDurTimeRef}>00:00</span>
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* 凹槽在 NavBar 里，等挂载后拿到节点再 portal 进去；
          首页首屏时播放器改站到 Banner 里的大播放器位置 */}
      {!heroActive && dockSlot ? createPortal(dock, dockSlot) : null}
      {heroActive && heroSlot ? createPortal(hero, heroSlot) : null}

      {/* 面板拆成两张卡片：左边播放器 + 歌单，右边完整歌词 */}
      <div
        ref={panelRef}
        id="music-player-panel"
        className={"music-player-panel" + (isOpen ? " is-open" : "")}
        style={panelStyle}
        data-pane={pane}
        data-hero={heroActive || undefined}
        role="dialog"
        aria-label="音乐播放器"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        {/* 手机端整张播放器的模糊封面底（PC 隐藏，PC 用的是歌词卡那一层） */}
        <div className="music-player-bg is-sheet" aria-hidden="true">
          {coverBgLayers}
        </div>
        <div className="music-player-card music-player-card-player">
          <div className="music-player-head">
            <div className="music-player-cover">
              <Icon icon="mingcute:music-fill" width={22} height={22} />
              {currentSong?.pic && (
                <img
                  className="music-player-cover-img"
                  src={currentSong.pic}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // 部分歌的封面接口会失效，失败就藏掉图片露出垫底图标
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
            <div className="music-player-meta">
              <div className="music-player-name" title={currentSong?.name}>
                {isPlaying && (
                  <span className="music-player-eq" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
                <span className="music-player-name-text">
                  {currentSong?.name || "歌单加载中…"}
                </span>
              </div>
              <div className="music-player-artist" title={currentSong?.artist}>
                {currentSong?.artist || "稍等一下喵"}
              </div>
            </div>
            <button
              className="music-player-lyricstoggle"
              data-on={lyricsOpen || undefined}
              onClick={toggleLyricsCard}
              title={lyricsOpen ? "隐藏歌词卡片" : "显示歌词卡片"}
              aria-label={lyricsOpen ? "隐藏歌词卡片" : "显示歌词卡片"}
              aria-pressed={lyricsOpen}
            >
              <Icon
                icon="material-symbols:lyrics-rounded"
                width={20}
                height={20}
              />
            </button>
            <button
              className="music-player-close"
              onClick={() => setIsOpen(false)}
              title="收起播放器"
              aria-label="收起播放器"
            >
              <Icon icon="solar:close-circle-linear" width={20} height={20} />
            </button>
          </div>

          <div className="music-player-progress">
            <span className="music-player-time" ref={curTimeRef}>
              00:00
            </span>
            {/* 非受控：进度由 syncPlaybackDom 直接写 DOM，避免每帧重渲染 */}
            <input
              ref={progressInputRef}
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              defaultValue={0}
              onChange={seek}
              aria-label="播放进度"
              style={{ background: trackGradient(0) }}
            />
            <span className="music-player-time" ref={durTimeRef}>
              00:00
            </span>
          </div>

          {/* 左：播放模式；中：上一首/播放/下一首；右：音量 */}
          <div className="music-player-controls">
            <div className="music-player-ctl-left">
              <button
                className="music-player-control"
                onClick={switchPlayMode}
                title={`播放模式：${PLAY_MODE_LABEL[playMode]}`}
                aria-label={`播放模式：${PLAY_MODE_LABEL[playMode]}`}
              >
                <Icon icon={PLAY_MODE_ICON[playMode]} width={22} height={22} />
              </button>
            </div>
            <div className="music-player-ctl-center">
              <button
                className="music-player-control"
                onClick={prevTrack}
                title="上一首"
                aria-label="上一首"
              >
                <Icon
                  icon="material-symbols:skip-previous-rounded"
                  width={24}
                  height={24}
                />
              </button>
              <button
                className="music-player-play"
                onClick={togglePlay}
                title={isPlaying ? "暂停" : "播放"}
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                <Icon
                  icon={
                    isPlaying
                      ? "material-symbols:pause-rounded"
                      : "material-symbols:play-arrow-rounded"
                  }
                  width={26}
                  height={26}
                />
              </button>
              <button
                className="music-player-control"
                onClick={() => nextTrack(true)}
                title="下一首"
                aria-label="下一首"
              >
                <Icon
                  icon="material-symbols:skip-next-rounded"
                  width={24}
                  height={24}
                />
              </button>
            </div>
            <div className="music-player-ctl-right">
              <div className="music-player-volume" title="音量">
                <Icon
                  icon="material-symbols:volume-up"
                  width={22}
                  height={22}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(volume * 100)}
                  onChange={changeVolume}
                  className="music-player-volume-slider"
                  aria-label="音量"
                  style={{
                    background: trackGradient(Math.round(volume * 100)),
                  }}
                />
              </div>
            </div>
          </div>

          {/* 手机端只放得下一张内容卡，用分段按钮在歌单/歌词之间切 */}
          <div
            className="music-player-tabs"
            role="tablist"
            aria-label="播放器内容"
          >
            <button
              type="button"
              role="tab"
              aria-selected={pane === "list"}
              onClick={() => setPane("list")}
            >
              歌单
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={pane === "lyrics"}
              onClick={() => setPane("lyrics")}
            >
              歌词
            </button>
          </div>

          <section
            className="music-player-pane music-player-pane-list"
            aria-label="播放列表"
          >
            <div className="music-player-pane-head">
              <Icon
                icon="material-symbols:queue-music-rounded"
                width={16}
                height={16}
              />
              <span>播放列表</span>
              <span className="music-player-pane-count">
                {playlist.length} 首
              </span>
            </div>
            <div className="music-player-search">
              <Icon icon="solar:magnifer-linear" width={15} height={15} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索歌名 / 歌手"
                aria-label="搜索歌单"
                spellCheck={false}
              />
              {query && (
                <button
                  className="music-player-search-clear"
                  onClick={() => setQuery("")}
                  title="清空搜索"
                  aria-label="清空搜索"
                >
                  <Icon icon="solar:close-circle-bold" width={14} height={14} />
                </button>
              )}
            </div>
            <div
              className="music-player-list"
              ref={listRef}
              role="listbox"
              aria-label="播放列表"
              onScroll={onListScroll}
              onWheel={markUserScroll}
              onTouchMove={markUserScroll}
            >
              {padTop > 0 && (
                <div style={{ height: padTop }} aria-hidden="true" />
              )}
              {rows.map(({ song, index }) => (
                <div
                  key={song.id ?? index}
                  role="option"
                  data-key={rowKey(song, index)}
                  aria-selected={index === currentIndex}
                  data-active={index === currentIndex || undefined}
                  className={
                    "music-player-track" +
                    (index === currentIndex ? " active" : "")
                  }
                  title={`${song.name} - ${song.artist}`}
                  onClick={() => void goToTrack(index, true)}
                >
                  <span className="music-player-track-cover">
                    <Icon icon="mingcute:music-fill" width={14} height={14} />
                    {song.pic &&
                      (!listScrolling ||
                        revealedCovers.current.has(rowKey(song, index))) && (
                        <img
                          className="music-player-track-cover-img"
                          src={song.pic}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                  </span>
                  <span className="music-player-track-meta">
                    <span className="music-player-track-name">{song.name}</span>
                    <span className="music-player-track-artist">
                      {song.artist}
                    </span>
                  </span>
                  {index === currentIndex && isPlaying && (
                    <span className="music-player-track-eq" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </div>
              ))}
              {padBottom > 0 && (
                <div style={{ height: padBottom }} aria-hidden="true" />
              )}
              {!playlist.length && (
                <div className="music-player-empty">歌单加载中…稍等一下喵</div>
              )}
              {playlist.length > 0 && !totalRows && (
                <div className="music-player-empty">没有找到这首歌喵</div>
              )}
            </div>
          </section>
        </div>

        <div
          className={
            "music-player-lyrics-slot" + (lyricsOpen ? "" : " is-hidden")
          }
        >
          <div className="music-player-card music-player-card-lyrics">
            <div className="music-player-bg is-lyrics" aria-hidden="true">
              {coverBgLayers}
            </div>
            <div className="music-player-pane-head">
              <Icon
                icon="material-symbols:lyrics-rounded"
                width={16}
                height={16}
              />
              <span>歌词</span>
              {!!allLyrics.length && (
                <span className="music-player-pane-count">
                  {Math.min(currentLyricIndex + 1, allLyrics.length)} /{" "}
                  {allLyrics.length}
                </span>
              )}
            </div>
            <div className="music-player-lyrics" ref={lyricsBoxRef}>
              {allLyrics.length ? (
                allLyrics.map((line, i) => {
                  // 日文原文是主行（唱到哪填到哪），中文翻译作为小字放下面
                  const hasSub = !!line.pairlyric;
                  const current = i === currentLyricIndex;
                  return (
                    <div
                      key={`${line.time}-${i}`}
                      data-lyric-index={i}
                      className={
                        "music-player-lyric-line" +
                        (current ? " is-current" : "") +
                        (i < currentLyricIndex ? " is-passed" : "")
                      }
                      onClick={() => jumpToLyric(line.time, i)}
                      title="跳到这句"
                    >
                      <div className="music-player-lyric-main">
                        {current
                          ? renderKaraoke(line, i)
                          : line.text || "------"}
                      </div>
                      {hasSub && (
                        <div className="music-player-lyric-sub">
                          {line.pairlyric}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="music-player-empty">这首歌还没有歌词喵</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 手机端的悬浮圆钮：Banner 里有大播放器时让位，滚进正文后才浮出来 */}
      {!heroActive && (
        <button
          ref={mobileBtnRef}
          className="music-player-button"
          onClick={togglePanel}
          title={isOpen ? "收起播放器" : "展开播放器"}
          aria-expanded={isOpen}
          aria-controls="music-player-panel"
          aria-label="音乐播放器"
        >
          {/* 进度环播过就常驻：暂停时 sync 不再推进，圆环自然停在当前进度 */}
          {hasPlayed && (
            <svg
              className="music-player-progress-ring"
              width="44"
              height="44"
              viewBox="0 0 44 44"
              aria-hidden="true"
            >
              <circle
                ref={ringRef}
                className="music-player-progress-ring-circle"
                strokeWidth="2"
                fill="transparent"
                r={radius}
                cx="22"
                cy="22"
              />
            </svg>
          )}
          <Icon
            className="music-player-button-icon"
            icon="mingcute:music-fill"
            width={22}
            height={22}
          />
          {/* 播过歌之后按钮里换成当前封面，加载失败就退回到音符图标 */}
          {hasPlayed && currentSong?.pic && (
            <img
              className="music-player-button-cover"
              src={currentSong.pic}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              style={{ animationPlayState: isPlaying ? "running" : "paused" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </button>
      )}

      <audio
        ref={audioRef}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onError={onError}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        preload="metadata"
      />
    </>
  );
}
