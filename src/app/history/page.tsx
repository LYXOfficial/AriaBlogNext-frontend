import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/History.css";

import Link from "next/link";
import { PageRightSide } from "@/components/RightSide";
import { TwikooBaseComment } from "@/components/thirdpartyjs/Twikoo";
import FancyBox from "@/components/thirdpartyjs/FancyBox";
import CollectionHeader from "@/components/CollectionHeader";
import { siteConfigs } from "@/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `四年 | ${siteConfigs.title}`,
  description:
    "2022 到 2026，博客从 Hexo Butterfly 魔改一路迁到 Next.js 的折腾记录：时间线、翻新过的模块、不同时期的截图和还没收尾的坑。",
};

type HistoryEvent = {
  date: string;
  title: string;
  desc: string;
  tags?: string[];
  link?: { href: string; label: string };
};

type HistoryYear = {
  year: string;
  sub: string;
  posts: number;
  commits: number;
  events: HistoryEvent[];
};

// 静态快照，数据截至 2026-11-28（文章数与字数来自线上接口，提交数来自各仓库 git 统计）。
const DAYS = 1638;
const POSTS = 85;
const WORDS = "23.1 万";
const COMMITS = 1587;
const FRONTEND_COMMITS = 385;

const years: HistoryYear[] = [
  {
    year: "2022",
    sub: "Hexo + Butterfly 起步，疯狂魔改 Acryple",
    posts: 32,
    commits: 617,
    events: [
      {
        date: "06-04",
        title: "小站正式建站",
        desc: "在之前那台坏掉的树莓派和没配完的 WordPress 之后，改用 Hexo 配 Butterfly 搭起了现在的博客。页脚的运行天数就是从这天开始算的。",
        tags: ["Hexo", "Butterfly"],
      },
      {
        date: "07-08",
        title: "第一次部署到 Vercel",
        desc: "最早的项目叫 lyxoffpage，挂在 lyxoffpage.vercel.app；接下来两个月又白嫖并换过两轮 eu.org 免费二级域。",
        tags: ["Vercel"],
      },
      {
        date: "08-15",
        title: "开始魔改 Butterfly",
        desc: "先做了宽屏适配，紧接着写出自定义右键菜单 v2、侧边栏插件，以及同时兼容 Twikoo、Waline 和 Valine 的留言弹幕。右键菜单和弹幕的思路后来都带进了 Next.js 版本。",
        link: { href: "/posts/d1fc759", label: "Hexo Butterfly 宽屏适配指北" },
      },
      {
        date: "08-26",
        title: "拆出自改主题 Acryple，源码推上 GitHub",
        desc: "基于 Butterfly 4.2.2 拆出自己的主题 Acryple，同一天建了 blogsource 仓库。后面整整两年的旧站改动都记在这个仓库里。",
        tags: ["Acryple", "blogsource"],
      },
      {
        date: "10 — 12",
        title: "连载魔改日记，两个月推了 476 次提交",
        desc: "十月开始连载《博客魔改日记》，十一月 153 次、十二月 323 次提交。这段时间往站里塞了不少小玩意：追番页、音乐馆、便携小空调、电子木鱼、每日早报、IE 劝退页（noie.html），甚至给扫后台的爬虫留了假的 wp-admin.html；年末还折腾过用 Wexagonal 在线发文章。",
        tags: ["魔改"],
        link: { href: "/posts/ac792cf4", label: "博客魔改日记（1）" },
      },
    ],
  },
  {
    year: "2023",
    sub: "页面趋于稳定，重心转向写 OI 题解",
    posts: 32,
    commits: 196,
    events: [
      {
        date: "01-22",
        title: "基于腾讯云 CloudBase 的 Twikoo 评论弹幕",
        desc: "给 Twikoo 写了配套的评论弹幕扩展，把留言墙和评论区联动起来。",
        tags: ["Twikoo"],
        link: {
          href: "/posts/8f578896",
          label: "基于腾讯云 Cloudbase 的 Twikoo 评论弹幕扩展",
        },
      },
      {
        date: "02 — 08",
        title: "只做小修小补，32 篇里有 20 篇是 OI",
        desc: "全年提交从 617 次降到 196 次，基本只在二月和八月集中改过两轮 _config.acryple.yml 和 settings.js。页面维持着 2022 年底定型的样子，博客这一年主要用来记 OI 题解和笔记。",
        tags: ["OI"],
      },
    ],
  },
  {
    year: "2024",
    sub: "换域名，从零用 Next.js 重写全站",
    posts: 10,
    commits: 475,
    events: [
      {
        date: "06-30",
        title: "启用 blog.yaria.top",
        desc: "原来的 yisous.xyz 续费涨到 85 块，换成一年 32 块的 .top 域名，顺手把 blog 子域独立出来。",
        tags: ["域名"],
      },
      {
        date: "07",
        title: "Hexo 时代最后一轮折腾",
        desc: "七月在 blogsource 里连推 54 次提交，补了友链申请入口、关掉首页樱花特效，又修了 Twikoo 版本和 Node 构建报错。越改越觉得魔改后的主题文件太乱，开始动念头重写。",
        tags: ["Hexo"],
      },
      {
        date: "08-25",
        title: "建新仓库，十天搭出 Next.js 初版",
        desc: "从零学 Next.js，十天里一口气把归档、Iconify、Markdown 渲染、KaTeX、文章目录、评论弹幕、说说、RSS/Atom、朋友圈、深色模式和搜索框全搭了出来，还配套写了 FastAPI 后端和管理后台。",
        tags: ["Next.js", "FastAPI"],
      },
      {
        date: "09-03",
        title: "正式切到新站，发《Next.js 迁移小记》",
        desc: "文章里记了离开 Hexo 的具体原因：魔改代码难以维护，静态站点也撑不起自定义接口和后台。两天后（09-05）顺手把前端全量迁到了 TypeScript。",
        link: { href: "/posts/dka7xhko", label: "新篇章：Next.js 迁移小记" },
      },
      {
        date: "09 — 12",
        title: "补齐页面与重写 Markdown 渲染链路",
        desc: "九月接上 TianliGPT 摘要、补齐关于页、留言板和行内 Prompt 标签；十一月加上分类和标签页；十二月中旬把 Markdown 渲染重做了一轮（转向 raw Markdown 转 JSX 并重写外挂标签）。到年底新前端累计 236 次提交。",
        tags: ["TypeScript", "Markdown"],
      },
    ],
  },
  {
    year: "2025",
    sub: "图床事故与搬迁 R2，年底升上 Next.js 16",
    posts: 5,
    commits: 130,
    events: [
      {
        date: "06 — 08",
        title: "7bu 图床到期 + 被黑删文，全量迁到 Cloudflare R2",
        desc: "原图床到期后全站图片 404，同期又碰上被黑删文。靠群友的 OneDrive 备份拼链接捞回六百多张图，迁到自建 R2（img.0v0.my）并批量替换文章链接，顺手把 Markdown 渲染换成了 Innei 的 md2jsx。",
        tags: ["R2", "事故"],
        link: {
          href: "/posts/730cf317",
          label: "记博客图片丢失与被黑删文",
        },
      },
      {
        date: "08-10",
        title: "三周年、个人主页、Docker 与自建摘要",
        desc: "三周年另开了一个个人主页项目，把头像、天气和歌单摆进一屏；中旬补上 Docker 部署和 standalone 构建，群友 snowykami 和 Android-KitKat 也提了 PR 帮忙改分页、容器内网连后端和按钮对齐；8 月 22 日换掉 TianliGPT，改用自建 AI 摘要接口。",
        tags: ["Docker", "PR"],
        link: { href: "/posts/141bcde3", label: "博客三周年、与杂谈" },
      },
      {
        date: "12-08",
        title: "踩着 CVE 升级到 Next.js 16",
        desc: "为了修安全漏洞把框架升到 Next.js 16，同步改了依赖和缓存刷新逻辑。",
        tags: ["Next.js 16"],
      },
    ],
  },
  {
    year: "2026",
    sub: "秋季大翻新：界面重做、Go 后端、语义搜索和播放器",
    posts: 6,
    commits: 169,
    events: [
      {
        date: "10-15",
        title: "清理旧依赖，上线友链自助申请",
        desc: "把评论里的旧表情 CDN 从 tianli0 切到 jsdelivr，升了 Twikoo 2.0 和 next-mdx-remote 6；上线友链申请页，支持整段粘贴后正则解析、自动取头像主色，以及后台逐字段对比审批。",
        tags: ["Twikoo 2.0", "友链"],
      },
      {
        date: "10-19 — 10-24",
        title: "集中翻新全站界面",
        desc: "重做首页全屏 Banner、滚动吸附和文章卡片视差；补进超时空辉夜姬、轻音少女和孤独摇滚三套表情；全站六十多处图标从 Font Awesome 换到 Solar；侧栏改成可切换面板；归档 / 分类 / 标签 / 友链统一收口到 CollectionHeader；同期把友链朋友圈迁到自建定时爬取 + 兼容层。",
        tags: ["改版", "Solar", "朋友圈"],
      },
      {
        date: "10-27 — 10-30",
        title: "切到 Go 后端，搜索接上语义向量",
        desc: "56 条接口用 Go（Fiber）重写，经翻译层凌晨平滑切流，前端 API 统一收进 utils/api；搜索改成 bge-m3 向量 + 关键词两路 RRF 融合，结果区分「语义」和「模糊」命中。",
        tags: ["Go", "语义搜索"],
      },
      {
        date: "11-01 — 11-08",
        title: "4.5 周年、Twikoo 搬国内、全站音乐播放器",
        desc: "发《博客 4.5 周年祭》；把 Twikoo 迁到国内服务器并补上楼中楼总数统计；上线带逐字歌词和歌单搜索的音乐播放器，一周内从左下角按钮迭代到顶栏凹槽，再调整为 Banner 内的横条卡片；11 月 8 日把顶栏分组改由配置推导，加上切页平移下划线。",
        tags: ["播放器", "导航"],
        link: { href: "/posts/5766f9d3", label: "博客 4.5 周年祭" },
      },
      {
        date: "11-24",
        title: "升到 Next.js 16.4.6，整理这份四年记录",
        desc: "把前端依赖升到 Next.js 16.4.6，顺手翻了几个仓库的提交记录，整理出你现在看到的这个页面。",
        tags: ["Next.js"],
      },
      {
        date: "11-28",
        title: "全站首屏与加载性能优化",
        desc: "拿掉阻塞首屏的 InitialLoader 遮罩和全局 FontAwesome / 衬线字体引入，HomeBanner 改成服务端选图配高优先级 <img> 直出 LCP；SearchBox、Swiper、音乐播放器面板和 Twikoo 首页计数全改成按需或 requestIdleCallback 延迟加载，视差与滚动监听合批进 rAF，减少重排卡顿。",
        tags: ["性能优化", "LCP"],
      },
    ],
  },
];

// 挑几块改动比较大、前后端体验差异明显的功能，按模块写清楚怎么改的。
const features = [
  {
    tag: "性能",
    title: "首屏 LCP 与按需加载改造",
    desc: "移除了全屏加载遮罩和阻塞渲染的全局字体 / FA 样式表，Banner 改用服务端选图 + fetchPriority=\"high\" 的 <img>，给图床加 preconnect；搜索弹窗、Swiper、音乐面板与歌词字体、Twikoo 首页计数和提示框均改为按需或空闲时再加载，视差和导航下划线合批到 rAF。",
  },
  {
    tag: "首屏",
    title: "Banner 与五种输入分开处理的滚动吸附",
    desc: "全屏背景加了上下渐变遮罩，桌面端有很轻的鼠标视差。滚轮、手指触摸、拖动滚动条、键盘和脚本滚动分别判断，拖滚动条时不会强行回拉，从正文滚回顶部后也要再往上推一下才切回 Banner。",
  },
  {
    tag: "列表页",
    title: "归档、分类、标签、友链统一版式",
    desc: "四套原本各长各的页面收成同一套结构：短粉线标题、右侧计数和紧凑卡片。归档补了年份与月份入口，分类用主题色圆点、标签用 # 区分。",
  },
  {
    tag: "首页",
    title: "卡片微视差与可切换侧栏",
    desc: "桌面端文章卡片会随鼠标轻微偏移；右侧栏从一长串信息墙拆成可切换面板，评论、标签和站点信息各占一屏，手机上不用一路滑到底。",
  },
  {
    tag: "图标与深色",
    title: "换用 Solar 图标，并逐页排查深色模式",
    desc: "把混用的 Font Awesome 换掉六十来处，品牌图标保留 FA；页脚徽章改成图标配文字并单独配深浅色；每个页面在深色模式下单独过了一遍，修掉评论框聚焦白底白字、引用块发白这些细节。",
  },
  {
    tag: "文章排版",
    title: "折叠块、黑幕、公式与示例页",
    desc: "折叠块先测真实高度再做展开动画；黑幕改成默认模糊，悬停或键盘聚焦才显形；长公式的横向滚动挪到外层容器，短公式不再多一条滚动条；另外加了 /examples 页面集中看外挂标签效果。",
  },
  {
    tag: "搜索",
    title: "bge-m3 语义召回 + 关键词融合",
    desc: "正文切块转向量后和关键词两路做 RRF 融合，搜「怎么给博客加上评论功能」这种正文里没原样出现过的句子也能找到。相关性阈值 0.52 是拿误召回样例量出来的，代价是每次搜索多 240ms。",
  },
  {
    tag: "评论",
    title: "Twikoo 2.0、楼中楼计数与国内节点",
    desc: "评论服务从云函数搬到群友提供的国内服务器，加了模型防垃圾审核；并在 fetch 层拦截列表响应，额外查一次含回复的总数，让标题里的「N 条评论」把楼中楼也算进去。",
  },
  {
    tag: "播放器",
    title: "全站音乐播放器与逐词歌词",
    desc: "直接复用个人主页的歌单，支持逐词歌词高亮和歌单搜索。歌词切到站内代理，列表滚动区分了短距离平滑和长距离直接定位。",
  },
  {
    tag: "表情与说说",
    title: "新表情包与行内小图渲染",
    desc: "补了超时空辉夜姬、轻音少女、孤独摇滚和邦邦合集四套表情；说说里的表情改成行内小图，不再和正文图片一起弹灯箱。",
  },
];

// 前后两代在样式和组件上的主要变化。
const techRows: { label: string; from: string; to: string }[] = [
  {
    label: "站点框架",
    from: "Hexo + Butterfly / Acryple",
    to: "Next.js App Router 自写页面",
  },
  {
    label: "样式组织",
    from: "主题外面叠补丁 CSS",
    to: "src/styles 一组件一文件",
  },
  { label: "颜色圆角", from: "散落各处的色值", to: "--aria-* 主题变量" },
  {
    label: "过渡动效",
    from: "随手写的时长和曲线",
    to: "--dur-* / --ease-* 令牌",
  },
  { label: "界面图标", from: "Font Awesome", to: "Solar（品牌图标保留 FA）" },
  {
    label: "列表页头",
    from: "四套页面各写各的",
    to: "CollectionHeader 统一组件",
  },
  {
    label: "折叠块",
    from: "原生 details 瞬间弹开",
    to: "AnimatedDetails 测量高度展开",
  },
  { label: "黑幕样式", from: "纯黑遮挡块", to: "默认模糊，悬停/聚焦显形" },
  { label: "公式滚动", from: "单个公式自带滚动条", to: "外层容器统一横向滚动" },
];

// 已知还没收尾或者踩完坑放弃的地方。
const pending = [
  "首屏滚动吸附在手机真机上能用，但离最顺滑的手感还差一点，目前优先等 scrollend 再退回静止判断，已经是折腾了好几轮后相对稳妥的方案。",
  "语义搜索的向量化每次会多出大约 240ms，现在八十多篇文章感觉不明显，后面文章多了要再想办法压一压。",
  "试过在 Next.js 16 里手写拦截链接做 View Transitions，结果会把站内导航卡死，最后回滚了；部分早期文章的 600px 低清封面也试过七种 CSS 方案，源图分辨率不够确实救不回来，这些坑现在都记在文档里提醒别再踩。",
];

const quotes = [
  {
    text: "十年之约，但愿吧。",
    meta: "2024 · 二周年",
    href: "/posts/a12c6b5d",
  },
  {
    text: "与你的日常，真的就是奇迹了呀！",
    meta: "2025 · 三周年",
    href: "/posts/141bcde3",
  },
  {
    text: "至少现在它还在，我也还在折腾它。",
    meta: "2026 · 4.5 周年",
    href: "/posts/5766f9d3",
  },
];

const related = [
  { href: "/posts/d1fc759", title: "Hexo Butterfly 宽屏适配指北" },
  { href: "/posts/11eb4aac", title: "自定义右键菜单升级版" },
  { href: "/posts/69707535", title: "留言弹幕界面增强版" },
  { href: "/posts/4ae2ec41", title: "Butterfly 侧边栏插件" },
  { href: "/posts/ac792cf4", title: "博客魔改日记（1）" },
  { href: "/posts/becc831a", title: "博客魔改日记（2）" },
  { href: "/posts/dka7xhko", title: "新篇章：Next.js 迁移小记" },
  { href: "/posts/5766f9d3", title: "博客 4.5 周年祭" },
];

// 挑了六个有代表性的画面（2023 Hexo、2024 Next.js 初版两张、2025 个人主页、2026 新版两张），
// 保持两列三行对齐，去掉了同期重复度太高的几张 Banner 截图和落单的竖屏图。
const gallery = [
  {
    src: "https://img.0v0.my/2026/11/24/history/history-hexo-friends.webp",
    title: "2023 · Hexo / Butterfly 友链页",
    note: "彩色方块卡片配头像主色，是 Acryple 魔改时期留下的旧截图。",
  },
  {
    src: "https://img.0v0.my/2026/11/24/history/history-2024-next-home.webp",
    title: "2024-09 · Next.js 第一版首页",
    note: "迁移小记发布当天：顶部说说条、横向分类栏、大封面卡片和右侧信息栏。",
  },
  {
    src: "https://img.0v0.my/2026/11/24/history/history-2024-next-fcircle.webp",
    title: "2024-09 · Next.js 初版朋友圈",
    note: "同期搬过来的友链朋友圈页面，顶栏带订阅统计，下面排成三列卡片。",
  },
  {
    src: "https://img.0v0.my/2026/11/24/history/history-2025-homepage.webp",
    title: "2025-08 · 另写的个人主页",
    note: "三周年顺手搭的个人主页，头像、天气和歌单放在一屏里，后来博客的歌单也是从这边搬过来的。",
  },
  {
    src: "https://img.0v0.my/2026/11/24/history/history-2026-11-03.webp",
    title: "2026-11-03 · 新版首屏与左下角悬浮播放器",
    note: "全屏 Banner、居中标语和搜索 / 随便逛逛入口已经就位，左下角刚加上音乐悬浮按钮。",
  },
  {
    src: "https://img.0v0.my/2026/11/24/history/history-2026-11-08.webp",
    title: "2026-11-08 · Banner 内嵌音乐卡片",
    note: "把播放器收进 Banner 下方的半透明横条里，切歌和进度直接在首屏操作。",
  },
];

// 组件与模块清单，方便以后回查各块代码负责什么、踩过什么坑。
const catalog = [
  {
    title: "全局骨架与导航",
    note: "全站共用的外层组件",
    items: [
      {
        name: "NavBar",
        desc: "顶栏导航。分组从 config 自动推导，下划线随切页平移（rAF 合批避免重排）；去掉 lodash/throttle 改手写节流，搜索弹窗改为点击时动态挂载。",
      },
      {
        name: "Footer",
        desc: "页脚徽章由图片改为图标加文字，每项可独立配色并区分深浅模式；运行天数从 2022-06-04 起算。",
      },
      {
        name: "MusicPlayer",
        desc: "支持主页歌单、逐词歌词和歌单搜索；面板和 Noto Serif SC 歌词字体改为打开时按需挂载与加载。",
      },
      {
        name: "MenuButtons",
        desc: "首页右侧快捷按钮（随便逛逛、开往等），随滚动方向自动显隐。",
      },
      {
        name: "RightButtons",
        desc: "文章页与独立页右侧悬浮按钮：回到顶部、目录开关和跳去评论区。",
      },
      {
        name: "Welcome / LicenseTips",
        desc: "首次访问提示语与版权 / 存储提示，node-snackbar 和农历库改为异步按需加载；原本阻塞首屏的 InitialLoader 遮罩已移除。",
      },
      {
        name: "Busuanzi / Pangu / FancyBox / ShareJs",
        desc: "访问量统计、中英文自动加空格、图片灯箱和分享的轻量封装。",
      },
    ],
  },
  {
    title: "首页模块",
    note: "首屏、文章流与侧栏",
    items: [
      {
        name: "HomeBanner",
        desc: "全屏首屏背景与滚动吸附逻辑，区分滚轮、触摸、滚动条拖动、键盘和脚本滚动。",
      },
      {
        name: "PostCard",
        desc: "文章卡片，展示封面、分类、摘要、日期和标签；分页链接统一指向 /page/n。",
      },
      {
        name: "PostCardParallax",
        desc: "桌面端卡片轻微跟随鼠标偏移，触屏和减少动态效果模式下关闭。",
      },
      {
        name: "PostCategoryBar",
        desc: "首页横向分类条，支持鼠标滚轮横向滚动，选中项带浅粉底色。",
      },
      { name: "HomeSpeaks", desc: "首页顶部说说展示条，表情按行内小图渲染。" },
      {
        name: "HomeASides / HomeAsidePanels",
        desc: "右侧栏切换面板，把最新评论、标签云和站点信息分屏收在一起。",
      },
      {
        name: "PostPageStart",
        desc: "仅挂载在分页路由下，翻页后自动回到文章列表顶部，避免干扰首页 Banner。",
      },
    ],
  },
  {
    title: "文章页与外挂标签",
    note: "正文渲染与自定义语法",
    items: [
      {
        name: "PostHeader",
        desc: "文章标题、发布与更新时间、分类标签和封面，移动端单独调过排版。",
      },
      {
        name: "PostContent",
        desc: "Markdown 主渲染层，统一处理表格左对齐网格、代码块、图片说明和脚注。",
      },
      {
        name: "PostEnd",
        desc: "文末版权声明、AIGC 标识小圆标和去重后的文章标签。",
      },
      {
        name: "PostSummary",
        desc: "AI 摘要卡片，后端走 SiliconFlow 并带缓存冷却。",
      },
      {
        name: "TocBody / TocUpdater",
        desc: "侧栏文章目录、阅读进度与当前章节高亮。",
      },
      {
        name: "AnimatedDetails",
        desc: "折叠块组件，测量真实高度后用 Web Animations API 做 800ms 展开动画，减少动态效果时直接切换。",
      },
      {
        name: "HighLightCode",
        desc: "代码高亮、一键复制和软换行切换；放行 summary 内的按钮点击。",
      },
      {
        name: "KaTex",
        desc: "行内公式包在 .aria-math-inline 中，横向滚动交给外层容器；块级公式独立滚动。",
      },
      {
        name: "Folding / Prompt / Chat / Note / CheckBox",
        desc: "外挂标签集合。Prompt 问号改为行内 SVG，支持触摸开关、键盘操作和视口边界翻转。",
      },
      {
        name: "黑幕 del",
        desc: "默认 blur(0.25em) 叠加浅底色，悬停或 focus-visible 显形；带 .noheimu 类时保持原删除线。",
      },
      { name: "examples", desc: "外挂标签示例页，改样式时可以直接对照检查。" },
    ],
  },
  {
    title: "浏览页与友链",
    note: "归档、分类、标签与友链生态",
    items: [
      {
        name: "CollectionHeader",
        desc: "归档、分类、标签和友链共用的页头：短粉线、标题和右侧统计数字。",
      },
      {
        name: "CollectionSwitcher",
        desc: "详情页顶部的切换面板，收起状态加了 inert 防止键盘误聚焦。",
      },
      {
        name: "TagIndex",
        desc: "标签与分类共用索引页，客户端排序，路由参数统一 encodeURIComponent 防止中文和 C++ 404。",
      },
      {
        name: "Archives",
        desc: "年份与月份入口、年份水印和左侧细线，和分类/标签详情页共用样式。",
      },
      {
        name: "FriendLinks / FriendLinkItem",
        desc: "友链网格卡片，支持头像提取主题色和深色模式配色。",
      },
      {
        name: "FlinkApply",
        desc: "友链自助申请表单：整段粘贴后纯正则解析字段、头像取色、三态提示，拦截无实质变化的重复修改。",
      },
      {
        name: "FriendCircle",
        desc: "友链朋友圈前端页，背后由自建定时爬取生成静态 JSON 并通过兼容层承接旧接口。",
      },
    ],
  },
  {
    title: "搜索与数据请求",
    note: "召回策略与接口兜底",
    items: [
      {
        name: "SearchBox",
        desc: "全站搜索弹窗，关键词先做正则转义再高亮，搜 c++ 不会再抛异常。",
      },
      {
        name: "语义搜索",
        desc: "正文切块后用 bge-m3 生成向量，与关键词结果做 RRF 融合，阈值 0.52，界面区分语义与模糊命中。",
      },
      {
        name: "utils/api",
        desc: "全站接口请求统一入口，检查 res.ok 并用空数组兜底，避免单个接口抖动带崩页面。",
      },
    ],
  },
  {
    title: "评论与表情",
    note: "Twikoo 相关定制",
    items: [
      {
        name: "Twikoo 封装",
        desc: "升级至 2.0 并重做样式，单独修了深色模式下输入框对比度和背景图显示。",
      },
      {
        name: "CommentBarrage",
        desc: "评论弹幕，统一了弹幕里的表情尺寸和图标对齐。",
      },
      {
        name: "楼中楼计数补丁",
        desc: "在 fetch 层拦截 COMMENT_GET，并行查询含回复的总数覆写 count；跳过搜索态并去掉 content-length。",
      },
      {
        name: "owoBig",
        desc: "表情悬停放大改为事件委托，评论区重新渲染后也能正常工作。",
      },
      {
        name: "评论服务搬迁",
        desc: "从云函数迁移到国内服务器（comment.aria.android99.com），响应更快也不用担心额度。",
      },
      {
        name: "表情合集",
        desc: "内置超时空辉夜姬、轻音少女、孤独摇滚和邦邦合集，说说里的表情按行内小图展示。",
      },
    ],
  },
  {
    title: "样式与图片策略",
    note: "CSS 架构与避坑记录",
    items: [
      {
        name: "一组件一 CSS",
        desc: "src/styles 按组件拆文件，类名前缀随组件走，不再往外部主题上硬覆盖。",
      },
      {
        name: "设计变量",
        desc: "--aria-* 统一管颜色、圆角、阴影和背景；深色模式主要通过覆写变量实现。",
      },
      {
        name: "动效变量",
        desc: "--dur-fast / base / slow 与 --ease-out / in-out 统一短过渡；0.4s 以上的既有动画保留原时长。",
      },
      {
        name: "响应式断点",
        desc: "以 900px 和 768px 为主要断点，窄屏下侧栏切面板、播放器收成横条卡片。",
      },
      {
        name: "横向溢出治理",
        desc: "html/body 用 overflow-x: clip（保留 sticky 顶栏），配合 #article-container min-width: 0 和 #navbar box-sizing。",
      },
      {
        name: "图片直出",
        desc: "next.config.mjs 开启 images.unoptimized，大图直接走 img.0v0.my，不消耗 Vercel 图片优化额度。",
      },
    ],
  },
  {
    title: "构建、缓存与域名",
    note: "部署侧的配置变化",
    items: [
      {
        name: "技术栈",
        desc: "Next.js 16.4.6 App Router + React 19 + TypeScript 5，Turbopack 构建。",
      },
      {
        name: "缓存策略",
        desc: "列表和文章页 ISR 43200 秒，写操作由后端主动触发 revalidateTag 失效，兜底定时刷新。",
      },
      {
        name: "部署方式",
        desc: "前端主力部署在 Vercel，同时保留 standalone Docker 构建配置。",
      },
      {
        name: "域名变更",
        desc: "eu.org 免费二级域 → yisous.xyz → ariasaka.top → blog.yaria.top，另挂过 blog.0v0.my 和 blog.ariaqwq.icu。",
      },
      {
        name: "仓库统计",
        desc: "blogsource 900 次、新前端 385 次，加上后台和三个后端仓库，合计 1587 次提交。",
      },
    ],
  },
];

const maxPosts = Math.max(...years.map((y) => y.posts));

export default function Page() {
  return (
    <div className="page" id="main-container">
      <style>{`#navbar{position:fixed}`}</style>
      <div id="article-container" className="page history">
        <div id="post-maincontent" className="page history">
          <CollectionHeader
            eyebrow="2022.06 — 2026.11"
            title="四年"
            extra={
              <span className="collection-stat">
                <b>{DAYS}</b> 天
              </span>
            }
          />

          <div className="history-lead">
            <p>（！！！由 Gemini 和 DeepSeek 生成！！！）</p>
            <p>
              从 2022 年夏天用 Hexo
              搭起第一个页面到现在，这个小站换过域名、迁过图床、重写过前后端，
              折腾最多的还是平时打开就能看见的那一层：主题、布局、图标、滚动手感、搜索和评论区。
            </p>
            <p>
              趁着整理四年半的改动，翻了一遍 blogsource
              和新博客仓库的提交记录，把这些年的变化、
              重做过的模块、不同时期的截图和还没收尾的几个坑都记在这里，留个档。
            </p>
          </div>

          <div className="history-stats">
            <div className="history-stat">
              <b>{POSTS}</b>
              <span>篇文章</span>
            </div>
            <div className="history-stat">
              <b>{WORDS}</b>
              <span>字正文</span>
            </div>
            <div className="history-stat">
              <b>{COMMITS}</b>
              <span>次总提交</span>
            </div>
            <div className="history-stat">
              <b>{FRONTEND_COMMITS}</b>
              <span>次新前端提交</span>
            </div>
          </div>

          <div className="history-chart" aria-label="每年文章数">
            {years.map((y) => (
              <div className="history-chart-col" key={y.year}>
                <span className="history-chart-num">{y.posts}</span>
                <div
                  className="history-chart-bar"
                  style={{
                    height: `${Math.max(14, (y.posts / maxPosts) * 96)}px`,
                  }}
                  title={`${y.year} 年 ${y.posts} 篇 / ${y.commits} 次提交`}
                />
                <span className="history-chart-year">{y.year}</span>
              </div>
            ))}
          </div>

          <div className="history-timeline">
            {years.map((y) => (
              <section className="history-year" key={y.year}>
                <div className="history-year-head">
                  <h2>{y.year}</h2>
                  <span className="history-year-sub">{y.sub}</span>
                  <span className="history-year-meta">
                    <b>{y.posts}</b> 篇 ·<b>{y.commits}</b> 次提交
                  </span>
                </div>
                <div className="history-events">
                  {y.events.map((e) => (
                    <article className="history-event" key={e.date + e.title}>
                      <div className="history-event-head">
                        <span className="history-event-date">{e.date}</span>
                        <h3>{e.title}</h3>
                      </div>
                      <p>{e.desc}</p>
                      {(e.tags?.length || e.link) && (
                        <div className="history-event-foot">
                          {e.tags?.map((t) => (
                            <span className="history-tag" key={t}>
                              {t}
                            </span>
                          ))}
                          {e.link && (
                            <Link
                              className="history-event-link"
                              href={e.link.href}
                            >
                              {e.link.label} <span aria-hidden>↗</span>
                            </Link>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <h2 className="history-section-title">
            翻新过的主要模块
            <small>界面与交互</small>
          </h2>
          <div className="history-features">
            {features.map((f) => (
              <article className="history-feature" key={f.title}>
                <span className="history-feature-tag">{f.tag}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </article>
            ))}
          </div>

          <h2 className="history-section-title">
            不同时期的样子
            <small>2023 / 2024 / 2025 / 2026</small>
          </h2>
          <div className="history-gallery">
            {gallery.map((g) => (
              <figure className="history-shot" key={g.src}>
                {/* 复用全站 fancybox-img 类（深色自动压暗，灯箱看原图恢复正常亮度），图床直出不走 Next 优化器 */}
                <a
                  className="history-shot-link"
                  href={g.src}
                  data-fancybox="history-gallery"
                  data-caption={`${g.title} — ${g.note}`}
                  title="点击查看大图"
                >
                  <img
                    className="fancybox-img"
                    src={g.src}
                    alt={g.title}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
                <figcaption>
                  <b>{g.title}</b>
                  <span>{g.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="history-gallery-note">
            2023 到 2025 年的图翻自当年文章和留档截图，2026 年的来自 Vercel
            预览部署（更早的预览已被自动清理）。
          </p>

          <h2 className="history-section-title">
            前后两代的变化
            <small>从魔改主题到自写组件</small>
          </h2>
          <div className="history-tech">
            {techRows.map((r) => (
              <div className="history-tech-row" key={r.label}>
                <span className="history-tech-label">{r.label}</span>
                <span className="history-tech-old">{r.from}</span>
                <span className="history-tech-arrow" aria-hidden>
                  →
                </span>
                <span className="history-tech-new">{r.to}</span>
              </div>
            ))}
          </div>

          <h2 className="history-section-title">
            组件与功能清单
            <small>按模块整理</small>
          </h2>
          <div className="history-catalog">
            {catalog.map((g, i) => (
              <details className="history-group" key={g.title} open={i === 0}>
                <summary>
                  <span className="history-group-title">{g.title}</span>
                  <span className="history-group-note">{g.note}</span>
                  <span className="history-group-count">
                    {g.items.length} 项
                  </span>
                </summary>
                <ul className="history-catalog-list">
                  {g.items.map((it) => (
                    <li key={it.name}>
                      <b>{it.name}</b>
                      <span>{it.desc}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <h2 className="history-section-title">还没收尾的坑</h2>
          <ul className="history-pending">
            {pending.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <h2 className="history-section-title">写在周年文里的话</h2>
          <div className="history-quotes">
            {quotes.map((q) => (
              <figure className="history-quote" key={q.meta}>
                <blockquote>{q.text}</blockquote>
                <figcaption>
                  <span>{q.meta}</span>
                  <Link href={q.href}>读原文 ↗</Link>
                </figcaption>
              </figure>
            ))}
          </div>

          <h2 className="history-section-title">相关文章</h2>
          <div className="history-related">
            {related.map((r) => (
              <Link href={r.href} key={r.href}>
                <span aria-hidden>↗</span>
                <span>{r.title}</span>
              </Link>
            ))}
          </div>

          <p className="history-source">
            以上数字统计截至 2026-11-28（{POSTS} 篇文章、{WORDS}字正文，以及
            blogsource 与新博客五个仓库的提交记录）。
            后面继续更新文章和代码，数字会慢慢对不上，这里先按整理当天的样子留一份记录。
          </p>
        </div>
        <TwikooBaseComment />
        <FancyBox />
      </div>
      <PageRightSide />
    </div>
  );
}
