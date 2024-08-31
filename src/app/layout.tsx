import NavBar from 'src/components/NavBar';
import Footer from 'src/components/Footer';
import 'src/styles/global.css';
import { siteConfigs } from "public/config";
import Welcome from 'src/components/thirdpartyjs/Welcome';
import LicenseTips from "src/components/thirdpartyjs/LicenseTips";
import NextTopLoader from 'nextjs-toploader';

process.env.TZ="Asia/Shanghai";

export const metadata = {
  title: siteConfigs.title,
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-cn">
      <body>
        <Welcome/>
        <LicenseTips/>
        <NavBar/>
        <NextTopLoader color="var(--aria-theme)" height={5}/>
        {children}
        <Footer/>
      </body>
    </html>
  )
}
