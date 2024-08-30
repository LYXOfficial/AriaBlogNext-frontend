import { cache } from "react";
import { marked } from "marked";
import hljs from "highlight.js";
import stringRandom from "string-random"
import { siteConfigs } from "public/config";
// import rehypeStringify from 'rehype-stringify'
// import remarkParse from 'remark-parse'
// import remarkRehype from 'remark-rehype'
// import remarkMath from 'remark-math'
// import remarkGFM from "remark-gfm"
// import rehypeRewrite from 'rehype-rewrite'
// import {unified} from 'unified'
function escapeMarkdownInMath(text) {
    // 正则表达式匹配 `$$...$$` 和 `$$$$...$$$$` 中的内容
    const mathBlockRegex = /((\$)(.*?)(\$)|(\$\$)([\s\S]*?)(\$\$))/g;
    // 处理匹配的内容
    return text.replace(mathBlockRegex, (match, open, content, close) => {
        // 在内容中转义 Markdown 符号
        const escapedContent = content.replace(/([*_\[\]()~`>#+\-=|{}.!])/g, '\\$1');
        return open + escapedContent + close;
    });
}
const MDRenderer=cache(async (mdContent,slug)=>{
    // mdContent=escapeMarkdownInMath(mdContent);
    const renderer=new marked.Renderer();
    renderer.link=({href,title,tokens})=>{
        return `<a class="normal-a" href="${href}" title="${title} target="_blank" rel="noopener noreferrer">${tokens[0].text}</a>`;
    }
    renderer.image=({href,title,text})=>{
        return `<a href="${href}" title="点击查看大图" data-fancybox><img class="normal-img lazy-img" data-src="${href}" alt="${text}"/></a>`;
    }
    renderer.codespan=({text})=>{
        return `<code class="normal-inlinecode">${text}</code>`;
    }
    renderer.code=({text,lang})=>{
        let language=lang?lang.toUpperCase():"";
        if(!language) language = "TEXT";
        if(language == "") language = "TEXT";
        let highlightedCode;
        try{
            highlightedCode=hljs.highlight(language,text).value;
        }
        catch(e){
            language="TEXT";
            highlightedCode=hljs.highlight(language,text).value;
        }
        return `<details class="hljs-folder" open><summary><span class="hljs-lang">${language}</span><button class="hljs-copy" title="复制代码"><svg xmlns="http://www.w3.org/2000/svg" width="0.88em" height="1em" viewBox="0 0 448 512"><path fill="#4a2121" d="M208 0h124.1C344.8 0 357 5.1 366 14.1L433.9 82c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48M48 128h80v64H64v256h192v-32h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48"/></svg></button></summary><pre class="hljs language-${language}" data-language="${language}"><code>${highlightedCode}</code></pre></details>`;
    };
    renderer.del=({tokens})=>{
        return `<del class="normal-del" title="你知道的太多了">${tokens[0].text}</del>`;
    };
    renderer.heading=({text,depth})=>{
        let id=stringRandom(8,{numbers: false});
        return `<a class="heading-link" onclick=\"document.documentElement.scroll({top:this.offsetTop-70,behavior:\'smooth\'})\"><h${depth} id="title-${id}">${text}</h${depth}></a>`;
    };
    marked.use({renderer: renderer});
    const renderedHtml=await marked.parse(mdContent);
    fetch(`${siteConfigs.backEndUrl}/update/post/pushRenderedHtmlCache`,{
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
    return renderedHtml;
    // return String(await unified()
    //     .use(remarkMath)
    //     .use(remarkGFM)
    //     .use(remarkParse)
    //     .use(remarkRehype)
    //     .use(rehypeRewrite,{
    //         rewrite:(node,_,parent)=>{
    //             if(node.type=='element'){
    //                 if(node.tagName=='a'){
    //                     node.properties.target='_blank';
    //                     node.properties.rel='noopener noreferrer';
    //                     node.properties.title='新标签页打开';
    //                     node.properties.class="normal-a";
    //                 }
    //                 else if(node.tagName=='del'){
    //                     node.properties.title='你知道的太多了';
    //                     node.properties.class="normal-del";
    //                 }
    //                 else if(node.tagName=='code'&&parent.tagName!="pre"){
    //                     node.properties.class="normal-inlinecode";
    //                 }
    //                 else if(node.tagName=='pre'){
    //                     let lang=node.children[0].properties.class?.split("-")[1];
    //                     let language=lang?lang.toUpperCase():"";
    //                     if(!language) language = "TEXT";
    //                     if(language == "") language = "TEXT";
    //                     let highlightedCode;
    //                     // console.log(node.children[0]);
    //                     try{
    //                         highlightedCode=hljs.highlight(language,node.children[0].children[0].value).value;
    //                     }
    //                     catch(e){
    //                         language="TEXT";
    //                         highlightedCode=hljs.highlight(language,node.children[0].children[0].value).value;
    //                     }
    //                     node.value=`<details class="hljs-folder" open><summary><span class="hljs-lang">${language}</span><button class="hljs-copy" title="复制代码"><svg xmlns="http://www.w3.org/2000/svg" width="0.88em" height="1em" viewBox="0 0 448 512"><path fill="#4a2121" d="M208 0h124.1C344.8 0 357 5.1 366 14.1L433.9 82c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48M48 128h80v64H64v256h192v-32h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48"/></svg></button></summary><pre class="hljs language-${language}" data-language="${language}"><code>${highlightedCode}</code></pre></details>`;
    //                     console.log(node.value);
    //                 }
    //             }
    //         }
    //     })
    //     .use(rehypeStringify)
    //     .process(mdContent));
});

export default MDRenderer;