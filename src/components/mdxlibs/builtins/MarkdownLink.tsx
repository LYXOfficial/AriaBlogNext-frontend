import { ReactNode } from "react";

export default function MarkdownLink({ children, href, title }: { children: ReactNode, href: string, title?: string }) {
    return (
        <a href={href} target="_blank" rel="noreferrer" title={title} >
            {children}
        </a>
    );
}