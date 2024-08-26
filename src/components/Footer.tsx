"use client"
import "src/styles/Footer.css"
import { useState } from "react"

export default function Footer(){
    const [footerRunDaysContent,setFooterRunDaysContent]=useState("这个小破站已运行 2 年 85 天 2 时 12 分 19 秒");
    setInterval(()=>{
        let seconds = 1000;
        let minutes = seconds * 60;
        let hours = minutes * 60;
        let days = hours * 24;
        let years = days * 365;
        let today = new Date();
        let todayYear = today.getFullYear();
        let todayMonth = today.getMonth()+1;
        let todayDate = today.getDate();
        let todayHour = today.getHours();
        let todayMinute = today.getMinutes();
        let todaySecond = today.getSeconds();
        let t1 = Date.UTC(2022,6,4,12,0,0);
        let t2 = Date.UTC(todayYear,todayMonth,todayDate,todayHour,todayMinute,todaySecond);
        let diff = t2-t1;
        let diffYears = Math.floor(diff/years);
        let diffDays = Math.floor((diff/days)-diffYears*365);
        let diffHours = Math.floor((diff-(diffYears*365+diffDays)*days)/hours);
        let diffMinutes = Math.floor((diff-(diffYears*365+diffDays)*days-diffHours*hours)/minutes);
        let diffSeconds = Math.floor((diff-(diffYears*365+diffDays)*days-diffHours*hours-diffMinutes*minutes)/seconds);
        setFooterRunDaysContent(" 这个小破站已运行 "+diffYears+" 年 "+diffDays+" 天 "+diffHours+" 时 "+diffMinutes+" 分 "+diffSeconds+" 秒");
    },1000);
    return (<footer id="footer">
        <div id="footer-wrap">
            <div id="footer-copyright">©2022 - {new Date().getFullYear()} By Ariasaka</div>
            <div id="footer-framework-info">
                <a target="_blank" rel="noopener external nofollow noreferrer" href="https://nextjs.org">
                    <img src="https://img.shields.io/badge/Framework-Next.js-black" alt=""/>
                </a>
                <a target="_blank" rel="noopener external nofollow noreferrer" href="https://vercel.app">
                    <img src="https://img.shields.io/badge/Hosted-Vercel-success" alt=""/>
                </a>
                <a target="_blank" rel="noopener external nofollow noreferrer" href="https://chuqiyun.com">
                    <img src="https://img.shields.io/badge/CDN-ChuqiCDN-006CFF" alt=""/>
                </a>
                <a target="_blank" rel="noopener external nofollow noreferrer" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
                    <img src="https://img.shields.io/badge/CC-BY--NC--SA4.0-red" alt=""/>
                </a>
                <a target="_blank" rel="noopener external nofollow noreferrer" href="https://icp.gov.moe/?keyword=20222035">
                    <img src="https://img.shields.io/badge/%E8%90%8CICP%E5%A4%87-20222035-ff69b4" alt=""/>
                </a>
            </div>
            <div id="footer-rundays">{footerRunDaysContent}</div>
        </div>
    </footer>);
}