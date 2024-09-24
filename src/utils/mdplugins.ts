import hljs from "highlight.js";
import stringRandom from "string-random"
import colorName from "color-name";
import { siteConfigs } from "@/config";

export class MDFilters{
    static latex(text:string){
        const mathBlockRegexMultiLine=/\$\$[\s\S]*?\$\$/g;
        const mathBlockRegexSingleLine=/.\$(.*?)\$/g;
        const codeBlockRegex=/```[\s\S]*?```|`[^`]*?`/g;
        let codeBlockMatches:string[]=[];
        let tmptext=text.replace(codeBlockRegex,(match)=>{
            codeBlockMatches.push(match);
            return `__CODEBLOCK_${codeBlockMatches.length - 1}__`;
        });
        tmptext=tmptext.replace(mathBlockRegexMultiLine,(match)=>{
            return match.replace(/([*_~`>#+\-=|{}.!])/g,'\\$1');
        });
        tmptext=tmptext.replace(mathBlockRegexSingleLine,(match)=>{
            return match.replace(/([*_~`>#+\-=|{}.!])/g,'\\$1');
        });
        return tmptext.replace(/__CODEBLOCK_(\d+)__/g,(match,index)=>{
            return codeBlockMatches[index];
        });
    }
};
export class TagPlugin{
    static linkTag(markdown:string){
        const linkRegex=/\{%\s*link\s+([^,]+)\s*,\s*([^,]+)\s*,\s*([^\s%][^%]*)\s*%\}/g;
        return markdown.replace(linkRegex,(match,title,subtitle,link)=>{
            return `<a class="etag-link" href="${link}" target="_blank" rel="noopener noreferrer" title="${title}">
<span class="etag-link-tip">
前往以下网站，不保证安全性哦喵~
</span>
<img class="etag-link-img" src="https://api.iowen.cn/favicon/${link[0]=="/"||link[0]=="."?siteConfigs.siteUrl.split("://")[1]:link.split("://")[1]?.split("/")[0]}.png" onerror="this.src='https://bu.dusays.com/2024/07/07/668a8ffdacde3.png'">
</img>
<span class="etag-link-title">
${title}
</span>
<span class="etag-link-subtitle">
${subtitle}
</span>
</a>
        
`;
        });
    }
    static foldingTag(markdown:string){
        const foldingRegex=/{%\s*folding\s+(\w+)(?:\s+open)?\s*,\s*([^%]+)\s*%}([\s\S]*?){%\s*endfolding\s*%}/g;
        return markdown.replace(foldingRegex, (match,color:string,summary,content)=>{
            return `<details class="etag-folding"${match.includes('open')?' open':''} style="border:2px solid rgba(${colorName[color as keyof typeof colorName]},.3);">
<summary class="etag-folding-summary" style="background-color:rgba(${colorName[color as keyof typeof colorName]},.15);">${summary}</summary>
<div class="etag-folding-content">

${content}

</div>
</details>

`;
        });
    }
    static hideToggleTag(markdown:string){
        const foldingRegex=/{%\s*hideToggle(?:\s*(open)\s*,)?\s*([^%]+?)\s*%}([\s\S]*?){%\s*endhideToggle\s*%}/g;
        return markdown.replace(foldingRegex, (match,open,summary,content)=>{
            const color="gray";
            return `<details class="etag-folding"${open?' open':''} style="border:2px solid rgba(${colorName[color]},.3);">
<summary class="etag-folding-summary" style="background-color:rgba(${colorName[color]},.15);">${summary}</summary>
<div class="etag-folding-content">

${content}

</div>
</details>

`;
        });
    }
    static colorTextTag(markdown:string){
        const pRegex=/{%\s*p\s+(\w+)\s*,\s*([^%]+?)\s*%}/g;
        return markdown.replace(pRegex,(match,color,text)=>{
            return `<span style="color:${color}">${text}</span>`;
        })
    }
    static inlineImgTag(markdown:string){
        const inlineImgRegex=/{%\s*inlineImg\s+(\S+)\s+(\d+px)\s*%}/g;
        return markdown.replace(inlineImgRegex, (match, imageUrl, height)=>{
            return `<a href="${imageUrl}" title="点击查看大图" data-fancybox="gallery" class="inline-image" style="display:inline-flex;height: ${height};" ><img class="lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="${imageUrl}" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='"/></a>`;
        });
    }
    static checkboxTag(markdown:string){
        const checkboxRegex=/{%\s*checkbox\s*(checked,)?(\s*([^%]*))?\s*%}/g;
        return markdown.replace(checkboxRegex,(match,checked,labelText)=>{
            const isChecked=checked?'checked':'';
            const text = labelText ? labelText.trim() : '';
            return `<label class="etag-checkbox">
<input type="checkbox" ${isChecked} disabled />
<span>${text}</span>
</label>`;
        });
    }
    static noteTag(markdown:string){
        const noteRegex = /{%\s*note\s+(\w+)(?:\s+\w+)?\s*%}([\s\S]*?){%\s*endnote\s*%}/g;
        return markdown.replace(noteRegex,(match,icon,content)=>{
            icon=icon.toLowerCase().trim();
            content=content.trim();
            return `<div class="etag-note ${icon}">

${content}

</div>

`;
        });
    }
    static tipTag(markdown:string){
        const noteRegex = /{%\s*tip\s+(\w+)(?:\s+\w+)?\s*%}([\s\S]*?){%\s*endtip\s*%}/g;
        return markdown.replace(noteRegex,(match,icon,content)=>{
            icon=icon.toLowerCase().trim();
            content=content.trim();
            return `<div class="etag-note ${icon}">${content}</div>

`;
        });
    }
    static tabsTag(markdown:string){
        const tabsRegex=/{%\s*tabs\s*%}([\s\S]*?){%\s*endtabs\s*%}/g;
        const tabContentRegex=/<!--\s*tab\s+(.*?)\s*-->([\s\S]*?)<!--\s*endtab\s*-->/g;
        return markdown.replace(tabsRegex,(match,tabsContent)=>{
            let tabsHtml=`<div class="etag-tabs-container">`;
            let tabHeaders="",tabBodies="",tabIndex=0;
            tabsContent.replace(tabContentRegex,(match:string,tabTitle:string,tabBody:string)=>{
                const isActive=tabIndex===0?" active":"";
                tabHeaders+=`<button class="etag-tab-header${isActive}" data-index="${tabIndex}">${tabTitle}</button>`;
                tabBodies+=`<div class="etag-tab-body${isActive}" data-index="${tabIndex}">

${tabBody}

</div>`;
                tabIndex++;
            });
            tabsHtml+=`<div class="etag-tab-headers">${tabHeaders}</div><div class="etag-tab-bodies">

${tabBodies}

</div></div>

`;
            console.log(tabsHtml);
            return tabsHtml;
        });
    }
    static chatTag(markdown:string){
        const chatRegex=/{%\s*chat\s+(left|right)\s*,\s*([^%]+)\s*%}([\s\S]*?)\s*{%\s*endchat\s*%}/g;
        return markdown.replace(chatRegex, (match, position, author, content) => {
            return `<div class="etag-chat ${position.trim()}">
<div class="etag-chat-content">
<span class="etag-chat-author">${author.trim()}</span>
<div class="etag-chat-message">

${content}

</div>
</div>
</div>

`;
        });
    }
    static promptTag(markdown: string) {
        const promptRegex = /{%\s*prompt\s+([^,]+)\s*,\s*([^%]+)\s*%}/g;
        return markdown.replace(promptRegex, (match, content, message) => {
            return `<span class="etag-prompt" onmouseenter="this.querySelector('.etag-prompt-tooltip').className='etag-prompt-tooltip show'" onmouseleave="this.querySelector('.etag-prompt-tooltip').className='etag-prompt-tooltip hide'">${content.trim()}<span class="etag-prompt-tooltip hide">${message.trim()}</span></span>`;
        });
    }
};
export class MarkdownRewriter{
    filter:((markdown:string)=>string)[];
    markdown:string;
    constructor(markdown:string){
        this.filter=[];
        this.markdown=markdown;
    }
    addFilter(filter:(markdown:string)=>string){
        this.filter.push(filter);
        return this;
    }
    runRewrite(){
        return this.filter.reduce((markdown,filter)=>filter(markdown),this.markdown);
    }
}
export class MarkedCustomTags{
    static a({href,title,tokens}:{href:string,title?:string|undefined|null,tokens:any[]}){
        return `<a class="normal-a" href="${href}" target="_blank" rel="noopener noreferrer">${tokens[0].text}</a>`;
    }
    static img({href,title,text}:{href:string,title:string|null,text:string}){
        return `<a href="${href}" title="点击查看大图" data-fancybox="gallery"><img class="normal-img lazy-img" data-src="${href}" alt="${text}" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='"/></a>`;
    }
    static codespan({text}:{text:string}){
        return `<code class="normal-inlinecode">${text}</code>`;
    }
    static code({text,lang}:{text:string,lang?:string|undefined}){
        let language=lang?lang.toUpperCase():"";
        if(!language) language="TEXT";
        if(language == "") language="TEXT";
        let highlightedCode;
        try{
            highlightedCode=hljs.highlight(language,text).value;
        }
        catch(e){
            language="TEXT";
            highlightedCode=hljs.highlight(language,text).value;
        }
        return `<details class="hljs-folder" open><summary><span class="hljs-lang">${language}</span><button class="hljs-wrapper" title="自动换行"><svg xmlns="http://www.w3.org/2000/svg" width="0.88em" height="1em" viewBox="0 0 384 512"><path fill="currentColor" d="M32 64C14.3 64 0 49.7 0 32S14.3 0 32 0h96c53 0 96 43 96 96v306.7l73.4-73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-128 128c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l73.3 73.4V96c0-17.7-14.3-32-32-32z"/></svg></button><button class="hljs-copy" title="复制代码"><svg xmlns="http://www.w3.org/2000/svg" width="0.88em" height="1em" viewBox="0 0 448 512"><path fill="#4a2121" d="M208 0h124.1C344.8 0 357 5.1 366 14.1L433.9 82c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48M48 128h80v64H64v256h192v-32h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48"/></svg></button></summary><pre class="hljs language-${language}" data-language="${language}"><code>${highlightedCode}</code></pre></details>`;
    }
    static del({tokens}:{tokens:any}){
        return `<del class="normal-del" title="你知道的太多了">${tokens[0].text}</del>`;
    }
    static heading({text,depth}:{text:string,depth:number}){
        let id=stringRandom(8,{numbers: false});
        return `<a class="heading-link" onclick=\"document.documentElement.scroll({top:this.offsetTop-70,behavior:\'smooth\'})\"><h${depth} id="title-${id}">${text}</h${depth}></a>`;
    }
}