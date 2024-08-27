import { cache } from "react";
import { marked } from "marked";
import hljs from "highlight.js";


export default async function MDRenderer(mdContent){
    return cache(async (mdContent)=>{
        const renderer=new marked.Renderer();
        renderer.link=({href,title,tokens})=>{
            return `<a class="normal-a" href="${href}" title="${title} target="_blank" rel="noopener noreferrer">${tokens[0].text}</a>`;
        }
        renderer.image=({href,title,text})=>{
            return `<a href="${href}" title="点击查看大图" data-fancybox><img class="normal-img" src="${href}" alt="${text}"/></a>`;
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
        }
        marked.use({renderer: renderer});
        return await marked.parse(mdContent);
    })(mdContent);
}