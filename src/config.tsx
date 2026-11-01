import { MenuItem } from "interfaces/menuitem";
import { SiteConfig } from "interfaces/siteconfig";
import { FooterBadge } from "interfaces/footerbadge";
import { LoveU } from "interfaces/loveu";
import { Icon } from "@iconify/react";

export const siteConfigs: SiteConfig = {
  author: "Ariasaka",
  title: "Ariasakaの小窝",
  titleIcon: "https://img.0v0.my/2025/10/12/6dd5eec4823f8.webp",
  siteUrl: "https://blog.yaria.top",
  avatar: "https://img.0v0.my/2024/12/05/67517ba094506.png",
  // twikooEnv: "https://tkapi.yaria.top",
  twikooEnv: "https://comment.aria.android99.com",
  createYear: 2022,
  createMonth: 6,
  createDay: 4,
  homeBanner: {
    // 每次进入首页随机选一张；只填一张时就是固定背景。
    images: [
      "https://img.0v0.my/2026/10/18/d48d73a29cf4f.webp",
      "https://img.0v0.my/2026/10/18/e0ab8f45eaccc.webp",
      "https://img.0v0.my/2026/10/18/dab938ae2b837.webp",
      "https://img.0v0.my/2026/10/18/af318acf97bd0.webp",
      "https://img.0v0.my/2026/10/18/75a7defc85d39.webp",
      "https://img.0v0.my/2026/10/18/2a73d545e75dc.webp",
      "https://img.0v0.my/2026/10/18/4f48898860046.webp",
      "https://img.0v0.my/2026/10/18/4f555605e413f.webp",
    ],
    welcome: "欢迎来到 Ariasakaの小窝～",
    welcomeUrl: "https://0v0.my",
    headline: ["心有晴时亦有雨", "行至深处自逢春"],
  },
  homeMaxPosts: 15,
  pageMaxPosts: 16,
  falldownAvatar: "https://img.0v0.my/2024/09/06/66dabf7f748c8.jpg",
  falldownImg: "https://img.0v0.my/2024/08/31/66d30329375a5.webp",
  backEndUrl: "https://neoend.yaria.top",
  fcircleUrl: "https://fcircle.yaria.top",
  socials: [
    {
      name: "Github",
      url: "https://github.com/LYXOfficial",
      icon: <Icon icon="fa6-brands:github" />,
    },
    {
      name: "Email",
      url: "mailto:lyxx114@yaria.top",
      icon: <Icon icon="fa6-solid:envelope" />,
    },
    {
      name: "QQ",
      url: "tencent://message/?uin=2192016328&Site=&Menu=yes",
      icon: <Icon icon="fa6-brands:qq" />,
    },
    {
      name: "Bilibili",
      url: "https://space.bilibili.com/369280472",
      icon: <Icon icon="fa6-brands:bilibili" />,
    },
    {
      name: "RSS",
      url: "/feed.xml",
      icon: <Icon icon="fa6-solid:rss" />,
    },
  ],
};

export const MenuItems: MenuItem[] = [
  {
    name: "首页",
    link: "/",
    icon: <Icon icon="solar:home-smile-bold" />,
    childs: [],
  },
  {
    name: "文章",
    link: "",
    icon: <Icon icon="solar:documents-bold" />,
    childs: [
      {
        name: "归档",
        link: "/archives",
        icon: <Icon icon="solar:archive-bold" />,
      },
      {
        name: "标签",
        link: "/tags",
        icon: <Icon icon="solar:tag-horizontal-bold" />,
      },
      {
        name: "分类",
        link: "/categories",
        icon: <Icon icon="solar:folder-open-bold" />,
      },
      {
        name: "哔哔",
        link: "/speaks",
        icon: <Icon icon="solar:chat-round-bold" />,
      },
      {
        name: "声明",
        link: "/license",
        icon: <Icon icon="solar:bell-bold" />,
      },
      {
        name: "示例",
        link: "/examples",
        icon: <Icon icon="solar:code-square-bold" />,
      },
    ],
  },
  {
    name: "本站",
    link: "",
    icon: <Icon icon="solar:widget-2-bold" />,
    childs: [
      {
        name: "个人页",
        link: "https://yaria.top",
        icon: <Icon icon="solar:user-circle-bold" />,
      },
      {
        name: "友链",
        link: "/links",
        icon: <Icon icon="solar:link-bold" />,
      },
      {
        name: "朋友圈",
        link: "/fcircle",
        icon: <Icon icon="solar:structure-bold" />,
      },
      {
        name: "关于我",
        link: "/about",
        icon: <Icon icon="solar:info-circle-bold" />,
      },
      {
        name: "日志",
        link: "https://github.com/LYXOfficial/AriaBlogNext-frontend/commits/main/",
        icon: <Icon icon="solar:calendar-bold" />,
      },
      {
        name: "留言板",
        link: "/messageboard",
        icon: <Icon icon="solar:tablet-bold" />,
      },
    ],
  },
];

export const FooterBadges: FooterBadge[] = [
  {
    name: "Next.js",
    icon: "simple-icons:nextdotjs",
    color: "#171717",
    darkColor: "#f5f5f5",
    link: "https://nextjs.org",
  },
  {
    name: "Vercel",
    icon: "simple-icons:vercel",
    color: "#171717",
    darkColor: "#f5f5f5",
    link: "https://vercel.app",
  },
  {
    name: "FastAPI",
    icon: "bxl:fastapi",
    color: "#009688",
    darkColor: "#53d3c3",
    link: "https://fastapi.tiangolo.com",
  },
  {
    name: "BY-NC-SA 4.0",
    icon: "fa6-brands:creative-commons",
    color: "#ADFF00",
    darkColor: "#ADFF00",
    link: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },
  {
    name: "十年之约",
    icon: "solar:infinity-bold",
    color: "#ff6200",
    darkColor: "#ff6200",
    link: "https://foreverblog.cn",
  },
  {
    name: "虫洞",
    icon: "solar:planet-bold",
    color: "#a77d63",
    darkColor: "#a77d63",
    link: "https://www.foreverblog.cn/go.html",
  },
  {
    name: "开往",
    icon: "solar:tram-bold",
    color: "#337bb5",
    darkColor: "#7cb8e8",
    link: "https://www.travellings.cn/",
  },
];

export const LoveUContent: LoveU = {
  enable: true,
  myName: "Aria",
  yourName: "Android",
  myAvatar: "https://img.0v0.my/2026/10/18/35baaf5713991.webp",
  yourAvatar: "https://img.0v0.my/2026/10/18/613c40258cbd6.webp",
  startDate: [2025, 11, 23],
};
