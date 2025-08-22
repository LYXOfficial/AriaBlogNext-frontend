import { ReactNode } from "react";
import TabsTag, { TabTag } from "./Tabs";

export default function Tabs({ children }: { children: ReactNode }) {
  return <TabsTag>{children}</TabsTag>;
}

export const Tab = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return <TabTag title={title}>{children}</TabTag>;
};
