import NavBar from 'components/NavBar';
import Footer from 'components/Footer';
import 'styles/global.css';
import { siteConfigs } from "config";
import Welcome from 'components/thirdpartyjs/Welcome';
import LicenseTips from "components/thirdpartyjs/LicenseTips";
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
