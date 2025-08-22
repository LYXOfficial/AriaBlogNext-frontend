import JSMD5 from "js-md5";
import { TOCItem } from "../../asides/CardToc";

const generateTOC = (mdContent: string): TOCItem[] => {
  const tocTree: TOCItem[] = [];
  const ulStack: TOCItem[] = [{ level: 0, children: tocTree } as TOCItem];
  const matches = mdContent.matchAll(/^(\n#{1,6})\s+(.+)\n$/gm);
  for (const match of matches) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = `title-${JSMD5.md5(text).slice(0, 8)}`;
    const item: TOCItem = { text, href: `${id}`, level, children: [] };
    while (ulStack[ulStack.length - 1].level >= level) ulStack.pop();
    ulStack[ulStack.length - 1].children.push(item);
    ulStack.push(item);
  }

  return tocTree;
};
export default generateTOC;
