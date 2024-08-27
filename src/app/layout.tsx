import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import '../styles/global.css'
import { siteInfos } from "public/config"

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
        <NavBar/>
        <div id="main-container">{children}</div>
        <Footer/>
      </body>
    </html>
  )
}
