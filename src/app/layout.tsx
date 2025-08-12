import NavBar from 'components/NavBar';
import Footer from 'components/Footer';
import 'styles/global.css';
import { siteConfigs } from "@/config";
import Welcome from 'components/thirdpartyjs/Welcome';
import LicenseTips from "components/thirdpartyjs/LicenseTips";
import NextTopLoader from 'nextjs-toploader';
import PostChat from 'components/PostChat';

process.env.TZ = "Asia/Shanghai";

export const metadata = {
  title: siteConfigs.title,
  alternates: {
    types: {
      'application/rss+xml': [{ url: 'feed.xml', title: 'RSS 订阅' }],
    },
  },
  describe: "Ariasakaの小窝QwQ",
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-cn">
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: `if(!!window.ActiveXObject||"ActiveXObject" in window)window.location.href="./noie.html";//IE不欢迎你` }}
        />
        <script src="/js/piratesHaveNoMother.js" />
      </head>
      <body>
        <Welcome />
        <LicenseTips />
        <NavBar />
        <NextTopLoader color="var(--aria-theme)" height={5} />
        {children}
        <PostChat />
        <Footer />
      </body>
    </html>
  )
}
