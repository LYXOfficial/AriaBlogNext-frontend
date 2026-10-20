/**
 * 友链申请表单的纯逻辑（校验 / 与现网友链比对），与 UI 解耦便于复用和测试。
 */

export interface FlinkFormValues {
  name: string;
  link: string;
  avatar: string;
  descr: string;
  color: string;
  email: string;
}

export interface CurrentLinkLike {
  name: string;
  url: string;
  avatar: string;
  descr: string;
  color: string;
}

export const URL_RE = /^https?:\/\/[^\s<>"'\\]+$/i;
export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const COLOR_RE =
  /^(#[0-9a-fA-F]{3,8}|rgba?\([0-9.,%\s]+\)|hsla?\([0-9.,%\s]+\)|[a-zA-Z]{3,20})$/;

const text = (value?: string) => (value || "").trim();

/** 网址比对：忽略结尾斜杠 */
const url = (value?: string) => {
  const trimmed = text(value);
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

/** 颜色比对：缺省按卡片默认色 #888888，忽略大小写 */
const color = (value?: string) => (text(value) || "#888888").toLowerCase();

/** 返回第一条错误提示，空字符串表示通过 */
export function validateFlinkForm(options: {
  mode: 0 | 1;
  targetUrl: string;
  editing: boolean;
  form: FlinkFormValues;
}): string {
  const { mode, targetUrl, editing, form } = options;
  if (mode === 1 && !targetUrl && !editing)
    return "请先在列表里选择要修改的友链";
  if (!text(form.name)) return "请填写站点名称";
  if (!URL_RE.test(text(form.link))) return "网址格式不正确";
  if (!URL_RE.test(text(form.avatar))) return "头像格式不正确";
  if (text(form.descr) && text(form.descr).length > 200)
    return "站点描述不超过 200 字";
  if (text(form.email) && !EMAIL_RE.test(text(form.email)))
    return "邮箱格式不正确（不想填可以留空）";
  if (text(form.color) && !COLOR_RE.test(text(form.color)))
    return "颜色格式不正确";
  return "";
}

/** 表单内容是否与选中的现网友链完全一致（修改申请不该提交这种） */
export function isSameAsCurrentLink(
  current: CurrentLinkLike,
  form: FlinkFormValues,
): boolean {
  return (
    text(current.name) === text(form.name) &&
    url(current.url) === url(form.link) &&
    text(current.avatar) === text(form.avatar) &&
    text(current.descr) === text(form.descr) &&
    color(current.color) === color(form.color)
  );
}
