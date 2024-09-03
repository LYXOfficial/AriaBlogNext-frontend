import hljs from "highlight.js";
import stringRandom from "string-random"
import colorName from "color-name";
import { siteConfigs } from "@/config";

export class MDFilters{
    static latex(text){
        const mathBlockRegexMultiLine=/\$\$[\s\S]*?\$\$/g;
        const mathBlockRegexSingleLine=/.\$(.*?)\$/g;
        const codeBlockRegex=/```[\s\S]*?```|`[^`]*?`/g;
        let codeBlockMatches=[];
        let tmptext=text.replace(codeBlockRegex,(match)=>{
            codeBlockMatches.push(match);
            return `__CODEBLOCK_${codeBlockMatches.length - 1}__`;
        });
        tmptext=tmptext.replace(mathBlockRegexMultiLine,(match)=>{
            console.log(match);
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
    static linkTag(markdown){
        const linkRegex=/\{%\s*link\s+([^,]+)\s*,\s*([^,]+)\s*,\s*([^%]+)\s*%\}/g;
        return markdown.replace(linkRegex,(match,title,subtitle,link)=>{
            return `<a class="etag-link" href="${link}" title="${title}">
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
    static foldingTag(markdown){
        const foldingRegex=/{%\s*folding\s+(\w+)(?:\s+open)?\s*,\s*([^%]+)\s*%}([\s\S]*?){%\s*endfolding\s*%}/g;
        return markdown.replace(foldingRegex, (match,color,summary,content)=>{
            return `<details class="etag-folding"${match.includes('open')?' open':''} style="border:2px solid rgba(${colorName[color]},.3);">
<summary class="etag-folding-summary" style="background-color:rgba(${colorName[color]},.15);">${summary}</summary>
<div class="etag-folding-content">
${content}
</div>
</details>

`;
        });
    }
    static hideToggleTag(markdown){
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
    static colorTextTag(markdown){
        const pRegex=/{%\s*p\s+(\w+)\s*,\s*([^%]+?)\s*%}/g;
        return markdown.replace(pRegex,(match,color,text)=>{
            return `<span style="color:${color}">${text}</span>`;
        })
    }
    static inlineImgTag(markdown){
        const inlineImgRegex=/{%\s*inlineImg\s+(\S+)\s+(\d+px)\s*%}/g;
        return markdown.replace(inlineImgRegex, (match, imageUrl, height)=>{
            return `<a href="${imageUrl}" title="点击查看大图" data-fancybox="gallery" class="inline-image" style="display:inline-flex;height: ${height};" ><img class="lazy-img" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" data-src="${imageUrl}" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='"/></a>`;
        });
    }
    static checkboxTag(markdown){
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
    static noteTag(markdown){
        const noteRegex = /{%\s*note\s+(\w+)(?:\s+\w+)?\s*%}([\s\S]*?){%\s*endnote\s*%}/g;
        return markdown.replace(noteRegex,(match,icon,content)=>{
            icon=icon.toLowerCase().trim();
            content=content.trim();
            return `<div class="etag-note ${icon}">${content}</div>
 
`;
        });
    }
    static tipTag(markdown){
        const noteRegex = /{%\s*tip\s+(\w+)(?:\s+\w+)?\s*%}([\s\S]*?){%\s*endtip\s*%}/g;
        return markdown.replace(noteRegex,(match,icon,content)=>{
            icon=icon.toLowerCase().trim();
            content=content.trim();
            return `<div class="etag-note ${icon}">${content}</div>
 
`;
        });
    }
    static tabsTag(markdown){
        const tabsRegex=/{%\s*tabs\s*%}([\s\S]*?){%\s*endtabs\s*%}/g;
        const tabContentRegex=/<!--\s*tab\s+(.*?)\s*-->([\s\S]*?)<!--\s*endtab\s*-->/g;
        return markdown.replace(tabsRegex,(match,tabsContent)=>{
            let tabsHtml=`<div class="etag-tabs-container">`;
            let tabHeaders="",tabBodies="",tabIndex=0;
            tabsContent.replace(tabContentRegex,(match,tabTitle,tabBody)=>{
                const isActive=tabIndex===0?" active":"";
                tabHeaders+=`<button class="etag-tab-header${isActive}" data-index="${tabIndex}">${tabTitle}</button>`;
                tabBodies+=`<div class="etag-tab-body${isActive}" data-index="${tabIndex}">${tabBody}</div>`;
                tabIndex++;
            });
            tabsHtml+=`<div class="etag-tab-headers">${tabHeaders}</div><div class="etag-tab-bodies">${tabBodies}</div></div>`;
            return tabsHtml;
        });
    }
};
export class MarkdownRewriter{
    constructor(markdown){
        this.filter=[];
        this.markdown=markdown;
    }
    addFilter(filter){
        this.filter.push(filter);
        return this;
    }
    runRewrite(){
        return this.filter.reduce((markdown,filter)=>filter(markdown),this.markdown);
    }
}
export class MarkedCustomTags{
    static a({href,title,tokens}){
        return `<a class="normal-a" href="${href}" target="_blank" rel="noopener noreferrer">${tokens[0].text}</a>`;
    }
    static img({href,title,text}){
        return `<a href="${href}" title="点击查看大图" data-fancybox="gallery"><img class="normal-img lazy-img" data-src="${href}" alt="${text}" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='"/></a>`;
    }
    static codespan({text}){
        return `<code class="normal-inlinecode">${text}</code>`;
    }
    static code({text,lang}){
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
        return `<details class="hljs-folder" open><summary><span class="hljs-lang">${language}</span><button class="hljs-copy" title="复制代码"><svg xmlns="http://www.w3.org/2000/svg" width="0.88em" height="1em" viewBox="0 0 448 512"><path fill="#4a2121" d="M208 0h124.1C344.8 0 357 5.1 366 14.1L433.9 82c9 9 14.1 21.2 14.1 33.9V336c0 26.5-21.5 48-48 48H208c-26.5 0-48-21.5-48-48V48c0-26.5 21.5-48 48-48M48 128h80v64H64v256h192v-32h64v48c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V176c0-26.5 21.5-48 48-48"/></svg></button></summary><pre class="hljs language-${language}" data-language="${language}"><code>${highlightedCode}</code></pre></details>`;
    }
    static del({tokens}){
        return `<del class="normal-del" title="你知道的太多了">${tokens[0].text}</del>`;
    }
    static heading({text,depth}){
        let id=stringRandom(8,{numbers: false});
        return `<a class="heading-link" onclick=\"document.documentElement.scroll({top:this.offsetTop-70,behavior:\'smooth\'})\"><h${depth} id="title-${id}">${text}</h${depth}></a>`;
    }
}