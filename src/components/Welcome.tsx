"use client"
import { useEffect } from 'react';
import Snackbar from "node-snackbar";
import "node-snackbar/src/sass/snackbar.sass";
import { useRouter } from 'next/navigation';

export default function Welcome() {
    const router=useRouter();
    useEffect(()=>{
        if(sessionStorage.getItem("showedWelcome")!="1"){
            if(document.referrer==undefined||document.referrer.indexOf("yaria.top")!=-1||document.referrer.indexOf("yisous.xyz")!=-1){
                Snackbar.show({
                    pos: "top-right",
                    showAction: false,
                    text: '欢迎访问本站！'
                });
            }
            else{
                Snackbar.show({
                    pos: "top-right",
                    showAction: false,
                    text: `欢迎来自${document.referrer.split("://")[1].split("/")[0]}的朋友访问本站！`
                });
            }
            setTimeout(()=>{
                Snackbar.show({
                    text: '本站使用Cookie和本地/会话存储保证浏览体验和网站统计',
                    pos: 'bottom-right',
                    actionText: "查看博客声明",
                    onActionClick: function(){
                        router.push("/license");
                    },
                });
                sessionStorage.setItem("showedWelcome","1");
            },3000);
        }
    });
    return <></>;
}