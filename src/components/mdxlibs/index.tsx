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
import Markdown from "markdown-to-jsx";
import FancyBox from "../thirdpartyjs/FancyBox";
import HLJSNum from "../thirdpartyjs/HLJSNum";
import KaTex from "../thirdpartyjs/KaTex";
import Pangu from "../thirdpartyjs/Pangu";
import FriendLinks from "../FriendLinks";

// 安全的组件包装器
function SafeComponent({
  component: Component,
  ...props
}: {
  component: any;
  [key: string]: any;
}) {
  try {
    return <Component {...props} />;
  } catch (error) {
    console.warn("Component render error:", error);
    return <div className="render-error">组件渲染错误: {String(error)}</div>;
  }
}

export default function MDToTSXWithPlugins({
  mdContent,
}: {
  mdContent: string;
}) {
  mdContent = LateXFilter(mdContent);

  try {
    return (
      <>
        <Markdown
          options={{
            extendsRules: {
              codeBlock: {
                react(node) {
                  try {
                    return (
                      <HighLightCode key={node.content} code={node.content} lang={node.lang} />
                    );
                  } catch (error) {
                    console.warn("CodeBlock render error:", error);
                    return (
                      <pre>
                        <code>{node.content}</code>
                      </pre>
                    );
                  }
                },
              },
              image: {
                react(node) {
                  try {
                    return <MarkdownImage key={node.target} src={node.target} alt={node.alt} />;
                  } catch (error) {
                    console.warn("Image render error:", error);
                    return <img key={node.target} src={node.target} alt={node.alt} />;
                  }
                },
              },
            },
            overrides: {
              a: (props: any) => (
                <SafeComponent component={MarkdownLink} {...props} />
              ),
              Folding: (props: any) => (
                <SafeComponent component={FoldingTag} {...props} />
              ),
              Link: (props: any) => (
                <SafeComponent component={LinkTag} {...props} />
              ),
              ColorText: (props: any) => (
                <SafeComponent component={ColorTextTag} {...props} />
              ),
              InlineImage: (props: any) => (
                <SafeComponent component={InlineImageTag} {...props} />
              ),
              CheckBox: (props: any) => (
                <SafeComponent component={CheckBoxTag} {...props} />
              ),
              Note: (props: any) => (
                <SafeComponent component={NoteTag} {...props} />
              ),
              Chat: (props: any) => (
                <SafeComponent component={ChatTag} {...props} />
              ),
              Prompt: (props: any) => (
                <SafeComponent component={PromptTag} {...props} />
              ),
              Tabs: (props: any) => (
                <SafeComponent component={TabsTag} {...props} />
              ),
              Tab: (props: any) => <SafeComponent component={Tab} {...props} />,
              FriendLinks: (props: any) => (
                <SafeComponent component={FriendLinks} {...props} />
              ),
            },
            slugify(inp) {
              try {
                return `title-${JSMD5.md5(inp).slice(0, 8)}`;
              } catch (error) {
                console.warn("Slugify error:", error);
                return `title-${Math.random().toString(36).slice(2, 10)}`;
              }
            },
          }}
        >
          {mdContent}
        </Markdown>
        <FancyBox />
        <HLJSNum />
        <KaTex />
        <Pangu container="post-maincontent" />
      </>
    );
  } catch (error) {
    console.error("Markdown render error:", error);
    // 如果 Markdown 完全失败，回退到纯文本显示
    return (
      <div className="markdown-fallback">
        <div
          className="error-notice"
          style={{
            background: "#fee",
            border: "1px solid #fcc",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "4px",
          }}
        >
          <strong>Markdown 渲染出错，正在显示纯文本版本</strong>
          <details style={{ marginTop: "10px" }}>
            <summary>错误详情</summary>
            <pre style={{ fontSize: "12px", overflow: "auto" }}>
              {String(error)}
            </pre>
          </details>
        </div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{mdContent}</pre>
        <FancyBox />
        <HLJSNum />
        <KaTex />
        <Pangu container="post-maincontent" />
      </div>
    );
  }
}
