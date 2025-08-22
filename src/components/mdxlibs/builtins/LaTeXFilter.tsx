export default function LateXFilter(text: string) {
  const mathBlockRegexMultiLine = /\$\$[\s\S]*?\$\$/g;
  const mathBlockRegexSingleLine = /.\$(.*?)\$/g;
  const codeBlockRegex = /```[\s\S]*?```|`[^`]*?`/g;
  const codeBlockMatches: string[] = [];
  let tmptext = text.replace(codeBlockRegex, (match) => {
    codeBlockMatches.push(match);
    return `__CODEBLOCK_${codeBlockMatches.length - 1}__`;
  });
  tmptext = tmptext.replace(mathBlockRegexMultiLine, (match) => {
    return match.replace(/([*_~`>#+\-=|{}.!])/g, "\\$1");
  });
  tmptext = tmptext.replace(mathBlockRegexSingleLine, (match) => {
    return match.replace(/([*_~`>#+\-=|{}.!])/g, "\\$1");
  });
  return tmptext.replace(/__CODEBLOCK_(\d+)__/g, (match, index) => {
    return codeBlockMatches[index];
  });
}
