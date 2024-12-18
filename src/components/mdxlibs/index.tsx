import HighLightCode from "./builtins/HighLightCode";
import MarkdownImage from "./builtins/MarkdownImage";
import MarkdownLink from "./builtins/MarkdownLink";
import LateXFilter from "./builtins/LaTeXFilter";
import FoldingTag from "./extratags/Folding";
import LinkTag from "./extratags/Link";
import ColorTextTag from "./extratags/ColorText";
import InlineImageTag from "./extratags/InlineImage";
import CheckBoxTag from "./extratags/CheckBox";
import NoteTag from "./extratags/Note";
import ChatTag from "./extratags/Chat";
import PromptTag from "./extratags/PromptShell";
import TabsTag, { Tab } from "./extratags/TabsShell";

import JSMD5 from "js-md5";
import Markdown, { RuleType } from "markdown-to-jsx";
import FancyBox from "../thirdpartyjs/FancyBox";
import HLJSNum from "../thirdpartyjs/HLJSNum";
import KaTex from "../thirdpartyjs/KaTex";
import Pangu from "../thirdpartyjs/Pangu";
import FriendLinks from "../FriendLinks";

export default function MDToTSXWithPlugins({ mdContent }: { mdContent: string }) {
  mdContent = LateXFilter(mdContent);
  return (
    <>
      <Markdown options={
        {
          renderRule(next, node) {
            if (node.type === RuleType.codeBlock) {
              return (
                <HighLightCode code={node.text} lang={node.lang} />
              );
            }
            else if (node.type === RuleType.image) {
              return (
                <MarkdownImage src={node.target} alt={node.alt} />
              );
            }
            return next();
          },
          overrides: {
            a: MarkdownLink,
            Folding: FoldingTag,
            Link: LinkTag,
            ColorText: ColorTextTag,
            InlineImage: InlineImageTag,
            CheckBox: CheckBoxTag,
            Note: NoteTag,
            Chat: ChatTag,
            Prompt: PromptTag,
            Tabs: TabsTag,
            Tab: Tab,
            FriendLinks: FriendLinks,
          },
          slugify(inp) {
            return `title-${JSMD5.md5(inp).slice(0, 8)}`;
          }
        }
      }>
        {mdContent}
      </Markdown>
      <FancyBox />
      <HLJSNum />
      <KaTex />
      <Pangu container="post-maincontent" />
    </>
  );
}