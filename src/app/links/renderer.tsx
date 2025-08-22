import Content from "./content.mdx";
import MDToTSXWithPlugins from "@/components/mdxlibs";
export default function Renderer() {
  return <MDToTSXWithPlugins mdContent={Content.toString()} />;
}
