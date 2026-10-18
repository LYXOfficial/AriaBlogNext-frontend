"use client";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { siteConfigs } from "@/config";
import { parseFlinkText } from "@/utils/flinkParse";
import { ensureCardColor, extractThemeColorFromImage } from "@/utils/themeColor";
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
  "建议填写正确的邮箱：用于接收申请回执与审核结果，也可以用来自助查询进度、修改或撤销申请",
  "建议网站头像不要有防盗链，否则无法正常显示",
  "审核未通过时，若博主填写了理由会通过邮件告知，可修改后重新提交",
];

const URL_RE = /^https?:\/\/[^\s<>"'\\]+$/i;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const COLOR_RE =
  /^(#[0-9a-fA-F]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\s]+\)|[a-zA-Z]{3,20})$/;

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
  email?: string;
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
  const [queryEmail, setQueryEmail] = useState("");
  const [querying, setQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<ApplyRecord[] | null>(null);
  const [queryError, setQueryError] = useState("");
  // 正在编辑的待审申请（修改申请内容）
  const [editing, setEditing] = useState<{ id: string; email: string } | null>(
    null,
  );
  // 待确认撤销的申请 id
  const [withdrawId, setWithdrawId] = useState("");

  const allChecked = checked.every(Boolean);
  // 修改已收录友链无需勾选须知；编辑待审申请时也无需重复勾选
  const needCheck = mode === 0 && !editing;
  // 手动选的颜色原样使用；只有「从头像取色」得到的颜色才会自动压深
  const previewColor = form.color.trim() || "#888888";
  const filteredLinks = (existing ?? [])
    .filter((item) =>
      !linkQuery.trim() || item.label.toLowerCase().includes(linkQuery.trim().toLowerCase()),
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
        const res = await fetch(`${siteConfigs.backEndUrl}/get/flink/flinks`);
        const data = await res.json().catch(() => null);
        if (!alive) return;
        const list: ExistingLink[] = [];
        for (const group of data?.data ?? []) {
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
            prev.avatar.trim() === url ? { ...prev, color: ensureCardColor(color) } : prev,
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
          text: "这张头像取不到颜色（可能是黑白线稿，或对方不允许跨域读取像素）",
        });
      }
    } catch {
      // 图片加载失败/超时：不要让 Promise 泄漏成未捕获异常
      setMessage({ ok: false, text: "头像图片打不开，无法取色（可检查链接或稍后重试）" });
    } finally {
      setPicking(false);
    }
  }

  /** 与选中的现网友链相比是否完全没变（修改申请不该提交这种） */
  function sameAsCurrent(item: ExistingLink): boolean {
    const text = (v: string) => (v || "").trim();
    const url = (v: string) => {
      const s = text(v);
      return s.endsWith("/") ? s.slice(0, -1) : s;
    };
    const color = (v: string) => (text(v) || "#888888").toLowerCase();
    return (
      text(item.name) === text(form.name) &&
      url(item.url) === url(form.link) &&
      text(item.avatar) === text(form.avatar) &&
      text(item.descr) === text(form.descr) &&
      color(item.color) === color(form.color)
    );
  }

  function localValidate(): string {
    if (mode === 1 && !targetUrl && !editing) return "请先在列表里选择要修改的友链";
    if (!form.name.trim()) return "请填写站点名称";
    if (!URL_RE.test(form.link.trim())) return "网址格式不正确";
    if (!URL_RE.test(form.avatar.trim())) return "头像格式不正确";
    if (form.descr.trim() && form.descr.trim().length > 200)
      return "站点描述不超过 200 字";
    if (form.email.trim() && !EMAIL_RE.test(form.email.trim()))
      return "邮箱格式不正确（不想填可以留空）";
    if (form.color.trim() && !COLOR_RE.test(form.color.trim()))
      return "颜色格式不正确";
    return "";
  }

  function resetEdit() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setChecked(new Array(RULES.length).fill(false));
    setMessage(null);
  }

  async function submit() {
    // 修改已有申请/修改友链时不必勾选须知
    if (needCheck && !allChecked) {
      setMessage({ ok: false, text: "请先逐条阅读并勾选上方的申请须知" });
      return;
    }
    const invalid = localValidate();
    if (invalid) {
      setMessage({ ok: false, text: invalid });
      return;
    }

    // 修改申请：内容和现网完全一致就不让提交
    if (mode === 1 && !editing && targetUrl) {
      const current = existing?.find((item) => item.url === targetUrl);
      if (current && sameAsCurrent(current)) {
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
        email: (editing?.email || form.email).trim(),
        type: mode,
        targetUrl: mode === 1 ? targetUrl : "",
      };
      const res = await fetch(
        editing
          ? `${siteConfigs.backEndUrl}/flink/apply/update`
          : `${siteConfigs.backEndUrl}/flink/apply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editing ? { ...payload, id: editing.id } : payload,
          ),
        },
      );
      const data = await res.json().catch(() => null);
      if (res.ok) {
        const emailUsed = (editing?.email || form.email).trim();
        // 提交成功后保留已填内容，方便继续修改或再次提交
        if (editing) {
          setEditing(null);
          setMessage({ ok: true, text: "修改已保存，仍在等待审核" });
        } else {
          const kind = mode === 1 ? "修改申请" : "申请";
          const mailSent = data?.mailSent === true;
          setMessage({
            ok: true,
            text: !emailUsed
              ? `${kind}已提交（未填写邮箱，不会发送邮件通知）`
              : mailSent
                ? `${kind}已提交，审核结果会发送到你的邮箱`
                : `${kind}已提交，但通知邮件发送失败，请用下方邮箱自查进度`,
          });
        }
        if (emailUsed) {
          setQueryEmail(emailUsed);
          await queryStatus(emailUsed);
        }
      } else {
        const detail = data?.detail;
        const text =
          (typeof detail === "object" && detail?.error) ||
          (typeof detail === "string" && detail) ||
          `提交失败（HTTP ${res.status}）`;
        setMessage({ ok: false, text });
      }
    } catch {
      setMessage({ ok: false, text: "提交失败，请检查网络后重试" });
    } finally {
      setBusy(false);
    }
  }

  async function queryStatus(email = queryEmail) {
    const target = email.trim();
    if (!EMAIL_RE.test(target)) {
      setQueryError("邮箱格式不正确");
      setQueryResult(null);
      return;
    }
    setQuerying(true);
    setQueryError("");
    try {
      const res = await fetch(
        `${siteConfigs.backEndUrl}/flink/apply/status?email=${encodeURIComponent(target)}`,
      );
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setQueryResult(
          (data?.data ?? []).map((item: ApplyRecord) => ({
            ...item,
            email: target,
          })),
        );
        setQueryEmail(target);
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
    if (parsed.name) { next.name = parsed.name; found.push("名称"); }
    if (parsed.link) { next.link = parsed.link; found.push("网址"); }
    if (parsed.avatar) { next.avatar = parsed.avatar; found.push("头像"); }
    if (parsed.descr) { next.descr = parsed.descr; found.push("描述"); }
    if (parsed.color) { next.color = parsed.color; found.push("颜色"); }
    setForm(next);
    setMessage(
      found.length
        ? { ok: true, text: `已识别并填入：${found.join("、")}` }
        : { ok: false, text: "没有识别到可用的字段，请检查粘贴内容" },
    );
  }

  function startEdit(record: ApplyRecord) {
    setColorAuto(false); // 尊重已提交的配色
    setEditing({ id: record.id, email: record.email || queryEmail });
    setMode(record.type === 1 ? 1 : 0);
    setForm({
      name: record.name || "",
      link: record.link || "",
      avatar: record.avatar || "",
      descr: record.descr || "",
      color: record.color || "#888888",
      email: record.email || queryEmail,
    });
    if (record.type === 1) {
      const target = record.targetUrl || "";
      setTargetUrl(target);
      const matched = existing?.find((item) => item.url === target);
      setLinkQuery(matched ? matched.label : target);
    }
    setMessage(null);
    document
      .querySelector(".flink-apply")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function doWithdraw(record: ApplyRecord) {
    setBusy(true);
    try {
      const res = await fetch(`${siteConfigs.backEndUrl}/flink/apply/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: record.id,
          email: record.email || queryEmail,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setMessage({ ok: true, text: "申请已撤销" });
        await queryStatus(record.email || queryEmail);
      } else {
        setMessage({
          ok: false,
          text: data?.detail?.error || "撤销失败，请稍后再试",
        });
      }
    } catch {
      setMessage({ ok: false, text: "撤销失败，请检查网络后重试" });
    } finally {
      setWithdrawId("");
      setBusy(false);
    }
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
              setEditing(null);
              setMessage(null);
            }}
          >
            <Icon icon={m === 0 ? "fa6-solid:plus" : "fa6-solid:pen"} />
            {m === 0 ? "申请友链" : "修改我的友链"}
          </button>
        ))}
      </div>

      {editing && (
        <div className="flink-apply-editing">
          <Icon icon="fa6-solid:pen-to-square" />
          正在修改一条待审申请，保存后仍保持原来的排队位置。
          <button type="button" onClick={resetEdit}>
            取消修改
          </button>
        </div>
      )}

      {mode === 0 && (
        <div className="flink-apply-smart">
          <div className="flink-apply-smart-head">
            <Icon icon="fa6-solid:wand-magic-sparkles" />
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
            placeholder={"把你自己的友链信息直接粘到这里，自动识别名称/网址/头像/描述/颜色。例如：\n网站名称：Ariasakaの小窝\n网站链接：https://blog.yaria.top\n头像地址：https://blog.yaria.top/avatar.png\n描述：一个碎碎念的博客"}
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
                checked={checked[i] || !!editing}
                disabled={!!editing}
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
                disabled={!!editing}
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
                    setLinkActive((i) => Math.min(i + 1, filteredLinks.length - 1));
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
                  {existing === null && <li className="empty">正在加载已收录友链…</li>}
                  {existing?.length === 0 && <li className="empty">暂时没有读取到已收录的友链</li>}
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
            disabled={!!editing}
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
          <Icon icon="fa6-solid:eye" />
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
          <Icon
            icon={
              busy
                ? "fa6-solid:spinner"
                : editing
                  ? "fa6-solid:floppy-disk"
                  : "fa6-solid:paper-plane"
            }
          />
          {busy ? "提交中..." : editing ? "保存修改" : "提交申请"}
        </button>
        {editing ? (
          <button type="button" className="flink-apply-cancel" onClick={resetEdit}>
            取消修改
          </button>
        ) : (
          needCheck &&
          !allChecked && (
            <span className="flink-apply-hint">
              请先勾选全部 {RULES.length} 条须知（已勾选{" "}
              {checked.filter(Boolean).length} 条）
            </span>
          )
        )}
      </div>

      {message && (
        <div className={`flink-apply-msg ${message.ok ? "ok" : "err"}`}>
          <Icon
            icon={
              message.ok
                ? "fa6-solid:circle-check"
                : "fa6-solid:circle-exclamation"
            }
          />
          {message.text}
        </div>
      )}

      <div className="flink-apply-query">
        <h3>查询审核进度</h3>
        <div className="flink-apply-query-row">
          <input
            type="email"
            placeholder="填写申请时使用的邮箱"
            value={queryEmail}
            onChange={(e) => setQueryEmail(e.target.value)}
          />
          <button type="button" onClick={() => queryStatus()} disabled={querying}>
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
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
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
                      <div className="flink-apply-record-actions">
                        <button type="button" onClick={() => startEdit(item)}>
                          <Icon icon="fa6-solid:pen-to-square" />
                          修改
                        </button>
                        {withdrawId === item.id ? (
                          <>
                            <button
                              type="button"
                              className="danger"
                              onClick={() => doWithdraw(item)}
                            >
                              确认撤销
                            </button>
                            <button
                              type="button"
                              onClick={() => setWithdrawId("")}
                            >
                              再想想
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="danger"
                            onClick={() => setWithdrawId(item.id)}
                          >
                            <Icon icon="fa6-solid:trash-can" />
                            撤销申请
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {item.status === "rejected" && item.reason && (
                    <div className="flink-apply-reason">理由：{item.reason}</div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="flink-apply-msg">该邮箱暂无申请记录</div>
          ))}
      </div>
    </div>
  );
}
