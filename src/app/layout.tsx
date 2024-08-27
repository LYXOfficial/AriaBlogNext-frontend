import NavBar from 'src/components/NavBar';
import Footer from 'src/components/Footer';
import 'src/styles/global.css';
import { siteInfos } from "public/config";
import Welcome from 'src/components/Welcome';
import LicenseTips from "src/components/LicenseTips";

export const metadata = {
  title: siteInfos.title,
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
