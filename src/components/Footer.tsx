import "src/styles/Footer.css"

export default function Footer() {
    return (<footer id="footer">
        <div id="footer-wrap">
            <div id="footer-copyright">©2022 - {new Date().getFullYear()} By Ariasaka</div>
            <div id="footer-framework-info">
                <a target="_blank" rel="noopener external nofollow noreferrer" href="https://nextjs.org">
                    <img src="https://img.shields.io/badge/Framework-Next.js-black"/>
                </a>
                <a target="_blank" rel="noopener external nofollow noreferrer" href="https://vercel.app">
                    <img src="https://img.shields.io/badge/Hosted-Vercel-success"/>
                </a>
                <a target="_blank" rel="noopener external nofollow noreferrer" href="https://chuqiyun.com">
                    <img src="https://img.shields.io/badge/CDN-ChuqiCDN-006CFF"/>
                </a>
                <a target="_blank" rel="noopener external nofollow noreferrer" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
                    <img src="https://img.shields.io/badge/CC-BY--NC--SA4.0-red"/>
                </a>
                <a target="_blank" rel="noopener external nofollow noreferrer" href="https://icp.gov.moe/?keyword=20222035">
                    <img src="https://img.shields.io/badge/%E8%90%8CICP%E5%A4%87-20222035-ff69b4"/>
                </a>
            </div>
            <div id="footer-rundays"> 这个小破站已运行 2 年 85 天 2 时 12 分 19 秒</div>
        </div>
    </footer>);
}