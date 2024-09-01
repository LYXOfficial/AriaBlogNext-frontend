"use client"
import { useEffect,useState } from "react";
import "twikoo/dist/twikoo.css";
import "styles/Twikoo.css";
import { siteConfigs } from "config";
import { Icon } from "@iconify/react";
import "styles/owoBig.css"

export function TwikooBaseComment(){
    const [tkloadState,setTkloadState]=useState("加载中...");
    useEffect(()=>{
        function owoBig() {
            let flag = 1, // 设置节流阀
                owo_time = '', // 设置计时器
                m = 3; // 设置放大倍数
            // 创建盒子
            let div = document.createElement('div'),
                body = document.querySelector('body');
            // 设置ID
            div.id = 'owo-big';
            // 插入盒子
            body.appendChild(div)
        
            // 构造observer
            let observer = new MutationObserver(mutations => {
        
                for (let i = 0; i < mutations.length; i++) {
                    let dom = mutations[i].addedNodes,
                        owo_body = '';
                    if (dom.length == 2 && dom[1].className == 'OwO-body') owo_body = dom[1];
                    // 如果需要在评论内容中启用此功能请解除下面的注释
                    else if (dom.length == 1 && dom[0].className == 'tk-comment') owo_body = dom[0];
                    else continue;
                    
                    // 禁用右键（手机端长按会出现右键菜单，为了体验给禁用掉）
                    if (document.body.clientWidth <= 768) owo_body.addEventListener('contextmenu', e => e.preventDefault());
                    // 鼠标移入
                    owo_body.onmouseover = (e) => {
                            if (flag && e.target.tagName == 'IMG') {
                                flag = 0;
                                // 移入300毫秒后显示盒子
                                owo_time = setTimeout(() => {
                                    let height = e.target.clientHeight * m, // 盒子高 2023-02-16更新
                                        width = e.target.clientWidth * m, // 盒子宽 2023-02-16更新
                                        left = (e.x - e.offsetX) - (width - e.target.clientWidth) / 2, // 盒子与屏幕左边距离 2023-02-16更新
                                        top = e.y - e.offsetY; // 盒子与屏幕顶部距离
        
                                    if ((left + width) > body.clientWidth) left -= ((left + width) - body.clientWidth + 10); // 右边缘检测，防止超出屏幕
                                    if (left < 0) left = 10; // 左边缘检测，防止超出屏幕
                                    // 设置盒子样式
                                    div.style.cssText = `display:flex; height:${height}px; width:${width}px; left:${left}px; top:${top}px;`;
                                    // 在盒子中插入图片
                                    div.innerHTML = `<img src="${e.target.src}">`
                                }, 300);
                            }
                        };
                    // 鼠标移出隐藏盒子
                    owo_body.onmouseout = () => { div.style.display = 'none', flag = 1, clearTimeout(owo_time); }
                }
        
            })
            observer.observe(document.getElementById('twikoo'), { subtree: true, childList: true }) // 监听的 元素 和 配置项
        }
        const tk=require('twikoo/dist/twikoo.min');
        try{
            tk.init({
                envId: siteConfigs.twikooEnv,
                el: '#post-comment',
            })
            owoBig();
        }
        catch(e){
            setTkloadState('加载失败，请检查配置');
        }

        return ()=>{
            const tkel=document.querySelector("#twikoo");
            if(tkel){
                tkel.innerHTML="";
                tkel.className="";
                tkel.id="post-comment";
            }
        }

    },[]);
    return <div id="post-comment-container">
        <div id="post-comment-header">
            <Icon icon="fa6-solid:comments"/>
            <h2>评论</h2>
        </div>
        <div id="post-comment">{tkloadState}</div>
    </div>;
}
export function TwikooCountPost(){
    useEffect(()=>{
        const tk=require('twikoo/dist/twikoo.min');
        tk.getCommentsCount({
            envId: siteConfigs.twikooEnv,
            urls: [document.location.pathname,document.location.pathname+"/"],
            includeReply: true,
        }).then(res=>{
            if(document.querySelector(".post-commentcount>.post-meta-content"))
                document.querySelector(".post-commentcount>.post-meta-content").innerText=`${res[0].count+res[1].count} 条评论`;
        });
    },[]);
    return <></>;
}
export function TwikooCountHome(){
    useEffect(()=>{(async ()=>{
        const tk=require('twikoo/dist/twikoo.min');
        document.querySelectorAll(".post-info").forEach((el)=>{
            let hr="/"+el.querySelector(".post-title").href.split("/").slice(3).join("/");
            tk.getCommentsCount({
                envId: siteConfigs.twikooEnv,
                urls: [hr,hr+"/"],
                includeReply: true
            }).then(res=>{
                el.querySelector(".post-commentcount>.post-meta-content").innerText=`${res[0].count+res[1].count} 条评论`;
            });
        });
        const rest=await fetch(`${siteConfigs.backEndUrl}/get/post/postSlugs`,{next:{tags:["posts"]}});
        const pages=["/messageboard","/messageboard/","/speaks","/speaks/","/about","/about/","/links","/links/"];
        if(rest.ok){
            const postSlugs=(await rest.json()).data;
            tk.getCommentsCount({
                envId: siteConfigs.twikooEnv,
                urls: postSlugs.map(res=>`/posts/${res}`).concat(postSlugs.map(res=>`/posts/${res}/`)).concat(pages),
                includeReply: true
            }).then(res=>{
                if(document.querySelector(".card-webinfo-item-right.commentcount"))
                    document.querySelector(".card-webinfo-item-right.commentcount").innerText=res.map(r=>r.count).reduce((a,b)=>a+b);
            });
        }
    })()},[]);
    return <></>;
}