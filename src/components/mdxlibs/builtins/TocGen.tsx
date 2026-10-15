import JSMD5 from "js-md5";
import { TOCItem } from "../../asides/CardToc";

const generateTOC = (mdContent: string): TOCItem[] => {
  const tocTree: TOCItem[] = [];
  const ulStack: TOCItem[] = [{ level: 0, children: tocTree } as TOCItem];
  // 逐行扫描，而不是用 /^(\n#{1,6})/ 这种要求标题“前面必须有一个空行”的正则：
  // 旧写法会漏掉紧跟正文的标题（以及被代码块吃掉的换行），没有 h1 直接 h2/h3 的文章尤其明显。
  // 同时按围栏代码块开合跳过内部内容，避免把代码里的 # 注释当成标题。
  let fenceChar: string | null = null;
  const seen = new Set<string>();
  for (const line of mdContent.split("\n")) {
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      const char = fence[1][0];
      if (fenceChar === null) fenceChar = char;
      else if (fenceChar === char) fenceChar = null;
      continue;
    }
    if (fenceChar !== null) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;

    // level 直接取 # 的个数（旧写法把用作分隔的 \n 也算进去了，整体偏移 1）
    const level = match[1].length;
    const text = match[2].trim();
    if (!text) continue;

    const id = `title-${JSMD5.md5(text).slice(0, 8)}`;
    // 同标题文本会算出同一个 id（渲染器也只给得出同一个锚点），重复项没有意义
    if (seen.has(id)) continue;
    seen.add(id);

    const item: TOCItem = { text, href: `${id}`, level, children: [] };
    while (ulStack[ulStack.length - 1].level >= level) ulStack.pop();
    ulStack[ulStack.length - 1].children.push(item);
    ulStack.push(item);
  }

  return tocTree;
};
export default generateTOC;
