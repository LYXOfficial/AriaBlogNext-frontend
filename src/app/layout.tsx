import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import '../styles/global.css'
export const metadata = {
  title: 'Ariasakaの小窝',
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
