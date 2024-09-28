import { HomeRightSide } from "@/components/RightSide";
import { siteConfigs } from "@/config";
import "styles/Pages.css";
import "styles/PostContent.css";
export const metadata = {
  title: "声明 | "+siteConfigs.title,
}
export default function License() {
  return (
    <>
      <style>{`#navbar{position:fixed}`}</style>
      <div id="main-container" className="page">
        <div id="article-container" className="page flink">
          <div id="post-maincontent" className="page">
            <h1>声明 | 版权协议</h1>
            <p>
              为了保持文章质量，并保持互联网的开放共享精神，保持页面流量的稳定，综合考虑下本站的所有原创文章均采用 Creative Commons 协议中的CC-BY-NC-SA 4.0 国际标准。这篇文章能够更加清楚明白的介绍本站的协议标准和要求。方便您合理的使用本站的文章。
            </p>
            <p>
              本站无广告嵌入和商业行为。违反协议的行为不仅会损害原作者的创作热情，而且会影响版权环境。强烈呼吁您能够在转载时遵守协议。遵守协议的行为几乎不会对您的目标产生负面影响，鼓励创作环境是每个创作者的期望。
            </p>
            <h2>你可以做什么？</h2>
            <p>
              共享 — 在任何媒介以任何形式复制、发行本作品；<br/>
              演绎 — 修改、转换或以本作品为基础进行创作；<br/>
              只要您遵守本页的许可，您可以自由地共享文章的内容 — 在任何媒介以任何形式复制、发行本作品。并且无需通知作者。
            </p>
            <h2>你需要遵守什么样的许可？</h2>
            <h3>署名</h3>
            <p>
            您必须给出适当的署名，提供指向本许可协议的链接，同时标明是否（对原始作品）作了修改。您可以用任何合理的方式来署名，但是不得以任何方式暗示许可人为您或您的使用背书。
            </p>
            <h3>禁止商用</h3>
            <p>
              本站内容免费向互联网所有用户提供，分享本站文章时禁止商业性使用、禁止收费阅读、禁止在转载页面中插入广告、禁止阅读拦截行为（包括但不限于：关注公众号、下载App后浏览文章）。
            </p>
            <h3>相同方式共享</h3>
            <p>
              如果您再混合、转换或者基于本作品进行创作，您必须基于与原先许可协议相同的许可协议分发您贡献的作品。
            </p>
            <h3>没有附加限制</h3>
            <p>
              您不得适用法律术语或者技术措施从而限制其他人做许可协议允许的事情。
            </p>
            <h2>什么内容会被版权保护</h2>
            <p>
              <strong>包括但不限于：</strong>
            </p>
            <ul>
              <li>文章封面图片</li>
              <li>文章标题和正文图片</li>
              <li>站点源代码</li>
            </ul>
            <h2>您的隐私</h2>
            <p>
              本站可能收集您的部分个人信息，包括但不限于：IP地址、浏览时长、浏览设备、浏览历史等，仅用于网站数据统计和评论区合规化，并承诺不会以任何方式泄露于公众。
            </p>
            <p>
              当您使用评论系统时候将会把精确到省级的 <strong>IP地址</strong> 以及 <strong>浏览器信息</strong> 公之于众，这仅仅用于攻击预防以及网站合规化，在评论时填写的邮箱仅用于显示头像和发送回复提示邮件，非管理员用户仅能获取到 MD5，管理员则可以方便联系您，您可以自愿放弃填写邮箱并无法享受头像显示和回复提醒服务。
            </p>
            <p>
              当您使用评论系统时，评论内容将会被公开，本站使用 <code className="normal-inlinecode">Akismet</code> 审查评论，但您需要自行承担因审查把关不严格产生的法律责任。
            </p>
            <p>
              除此之外，使用了部分 <code className="normal-inlinecode">Cookie</code> 和 <code className="normal-inlinecode">LocalStorage</code>，用于存储用户评论数据、用户自定义设置以及方便缓存控制，均不会用于其他用途。
            </p>
            <h2>言论相关</h2>
            <p>
              本人坚决拥护中国共产党，热爱中华人民共和国，遵守中华人民共和国法律法规，维护国家统一、民族团结和国家安全，反对一切煽动分裂国家、破坏国家统一和民族团结的行为。
            </p>
            <p>
              本站言论均只代表个人主观意志，不反映现实社会情况，不构成任何法律依据，内容仅供娱乐并不一定真实，请勿用于任何违法活动的宣传。
            </p>
            <h2>网站源代码相关</h2>
            <p>
              本站使用 <code className="normal-inlinecode">Next.js</code> 编写，采用 <code className="normal-inlinecode">GPL</code> 许可协议分发源码，并托管源码于 <a className="normal-a" href="https://github.com">Github</a>。
              <br/>
              允许自由使用本站源码，但原则上不允许商业使用与更改许可协议的源码复用。
            </p>
            <p>
              当然，抄抄样式什么的肯定是随便啦！
            </p>
            <a className="etag-link" href="https://github.com/lyxofficial/AriaBlogNext-frontend" target="_blank" rel="noopener noreferrer" title="AriaBlogNext-frontend">
              <span className="etag-link-tip">
              前往以下网站，不保证安全性哦喵~
              </span>
              <img className="etag-link-img" src="https://api.iowen.cn/favicon/github.com.png">
              </img>
              <span className="etag-link-title">
                AriaBlogNext-frontend
              </span>
              <span className="etag-link-subtitle">
                Github
              </span>
            </a>
            <a className="etag-link" href="https://github.com/lyxofficial/AriaBlogNext-backend" target="_blank" rel="noopener noreferrer" title="AriaBlogNext-backend">
              <span className="etag-link-tip">
              前往以下网站，不保证安全性哦喵~
              </span>
              <img className="etag-link-img" src="https://api.iowen.cn/favicon/github.com.png">
              </img>
              <span className="etag-link-title">
                AriaBlogNext-backend
              </span>
              <span className="etag-link-subtitle">
                Github
              </span>
            </a>
            <p>
              若有其余需求，欢迎在 <a className="normal-a" href="/messageboard">留言板</a> 留言!
            </p>
          </div>
        </div>
      </div>
      <HomeRightSide/>
    </>
  );
}