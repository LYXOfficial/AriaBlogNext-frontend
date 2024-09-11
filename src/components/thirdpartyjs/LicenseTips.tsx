"use client";
import { useEffect } from 'react';
import Snackbar from "node-snackbar";
import "node-snackbar/src/sass/snackbar.sass";
import { useRouter } from 'next/navigation';

export default function LicenseTips() {
    const router=useRouter();
    useEffect(()=>{
        const cpl:any=function () {
            Snackbar.show({
                text: '复制成功,转载请注明出处！',
                pos: 'top-right',
                onActionClick: function (element) {
                    router.push("/license");
                },
                actionText: "查看博客声明",
            });
        }
        document.addEventListener("copy",cpl);
        const kdl:any=function (event:any) {
            event = (event || window.event);
            if (event.keyCode == 123) {
                Snackbar.show({
                    text: '已打开开发者模式，请谨记GPL协议！',
                    pos: 'top-right',
                    onActionClick: function (element) {
                        router.push("/license");
                    },
                    actionText: "查看博客声明",
                });
            }
        }
        document.addEventListener("keydown",kdl);
        return ()=>{
            document.removeEventListener("copy",cpl);
            document.removeEventListener("keydown",kdl);
        }
    },[]);
    return <></>;
}