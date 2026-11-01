"use client";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { siteConfigs } from "@/config";
import {
  COLOR_RE,
  EMAIL_RE,
  isSameAsCurrentLink,
  validateFlinkForm,
} from "@/utils/flinkForm";
import { parseFlinkText } from "@/utils/flinkParse";
import {
  fetchFlinkGroups,
  submitFlinkApplication,
  queryApplicationStatus,
} from "@/utils/api";
import {
  ensureCardColor,
  extractThemeColorFromImage,
} from "@/utils/themeColor";
import "styles/FlinkApply.css";

// 申请须知：逐条勾选后才能提交
const RULES = [
  "请先添加本站友链，特殊情况可以宽容",
  "除非特殊情况不要在留言板发送评论，这只会给博主陡增麻烦；如果确实无法提交或有特殊诉求请在留言板留言",
  "确保你的网站内容健康，无不良、违法信息，拥护中华人民共和国宪法和法律法规，遵循正确价值观，拥护中国共产党领导，拥护中国特色社会主义制度，严禁煽动国家分裂、民族仇恨、和平演变言论",
  "页面广告不能过多，资源站、推广站审核会更严格",
  "如果使用 eu.org、freenom、.pp.ua、.github.io、.vercel.app、.netlify.app 等免费域名，审核将会更加严格",
  "确保网站可以在境内正常访问，排版样式没有出现问题",
  "若你的网站长期无法访问，则我有权单方面删除友链",
  "网站和头像链接必须是 http 或 https 开头的，头像、名称和链接必填",
  "背景色可选，填写 CSS 值如 #ff88aa、rgb(255,136,170) 等，不支持透明色；不建议过浅的颜色，会导致字体不清",
  "建议填写博客主页，方便友链朋友圈获取内容",
  "建议填写正确的邮箱：用于接收申请回执与审核结果，也可以用来自助查询进度",
  "建议网站头像不要有防盗链，否则无法正常显示",
  "审核未通过时，若博主填写了理由会通过邮件告知，可修改后重新提交",
  "你的友链请求将会通过 Github Actions 所运行的 LLM 进行初筛并告知我，最好保证可访问性，并且知悉该点",
];

interface ExistingLink {
  label: string;
  url: string;
  name: string;
  avatar: string;
  descr: string;
  color: string;
}

interface ApplyRecord {
  id: string;
  type: number;
  name: string;
  link: string;
  avatar?: string;
  descr?: string;
  color?: string;
  targetUrl?: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  createdAt?: string;
}

const STATUS_TEXT: Record<string, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "未通过",
};

const EMPTY_FORM = {
  name: "",
  link: "",
  avatar: "",
  descr: "",
  color: "#888888",
  email: "",
};

export default function FlinkApply() {
  const [mode, setMode] = useState<0 | 1>(0);
  const [checked, setChecked] = useState<boolean[]>(
    new Array(RULES.length).fill(false),
  );
  const [form, setForm] = useState({ ...EMPTY_FORM });
  // 修改模式：从已收录友链里单选一条
  const [targetUrl, setTargetUrl] = useState("");
  const [existing, setExisting] = useState<ExistingLink[] | null>(null);
  // 已收录网址 combobox
  const [linkQuery, setLinkQuery] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkActive, setLinkActive] = useState(-1);
  // 智能识别
  const [smartText, setSmartText] = useState("");
  // 取色：用户没手动改过颜色时才自动跟随头像
  const [colorAuto, setColorAuto] = useState(true);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [queryInput, setQueryInput] = useState("");
  const [querying, setQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<ApplyRecord[] | null>(null);
  const [queryError, setQueryError] = useState("");

  const allChecked = checked.every(Boolean);
  // 修改已收录友链无需勾选须知
  const needCheck = mode === 0;
  // 手动选的颜色原样使用；只有「从头像取色」得到的颜色才会自动压深
  const previewColor = form.color.trim() || "#888888";
  const filteredLinks = (existing ?? [])
    .filter(
      (item) =>
        !linkQuery.trim() ||
        item.label.toLowerCase().includes(linkQuery.trim().toLowerCase()),
    )
    .slice(0, 50);
  const set = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 切到「修改我的友链」时拉取已收录友链，格式：站名（网址）
  useEffect(() => {
    if (mode !== 1 || existing !== null) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetchFlinkGroups({ revalidate: 0 });
        if (!alive) return;
        const list: ExistingLink[] = [];
        for (const group of (res.ok ? res.data : []) ?? []) {
          for (const link of group?.links ?? []) {
            if (!link?.url) continue;
            list.push({
              label: `${link.name}（${link.url}）`,
              url: link.url,
              name: link.name ?? "",
              avatar: link.avatar ?? "",
              descr: link.description ?? "",
              color: link.color ?? "",
            });
          }
        }
        setExisting(list);
      } catch {
        if (alive) setExisting([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [mode, existing]);

  // 头像变化后自动提取主题色（用户手动改过颜色就不再覆盖）
  useEffect(() => {
    if (!colorAuto) return;
    const url = form.avatar.trim();
    if (!/^https?:\/\//i.test(url)) return;
    let alive = true;
    const timer = window.setTimeout(async () => {
      setPicking(true);
      try {
        const color = await extractThemeColorFromImage(url);
        if (alive && color) {
          setForm((prev) =>
            prev.avatar.trim() === url
              ? { ...prev, color: ensureCardColor(color) }
              : prev,
          );
        }
      } catch {
        /* 取色失败就保持原色 */
      } finally {
        if (alive) setPicking(false);
      }
    }, 800);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.avatar, colorAuto]);

  /** 手动改颜色后不再自动覆盖 */
  const setColorManually = (value: string) => {
    setColorAuto(false);
    set("color")(value);
  };

  /** 手动触发取色 */
  async function pickColorNow() {
    const url = form.avatar.trim();
    if (!/^https?:\/\//i.test(url)) {
      setMessage({ ok: false, text: "请先填写头像链接，才能从头像取色" });
      return;
    }
    setPicking(true);
    try {
      const color = await extractThemeColorFromImage(url);
      if (color) {
        setColorAuto(true);
        set("color")(color);
        setMessage({ ok: true, text: `已从头像取色：${color}` });
      } else {
        setMessage({
          ok: false,
          text: "这张头像取不到颜色（图片可能是全透明的）",
        });
      }
    } catch (e) {
      // 失败时后端会给出具体中文原因（域名解析不了/不是图片/超时等），直接展示
      setMessage({
        ok: false,
        text:
          e instanceof Error && e.message
            ? e.message
            : "头像图片打不开，无法取色（可检查链接或稍后重试）",
      });
    } finally {
      setPicking(false);
    }
  }

  async function submit() {
    if (needCheck && !allChecked) {
      setMessage({ ok: false, text: "请先逐条阅读并勾选上方的申请须知" });
      return;
    }
    const invalid = validateFlinkForm({
      mode,
      targetUrl,
      form,
    });
    if (invalid) {
      setMessage({ ok: false, text: invalid });
      return;
    }

    // 修改申请：内容和现网完全一致就不让提交
    if (mode === 1 && targetUrl) {
      const current = existing?.find((item) => item.url === targetUrl);
      if (
        current &&
        isSameAsCurrentLink(
          {
            name: current.name,
            url: current.url,
            avatar: current.avatar,
            descr: current.descr,
            color: current.color,
          },
          form,
        )
      ) {
        setMessage({
          ok: false,
          text: "内容与当前友链完全一致，没有需要修改的地方",
        });
        return;
      }
    }
    setBusy(true);
    setMessage(null);
    try {
      const payload = {
        name: form.name.trim(),
        link: form.link.trim(),
        avatar: form.avatar.trim(),
        descr: form.descr.trim(),
        color: form.color.trim(),
        email: form.email.trim(),
        type: mode,
        targetUrl: mode === 1 ? targetUrl : "",
      };
      const res = await submitFlinkApplication(payload);
      if (res.ok) {
        const emailUsed = form.email.trim();
        // 提交成功后保留已填内容，方便继续修改或再次提交
        const kind = mode === 1 ? "修改申请" : "申请";
        const mailSent = res.data?.mailSent === true;
        setMessage({
          ok: true,
          text: !emailUsed
            ? `${kind}已提交（未填写邮箱，不会发送邮件通知）`
            : mailSent
              ? `${kind}已提交，审核结果会发送到你的邮箱`
              : `${kind}已提交，但通知邮件发送失败，请用下方邮箱自查进度`,
        });
        if (emailUsed) {
          await queryStatus(emailUsed);
        }
      } else {
        // API 层已经把信封里的中文错误信息取好了
        setMessage({ ok: false, text: res.message });
      }
    } catch {
      setMessage({ ok: false, text: "提交失败，请检查网络后重试" });
    } finally {
      setBusy(false);
    }
  }

  async function queryStatus(value = queryInput) {
    const target = value.trim();
    if (!target) {
      setQueryError("请先填写申请时的邮箱或站点名称");
      setQueryResult(null);
      return;
    }
    // 长得像邮箱就按邮箱查，否则当作站点名称
    const byEmail = EMAIL_RE.test(target);
    if (!byEmail && target.length > 50) {
      setQueryError("站点名称过长");
      setQueryResult(null);
      return;
    }
    setQuerying(true);
    setQueryError("");
    try {
      const res = await queryApplicationStatus<ApplyRecord>(
        byEmail ? { email: target } : { name: target },
      );
      if (res.ok) {
        setQueryResult(res.data ?? []);
        setQueryInput(target);
      } else setQueryError("查询失败，请稍后再试");
    } catch {
      setQueryError("查询失败，请检查网络后重试");
    } finally {
      setQuerying(false);
    }
  }

  /** 选中已收录友链：记住目标地址，并把当前信息同步进表单 */
  function chooseExisting(item: ExistingLink) {
    setColorAuto(false); // 尊重对方已有配色，不自动覆盖
    setTargetUrl(item.url);
    setLinkQuery(item.label);
    setLinkOpen(false);
    setLinkActive(-1);
    setForm((prev) => ({
      ...prev,
      name: item.name || prev.name,
      link: item.url,
      avatar: item.avatar || prev.avatar,
      descr: item.descr || "",
      color: item.color || "#888888",
    }));
    setMessage(null);
  }

  /** 智能识别：把粘贴文本里的字段填进表单（只覆盖识别到的字段） */
  function fillFromText(text: string) {
    const parsed = parseFlinkText(text);
    const found: string[] = [];
    const next = { ...form };
    if (parsed.name) {
      next.name = parsed.name;
      found.push("名称");
    }
    if (parsed.link) {
      next.link = parsed.link;
      found.push("网址");
    }
    if (parsed.avatar) {
      next.avatar = parsed.avatar;
      found.push("头像");
    }
    if (parsed.descr) {
      next.descr = parsed.descr;
      found.push("描述");
    }
    if (parsed.color) {
      next.color = parsed.color;
      found.push("颜色");
    }
    setForm(next);
    setMessage(
      found.length
        ? { ok: true, text: `已识别并填入：${found.join("、")}` }
        : { ok: false, text: "没有识别到可用的字段，请检查粘贴内容" },
    );
  }

  return (
    <div className="flink-apply">
      <div className="flink-apply-modes">
        {([0, 1] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`flink-apply-mode${mode === m ? " active" : ""}`}
            onClick={() => {
              setMode(m);
              setMessage(null);
            }}
          >
            <Icon icon={m === 0 ? "solar:add-bold" : "solar:pen-bold"} />
            {m === 0 ? "申请友链" : "修改我的友链"}
          </button>
        ))}
      </div>

      {mode === 0 && (
        <div className="flink-apply-smart">
          <div className="flink-apply-smart-head">
            <Icon icon="solar:magic-stick-3-bold" />
            <span>智能识别填入</span>
            <button
              type="button"
              onClick={() => fillFromText(smartText)}
              disabled={!smartText.trim()}
            >
              识别并填入
            </button>
          </div>
          <textarea
            rows={3}
            value={smartText}
            placeholder={
              "把你自己的友链信息直接粘到这里，自动识别名称/网址/头像/描述/颜色。例如：\n网站名称：Ariasakaの小窝\n网站链接：https://blog.yaria.top\n头像地址：https://blog.yaria.top/avatar.png\n描述：一个碎碎念的博客"
            }
            onChange={(e) => setSmartText(e.target.value)}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              if (!text) return;
              e.preventDefault();
              setSmartText(text);
              fillFromText(text);
            }}
          />
        </div>
      )}

      {mode === 0 && (
        <ul className="flink-apply-rules">
          {RULES.map((rule, i) => (
            <li key={i}>
              <label>
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={(e) =>
                    setChecked((prev) =>
                      prev.map((v, idx) => (idx === i ? e.target.checked : v)),
                    )
                  }
                />
                <span>{rule}</span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <div className="flink-apply-form">
        {mode === 1 && (
          <div className="flink-apply-field flink-apply-wide">
            <span>当前已收录的网址 *</span>
            <div className="flink-apply-combo">
              <input
                type="text"
                role="combobox"
                aria-expanded={linkOpen}
                aria-autocomplete="list"
                placeholder="输入站名或网址搜索，选中后会自动填好下面的信息"
                value={linkQuery}
                onChange={(e) => {
                  setLinkQuery(e.target.value);
                  setLinkOpen(true);
                  setLinkActive(-1);
                  if (!e.target.value) setTargetUrl("");
                }}
                onFocus={() => setLinkOpen(true)}
                onBlur={() => window.setTimeout(() => setLinkOpen(false), 120)}
                onKeyDown={(e) => {
                  if (!linkOpen) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setLinkActive((i) =>
                      Math.min(i + 1, filteredLinks.length - 1),
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setLinkActive((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter" && linkActive >= 0) {
                    e.preventDefault();
                    chooseExisting(filteredLinks[linkActive]);
                  } else if (e.key === "Escape") {
                    setLinkOpen(false);
                  }
                }}
              />
              {linkOpen && (
                <ul className="flink-apply-combo-list" role="listbox">
                  {existing === null && (
                    <li className="empty">正在加载已收录友链…</li>
                  )}
                  {existing?.length === 0 && (
                    <li className="empty">暂时没有读取到已收录的友链</li>
                  )}
                  {filteredLinks.length === 0 && existing?.length !== 0 && (
                    <li className="empty">没有匹配的友链</li>
                  )}
                  {filteredLinks.map((item, index) => (
                    <li
                      key={item.url}
                      role="option"
                      aria-selected={targetUrl === item.url}
                      className={`${targetUrl === item.url ? "selected" : ""}${
                        index === linkActive ? " active" : ""
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        chooseExisting(item);
                      }}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <label className="flink-apply-field">
          <span>站点名称 *</span>
          <input
            type="text"
            maxLength={50}
            placeholder="Ariasakaの小窝"
            value={form.name}
            onChange={(e) => set("name")(e.target.value)}
          />
        </label>
        <label className="flink-apply-field">
          <span>网站链接 *</span>
          <input
            type="url"
            placeholder="https://blog.yaria.top"
            value={form.link}
            onChange={(e) => set("link")(e.target.value)}
          />
        </label>
        <label className="flink-apply-field">
          <span>头像链接 *</span>
          <input
            type="url"
            placeholder="https://img.example.com/avatar.png"
            value={form.avatar}
            onChange={(e) => set("avatar")(e.target.value)}
          />
        </label>
        <label className="flink-apply-field">
          <span>邮箱（可选，用于接收审核结果和查询进度）</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
          />
        </label>
        <label className="flink-apply-field flink-apply-wide">
          <span>站点描述（可选）</span>
          <textarea
            maxLength={200}
            rows={3}
            placeholder="一句话介绍你的站点"
            value={form.descr}
            onChange={(e) => set("descr")(e.target.value)}
          />
        </label>
        <label className="flink-apply-field">
          <span>背景色（可选）</span>
          <span className="flink-apply-color">
            <input
              type="color"
              value={
                COLOR_RE.test(form.color) && form.color.startsWith("#")
                  ? form.color
                  : "#888888"
              }
              onChange={(e) => setColorManually(e.target.value)}
            />
            <input
              type="text"
              placeholder="#ff88aa"
              value={form.color}
              onChange={(e) => setColorManually(e.target.value)}
            />
            <button
              type="button"
              className="flink-apply-pick"
              onClick={pickColorNow}
              disabled={picking}
              title="根据头像自动提取主题色"
            >
              {picking ? "取色中…" : "从头像取色"}
            </button>
          </span>
        </label>
      </div>

      <div className="flink-apply-preview">
        <div className="flink-apply-preview-head">
          <Icon icon="solar:eye-bold" />
          效果预览
        </div>
        <div
          className="flink-apply-card"
          style={{
            backgroundColor: previewColor,
            background: `color-mix(in srgb, ${previewColor}, transparent 25%)`,
          }}
        >
          <span className="flink-apply-card-avatar">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.avatar.trim() || siteConfigs.falldownAvatar}
              alt=""
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.src.endsWith(siteConfigs.falldownAvatar)) {
                  img.src = siteConfigs.falldownAvatar;
                }
              }}
            />
          </span>
          <span className="flink-apply-card-body">
            <span className="flink-apply-card-name">
              {form.name.trim() || "站点名称"}
            </span>
            <span className="flink-apply-card-desc">
              {form.descr.trim() || "站点描述"}
            </span>
          </span>
          <span className="flink-apply-card-status">
            <Icon icon="system-uicons:signal-full" />
          </span>
        </div>
      </div>

      <div className="flink-apply-actions">
        <button
          type="button"
          className="flink-apply-submit"
          disabled={busy || (needCheck && !allChecked)}
          onClick={submit}
        >
          <Icon icon={busy ? "solar:refresh-bold" : "solar:plain-2-bold"} />
          {busy ? "提交中..." : "提交申请"}
        </button>
        {needCheck && !allChecked && (
          <span className="flink-apply-hint">
            请先勾选全部 {RULES.length} 条须知（已勾选{" "}
            {checked.filter(Boolean).length} 条）
          </span>
        )}
      </div>

      {message && (
        <div className={`flink-apply-msg ${message.ok ? "ok" : "err"}`}>
          <Icon
            icon={
              message.ok
                ? "solar:check-circle-bold"
                : "solar:danger-circle-bold"
            }
          />
          {message.text}
        </div>
      )}

      <div className="flink-apply-query">
        <h3>查询审核进度</h3>
        <div className="flink-apply-query-row">
          <input
            type="text"
            placeholder="填写申请时使用的邮箱或站点名称"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
          />
          <button
            type="button"
            onClick={() => queryStatus()}
            disabled={querying}
          >
            {querying ? "查询中..." : "查询"}
          </button>
        </div>
        {queryError && <div className="flink-apply-msg err">{queryError}</div>}
        {queryResult &&
          (queryResult.length ? (
            <ul className="flink-apply-result">
              {queryResult.map((item) => (
                <li key={item.id} className="flink-apply-record">
                  <div className="flink-apply-record-head">
                    <span
                      className={`flink-apply-tag${item.type === 1 ? " modify" : ""}`}
                    >
                      {item.type === 1 ? "修改申请" : "新增申请"}
                    </span>
                    <b>{item.name}</b>
                    <em className={`flink-apply-state ${item.status}`}>
                      {STATUS_TEXT[item.status] ?? item.status}
                    </em>
                  </div>

                  {/* 待审核的申请展示当前提交的具体内容；已通过/已拒绝只显示结果 */}
                  {item.status === "pending" && (
                    <div className="flink-apply-record-body">
                      <span>
                        网址：
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.link}
                        </a>
                      </span>
                      {item.avatar && (
                        <span>
                          头像：
                          <a
                            href={item.avatar}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.avatar}
                          </a>
                        </span>
                      )}
                      {item.descr && <span>描述：{item.descr}</span>}
                      {item.color && (
                        <span className="flink-apply-record-color">
                          底色：
                          <i style={{ backgroundColor: item.color }} />
                          {item.color}
                        </span>
                      )}
                      {item.type === 1 && item.targetUrl && (
                        <span>修改对象：{item.targetUrl}</span>
                      )}
                    </div>
                  )}

                  {item.status === "rejected" && item.reason && (
                    <div className="flink-apply-reason">
                      理由：{item.reason}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flink-apply-msg">该邮箱或站点名暂无申请记录</div>
          ))}
      </div>
    </div>
  );
}
