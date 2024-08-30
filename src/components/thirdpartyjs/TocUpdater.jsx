"use client"
import { useEffect,cache } from "react";
const flattenTOC = cache((toc) => {
    const flatList = [];
    const traverse = (items) => {
        items.forEach(item => {
            if (item.href) {
                flatList.push(item);
            }
            if (item.children) {
                traverse(item.children);
            }
        });
    };
    traverse(toc);
    return flatList;
});
const calcProgress=()=>{
    const postContent = document.getElementById('post-maincontent');
    const tocCounter = document.querySelector('.toc-counter');
    if(postContent){
        const postContentRect = postContent.getBoundingClientRect();
        const windowHeight = window.innerHeight-60;
        const scrollPercentage = ((windowHeight - postContentRect.top) / (windowHeight + postContentRect.height)) * 100;
        const boundedScrollPercentage = Math.min(Math.max(scrollPercentage, 0), 100)
        tocCounter.innerText=boundedScrollPercentage.toFixed(0);
    }
}
export default function TocUpdater({ tocTree }) {
    useEffect(() => {
        // window.scrollTo(0, 0);
        calcProgress();
        const handleScroll = () => {
            const flatTOCTree=flattenTOC(tocTree);
            const offsets = flatTOCTree.flatMap(item => {
                const element = document.getElementById(item.href);
                return element ? [{ id: item.href.slice(0), offsetTop: element.offsetTop }] : [];
            });
            const currentScrollPosition = window.scrollY + 80; // Offset for top padding
            let currentActiveId = '';
            for (let i = offsets.length - 1; i >= 0; i--) {
                if (currentScrollPosition >= offsets[i].offsetTop) {
                    currentActiveId = offsets[i].id;
                    break;
                }
            }
            let currentTocLink=document.getElementById(`toc-${currentActiveId}`);
            if(currentTocLink){
                currentTocLink.className="toc-link active";
                document.querySelectorAll(`.toc-link:not(#toc-${currentActiveId})`).forEach(item=>{
                    item.className="toc-link";
                });
                // document.querySelector(".toc-content").scroll({top: currentTocLink.offsetTop-70, behavior: 'smooth'});
                let currentTopToc=currentTocLink;
                while(1){
                    currentTopToc=currentTopToc.parentNode;
                    if(currentTopToc.parentNode.className==="toc-content")
                        break;
                }
                Array.from(document.querySelector(".toc-content").children).forEach(item=>{
                    if(item.children.length==2){
                        if(item!=currentTopToc){
                            item.children[1].className="toc-children hide";
                        }
                        else item.children[1].className="toc-children";
                    }
                })
            }
            calcProgress();
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Run on mount to set initial active link
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [tocTree]);
    return <></>;
}