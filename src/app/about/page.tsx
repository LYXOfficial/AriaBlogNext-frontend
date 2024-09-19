import "styles/Pages.css";
import "styles/PostContent.css";
import { PageRightSide } from "@/components/RightSide";
import { TwikooBaseComment } from "@/components/thirdpartyjs/Twikoo";

export default function Page(){
    return <div className="page" id="main-container">
        <title>关于 | Ariasakaの小窝</title>
        <style>{`#navbar{position:fixed}`}</style>
        <div id="article-container" className="page flink">
            <div id="post-maincontent" className="page flink">
                <h1>关于我</h1>
                <p>
                    你好啊，我是 <strong>Ariasaka</strong>，人，初中生（2026届），2010年一月生，是活的！！
                    <br/>
                    什（（
                </p>
                <p>
                    目前在重庆西大附中上学，老家在四川绵阳和泸州（如果有本地人的话来聊聊天就好了<del className="normal-del">但是一定不会线下面基qwq！</del>）
                </p>
                <p>
                    日常写博客发发电，如果看到我没更新的话那大概率不是似了，应该是在学校坐牢了（悲）。
                    <br/>
                    <em>*另外博客还有很多黑历史不要评价只会让本蒟蒻非常羞耻w=w</em>
                    <br/>
                    语文作文不是很好，写的文章看起来又凌乱又口语，反正就当是瞎哔哔发电就好了嘛:(
                </p>
                <p>
                    感兴趣的话欢迎来加QQ瞎唠嗑！（瞅瞅作者卡片喵）
                    <br/>
                    事INFP还是TP随机切换，阴暗爬行小社恐（指现实），性格奇怪喜欢瞎折腾（
                    <br/>
                    似乎不太喜欢现实生活，一回家一头就扎进网络里了<del className="normal-del">作业在学校卷完了的没写不要模仿</del>。但是有时候写写文章就emo了，好奇怪。
                </p>
                <p>
                    关于成分的话呢，大抵是这样子的：
                    <ol>
                        <li>瞎<strong>搞博客</strong>的</li>
                        <li><strong>前 OIer</strong> 但因为某些原因AFO了 <del className="normal-del">欢迎加洛谷761305 qwq</del></li>
                        <li>乱玩<strong>3D打印</strong>的</li>
                        <li>臭<strong>折腾各种系统</strong>的</li>
                        <li>喜欢<strong>二次元</strong>动漫但好像没怎么看的云云（）</li>
                        <li>重庆本地<strong>不地道车迷</strong>，喜欢地铁国铁但是资金不足运转拍车的</li>
                        <li>臭玩<strong>音游</strong>的多修菜鸡</li>
                        <li>瞎<strong>搞硬件</strong>嘉立创薅板子的</li>
                        <li><strong>MC</strong> 半生电玩家，但是喜欢创哥理赔，一战牢兵（黑历史呜呜</li>
                        <li>还有呢... 好像想不起来了🤔</li>
                    </ol>
                    好像不是很复杂的感觉，因为Ta甚至不玩各种游戏几乎只玩 MC 了 TAT。
                </p>
                <p>
                    一些技术栈：
                    <ul>
                        <li>前端三件套 <code className="normal-inlinecode">HTML CSS JS</code></li>
                        <li>正在学习的现代前端框架 <code className="normal-inlinecode">Next.js React</code></li>
                        <li><code className="normal-inlinecode">Node.js TypeScript Hexo</code></li>
                        <li>数据库 <code className="normal-inlinecode">MongoDB</code></li>
                        <li>后端万金油 <code className="normal-inlinecode">Python FastAPI</code></li>
                        <li>GUI实现<code className="normal-inlinecode">Qt5/6 PyQt5/6</code></li>
                        <li>OIer老伴 <code className="normal-inlinecode">C++</code></li>
                        <li>Windows 杀手 <code className="normal-inlinecode">C++/Python Win32API</code></li>
                        <li>硬件方面 <code className="normal-inlinecode">MicroPython Arduino</code></li>
                        <li>杂七杂八的 <code className="normal-inlinecode">GNU/Linux LateX EJS Stylus Sass PUG Markdown Scratch</code></li>
                    </ul>
                    打算将来学习的一些东西：
                    <ul>
                        <li><code className="normal-inlinecode">Vue Nuxt.js</code></li>
                        <li><code className="normal-inlinecode">Rust</code></li>
                        <li><code className="normal-inlinecode">.NET MAUI</code></li>
                        <li><code className="normal-inlinecode">Golang</code></li>
                        <li><code className="normal-inlinecode">SQL 数据库</code></li>
                        <li><code className="normal-inlinecode">Java Kotlin Android 后端 Minecraft模组等的开发</code></li>
                        <li><code className="normal-inlinecode">ESP-IDF STM32开发</code></li>
                    </ul>
                    不知道能不能学会呢？等待时间的考验吧。
                </p>
                <h3>博客二三事</h3>
                <p>
                    博客已经运营了两年多了，也圆了曾经的网站梦，具体可以看看之前的文章。
                    <br/>
                    现在的博客最早追溯到两年前开端的<code className="normal-inlinecode">Hexo Butterfly</code>魔改主题博客，不过因为各种各样和卡顿优化差的原因在早些时候使用 <code className="normal-inlinecode">Next.js</code> 重写，不过毕竟码功依旧不精，说不定一段时间后还会重来呢。
                    <br/>
                    新博客几乎仿照以前的样式重做，做了不少的优化，体验总的来说比起旧博客好多了，希望能利用好新的博客开启新的篇章罢。
                    <br/>
                    没有想到，曾经一时兴起做的博客，在风雨阻拦下坚持到今天，访问量即使不高，小伙伴们的到访也成为了我坚持下去的动力。
                    <br/>
                    希望在未来的日子里，博客能继续陪伴我，见证我的成长与进步。
                    <br/>
                    这是博客的Github地址哦喵！虽然可能写的一坨史罢了（ 
                    <a href="https://github.com/LYXOfficial/AriaBlogNext-frontend">
                        https://github.com/LYXOfficial/AriaBlogNext-frontend
                    </a>
                    <br/>
                    <a href="https://github.com/LYXOfficial/AriaBlogNext-backend">
                        https://github.com/LYXOfficial/AriaBlogNext-backend
                    </a>
                    <br/>
                    <a href="https://github.com/LYXOfficial/AriaBlogNext-dashboard">
                        https://github.com/LYXOfficial/AriaBlogNext-dashboard
                    </a>
                    <br/>
                    关于评论的话，可以随便说说，别把咱当GPT百度使就好qwq，但是<strong>禁止商业性质广告和友链申请！！！不要打广告！！！不要打广告！！！不要打广告！！！</strong>
                    <br/>
                    （当然玩玩博客的小伙伴推广一下倒是可以
                    <br/>
                    不然祝您早日倒闭！！！
                </p>
                <br/>
                好了，事情到这里就交代的差不多了，祝各位小伙伴们天天开心哦！
                <br/>
                <br/>
            </div>
            <TwikooBaseComment/>
        </div>
        <PageRightSide/>
    </div>;
}