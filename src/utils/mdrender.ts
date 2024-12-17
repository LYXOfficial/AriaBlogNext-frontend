import { cache } from "react";
import { marked } from "marked";
import { siteConfigs } from "config";
import {
    MDFilters,
    TagPlugin,
    MarkdownRewriter,
    MarkedCustomTags
} from "utils/mdplugins";

const MDRenderer = cache(async (mdContent: string, slug = "") => {
    mdContent = (new MarkdownRewriter(mdContent))
        .addFilter(MDFilters.latex)
        .addFilter(TagPlugin.linkTag)
        .addFilter(TagPlugin.foldingTag)
        .addFilter(TagPlugin.hideToggleTag)
        .addFilter(TagPlugin.colorTextTag)
        .addFilter(TagPlugin.inlineImgTag)
        .addFilter(TagPlugin.checkboxTag)
        .addFilter(TagPlugin.noteTag)
        .addFilter(TagPlugin.tipTag)
        .addFilter(TagPlugin.tabsTag)
        .addFilter(TagPlugin.chatTag)
        .addFilter(TagPlugin.promptTag)
        .runRewrite();
    const renderer = {
        ...new marked.Renderer(),
        link: MarkedCustomTags.a,
        image: MarkedCustomTags.img,
        codespan: MarkedCustomTags.codespan,
        del: MarkedCustomTags.del,
        code: MarkedCustomTags.code,
        heading: MarkedCustomTags.heading,
    }
    marked.use({ renderer: renderer });
    const renderedHtml = await marked.parse(mdContent);
    if (slug) {
        fetch(`${siteConfigs.backEndUrl}/update/post/pushRenderedHtmlCache`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                slug: slug,
                html: renderedHtml,
                secret: process.env.SECRET
            })
        });
    }
    return renderedHtml;
});

export default MDRenderer;