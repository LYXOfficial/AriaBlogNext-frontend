import Prompt from "./Prompt";
export default function PromptTag({
  children,
  tip,
}: {
  children: React.ReactNode;
  tip: string;
}) {
  return <Prompt tip={tip}>{children}</Prompt>;
}
