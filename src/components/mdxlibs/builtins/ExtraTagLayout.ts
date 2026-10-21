// markdown-to-jsx 解析自定义标签时，会先判断内层内容该按“块级”还是“行内”解析：
// 只有内容开头能匹配它内置的那组 ^ 锚定块级规则时才走块级解析，否则整段按行内解析，
// 于是 # 标题、列表、代码块等会以原始 markdown 文本漏在页面上。
// 而“开标签后面紧跟一个空行”刚好让内层内容以 \n\n 开头，导致块级规则全部失配——
// 这就是外挂标签时好时坏、嵌套时尤其明显的原因。
//
// 另外，块级标签所在行前面没有空行时，markdown-to-jsx 不把它当作块级 JSX，
// 闭合标签会作为字面量文本显示出来（例如页面上出现 </Folding>）。
//
// 这里统一修正输入，而不是等渲染出错再补救。代码围栏内的内容一律跳过，
// 避免动到文章里作为示例讲解的标签写法。

// 独占一行使用的块级标签：需要保证前面有空行
const BLOCK_TAGS = [
  "Folding",
  "Note",
  "Tabs",
  "Tab",
  "Chat",
  "CheckBox",
  "FriendLinks",
  "FlinkApply",
];

// 所有自定义容器标签：开标签后不能紧跟空行（Prompt/ColorText 等行内标签正常用法
// 不会在开标签后换行，因此这里一并处理不会影响它们）
const CONTAINER_TAGS = [
  ...BLOCK_TAGS,
  "ColorText",
  "InlineImage",
  "Prompt",
  "Link",
];

const blockTagAtLineStart = new RegExp(
  `^\\s*<(?:${BLOCK_TAGS.join("|")})\\b[^>]*>`,
);
// 末尾的 [^/>] 用于排除自闭合标签（<Link ... />、<FlinkApply /> 等），
// 它们没有内层内容，去掉其后的空行反而可能让下一段被并进同一块
const containerTagAtLineEnd = new RegExp(
  `<(?:${CONTAINER_TAGS.join("|")})\\b[^>]*[^/>]>\\s*$`,
);

// 标记每一行是否处于围栏代码块内（围栏行本身也算）
function fenceMask(lines: string[]): boolean[] {
  const mask: boolean[] = [];
  let fence: { char: string; length: number } | null = null;
  for (const line of lines) {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (match) {
      const marker = match[1];
      if (fence === null) fence = { char: marker[0], length: marker.length };
      else if (
        fence.char === marker[0] &&
        marker.length >= fence.length &&
        !match[2].trim()
      ) fence = null;
      mask.push(true);
      continue;
    }
    mask.push(fence !== null);
  }
  return mask;
}

export default function normalizeExtraTagLayout(mdContent: string): string {
  // 解析器不支持围栏直接打断段落；补空行，否则 Note 内的 diff 会变成行内代码。
  // 只处理开围栏，按字符和长度识别闭围栏，避免改写代码本身。
  const lines: string[] = [];
  let fence: { char: string; length: number } | null = null;
  for (const line of mdContent.split("\n")) {
    const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (match) {
      const marker = match[1];
      if (!fence) {
        if (lines.length && lines[lines.length - 1].trim()) lines.push("");
        fence = { char: marker[0], length: marker.length };
      } else if (
        marker[0] === fence.char &&
        marker.length >= fence.length &&
        !match[2].trim()
      ) {
        fence = null;
      }
    }
    lines.push(line);
  }

  // 第一步：块级标签独占一行时，前面补一个空行
  const separated: string[] = [];
  const mask = fenceMask(lines);
  for (let i = 0; i < lines.length; i++) {
    if (!mask[i] && separated.length > 0) {
      const prev = separated[separated.length - 1];
      if (blockTagAtLineStart.test(lines[i]) && prev.trim() !== "") {
        separated.push("");
      }
    }
    separated.push(lines[i]);
  }

  // 第二步：去掉开标签后紧跟的空行（嵌套时必须放在第一步之后，
  // 否则第一步给子标签补的空行又会被当成父标签后面的空行）
  const result: string[] = [];
  const separatedMask = fenceMask(separated);
  for (let i = 0; i < separated.length; i++) {
    result.push(separated[i]);
    if (!separatedMask[i] && containerTagAtLineEnd.test(separated[i])) {
      while (i + 1 < separated.length && separated[i + 1].trim() === "") i++;
    }
  }

  return result.join("\n");
}
