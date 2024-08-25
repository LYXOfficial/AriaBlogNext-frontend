import FaIcon from './fa16';
import * as FaIcons from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import "../styles/Posts.css"

const posts=[
    {
        title:"Hello World",
        bannerImg:"https://bu.dusays.com/2024/07/02/668388069d6db.webp",
        content:"噫吁嚱，危乎高哉！蜀道之难，难于上青天！蚕丛及鱼凫，开国何茫然！尔来四万八千岁，不与秦塞通人烟。西当太白有鸟道，可以横绝峨眉巅。地崩山摧壮士死，然后天梯石栈相钩连。上有六龙回日之高标，下有冲波逆折之回川。黄鹤之飞尚不得过，猿猱欲度愁攀援。青泥何盘盘，百步九折萦岩峦。扪参历井仰胁息，以手抚膺坐长叹。问君西游何时还？畏途巉岩不可攀。但见悲鸟号古木，雄飞雌从绕林间。又闻子规啼夜月，愁空山。蜀道之难，难于上青天，使人听此凋朱颜！连峰去天不盈尺，枯松倒挂倚绝壁。飞湍瀑流争喧豗，砯崖转石万壑雷。其险也如此，嗟尔远道之人胡为乎来哉！(也如此 一作：也若此)剑阁峥嵘而崔嵬，一夫当关，万夫莫开。所守或匪亲，化为狼与豺。朝避猛虎，夕避长蛇，磨牙吮血，杀人如麻。锦城虽云乐，不如早还家。蜀道之难，难于上青天，侧身西望长咨嗟！",
        link:"/posts/hello-world",
        publishTime:0,
        lastUpdateTime:0,
        tags:["测试","world"],
        category:"hello",
        commentCount:0,
    },
    {
        title:"你好喵 这是测试QwQ",
        bannerImg:"https://npm.elemecdn.com/saiodgm-api@1.0.1/randomimg-my/18.webp",
        content:"豫章故郡，洪都新府。星分翼轸，地接衡庐。襟三江而带五湖，控蛮荆而引瓯越。物华天宝，龙光射牛斗之墟；人杰地灵，徐孺下陈蕃之榻。雄州雾列，俊采星驰。台隍枕夷夏之交，宾主尽东南之美。都督阎公之雅望，棨戟遥临；宇文新州之懿范，襜帷暂驻。十旬休假，胜友如云；千里逢迎，高朋满座。腾蛟起凤，孟学士之词宗；紫电青霜，王将军之武库。家君作宰，路出名区；童子何知，躬逢胜饯。",
        link:"/posts/hello-world",
        publishTime:1724571806,
        lastUpdateTime:1724561806,
        tags:["生活","代码","测试"],
        category:"hello",
        commentCount:114514,
    },
    {
        title:"Lorem ipsum dolor sit amet",
        bannerImg:"https://bu.dusays.com/2023/07/29/64c5221e7a165.jpg",
        content:"This is my first post.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        link:"/posts/hello-world",
        publishTime:1724571806,
        lastUpdateTime:0,
        tags:["hello","world"],
        category:"hello",
        commentCount:1919810,
    }
]
export default function Posts() {
    return (
        <div id="posts-container">
            {posts.map((post)=>{
                    return (
                        <div className="post-card card-widget" key={post.title}>
                            <div className="post-banner">
                                <a className="post-banner-link" href={post.link} title={post.title}>
                                    <img className="post-banner-img" src={post.bannerImg} alt={post.title} />
                                </a>
                            </div>
                            <div className="post-info">
                                <a className="post-title" href={post.link} title={post.title} >{post.title}</a>
                                <div className="post-content">{post.content}</div>
                                <div className="post-metas">
                                    <a className="post-category" href={"/catogories/" + post.category} title={post.category}>{post.category}</a>
                                    <div className="post-meta post-publishdate">
                                        <FaIcon icon={FaIcons.faCalendarAlt} size={16}/>
                                        <span className="post-meta-context">
                                            {" 发表于 "+moment.unix(post.publishTime).format("YYYY-MM-DD")+" | "}
                                        </span>
                                    </div>
                                    <div className="post-meta post-lastupdatedate">
                                        <FaIcon icon={FaIcons.faCalendarAlt} size={16}/>
                                        <span className="post-meta-context">
                                            {" 更新于 "+moment.unix(post.lastUpdateTime).format("YYYY-MM-DD")+" | "}
                                        </span>
                                    </div>
                                    <div className="post-meta post-tags">
                                        <FaIcon icon={FaIcons.faTags} size={16}/>
                                        <span className="post-meta-context">
                                            {post.tags.map((tag,index) => {
                                                return (
                                                    <div key={tag}>
                                                        {index?(<span> · </span>):(<></>)}
                                                        <a href={"/tags/"+tag}>
                                                            {tag}
                                                        </a>
                                                    </div>
                                                );
                                            })}
                                            <span> | </span>
                                        </span>
                                    </div>
                                    <div className="post-meta post-commentcount">
                                        <FaIcon icon={FaIcons.faComment} size={16}/>
                                        <span className="post-meta-context">
                                            {" "+post.commentCount+" 条评论"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
            )}
        </div>
    );
}