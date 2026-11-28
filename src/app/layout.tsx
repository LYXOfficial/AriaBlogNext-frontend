import NavBar from "components/NavBar";
import Footer from "components/Footer";
import MusicPlayer from "components/MusicPlayer";
import "styles/global.css";
import { siteConfigs } from "@/config";
import Welcome from "components/thirdpartyjs/Welcome";
import LicenseTips from "components/thirdpartyjs/LicenseTips";
import NextTopLoader from "nextjs-toploader";

process.env.TZ = "Asia/Shanghai";

export const metadata = {
  title: siteConfigs.title,
  alternates: {
    types: {
      "application/rss+xml": [{ url: "feed.xml", title: "RSS 订阅" }],
    },
  },
  description: "Ariasakaの小窝QwQ",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-cn">
      <head>
        <link rel="preconnect" href="https://img.0v0.my" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://img.0v0.my" />
        <link rel="preconnect" href="https://npm.elemecdn.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if(!!window.ActiveXObject||"ActiveXObject" in window)window.location.href="./noie.html";//IE不欢迎你`,
          }}
        />
        <script src="/js/piratesHaveNoMother.js" defer />
      </head>
      <body>
        <Welcome />
        <LicenseTips />
        <NavBar />
        <NextTopLoader color="var(--aria-theme)" height={5} />
        <main id="main-content" style={{ display: "contents" }}>
          {children}
        </main>
        <Footer />
        <MusicPlayer />
      </body>
    </html>
  );
}
