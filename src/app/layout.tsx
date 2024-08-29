import NavBar from 'src/components/NavBar';
import Footer from 'src/components/Footer';
import 'src/styles/global.css';
import { siteConfigs } from "public/config";
import Welcome from 'src/components/thirdpartyjs/Welcome';
import LicenseTips from "src/components/thirdpartyjs/LicenseTips";

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
          {children}
        <Footer/>
      </body>
    </html>
  )
}
