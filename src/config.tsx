import { menuItem } from "interfaces/menuitem";
import { siteConfig } from "interfaces/siteconfig";
import { footerBadge } from "interfaces/footerbadge";
import { Icon } from "@iconify/react";

export const siteConfigs: siteConfig = {
  author: "Ariasaka",
  title: "Ariasakaの小窝",
  siteUrl: "https://blog.yaria.top",
  avatar: "https://bu.dusays.com/2024/08/25/66caf920c5a28.png",
  twikooEnv: "https://tkapi.yaria.top",
  createYear: 2022,
  createMonth: 6,
  createDay: 4,
  pageMaxPosts: 15,
  falldownAvatar: "https://bu.dusays.com/2024/09/06/66dabf7f748c8.jpg",
  falldownImg: "https://bu.dusays.com/2024/08/31/66d30329375a5.webp",
  // backEndUrl: process.env.NODE_ENV=="production"?"https://blognext-end.yaria.top":"http://localhost:2333",
  backEndUrl: "https://blognext-end.yaria.top",
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

export const menuItems: menuItem[] = [
  {
    name: "首页",
    link: "/",
    icon: <Icon icon="fa6-solid:house" />,
    childs: [],
  },
  {
    name: "文章",
    link: "",
    icon: <Icon icon="fa6-solid:newspaper" />,
    childs: [
      {
        name: "随便逛逛",
        link: "javascript:window.toRandomPost();",
        icon: <Icon icon="fa6-solid:paper-plane" />,
      },
      {
        name: "归档",
        link: "/archives",
        icon: <Icon icon="fa6-solid:box-archive" />,
      },
      {
        name: "标签",
        link: "/tags",
        icon: <Icon icon="fa6-solid:tags" />,
      },
      {
        name: "分类",
        link: "/categories",
        icon: <Icon icon="fa6-solid:folder-open" />,
      },
      {
        name: "哔哔",
        link: "/speaks",
        icon: <Icon icon="fa6-solid:comment" />,
      },
      {
        name: "声明",
        link: "/license",
        icon: <Icon icon="fa6-solid:bell" />,
      },
    ],
  },
  {
    name: "本站",
    link: "",
    icon: <Icon icon="fa6-solid:sitemap" />,
    childs: [
      {
        name: "个人主页",
        link: "https://yaria.top",
        icon: <Icon icon="fa6-solid:house-chimney" />,
      },
      {
        name: "友链",
        link: "/links",
        icon: <Icon icon="fa6-solid:link" />,
      },
      {
        name: "朋友圈",
        link: "/fcircle",
        icon: <Icon icon="fa6-solid:circle-nodes" />,
      },
      {
        name: "关于我",
        link: "/about",
        icon: <Icon icon="fa6-solid:circle-info" />,
      },
      {
        name: "日志",
        link: "/update",
        icon: <Icon icon="fa6-solid:calendar" />,
      },
      {
        name: "留言板",
        link: "/messageboard",
        icon: <Icon icon="fa6-solid:chalkboard" />,
      },
    ],
  },
];

export const footerBadges: footerBadge[] = [
  {
    badgeUrl: "https://img.shields.io/badge/Framework-Next.js-black",
    link: "https://nextjs.org",
  },
  {
    badgeUrl: "https://img.shields.io/badge/Language-TypeScript-blue",
    link: "https://typescriptlang.org",
  },
  {
    badgeUrl: "https://img.shields.io/badge/Hosted-Vercel-success",
    link: "https://vercel.app",
  },
  {
    badgeUrl: "https://img.shields.io/badge/CDN-ChuqiCDN-006CFF",
    link: "https://www.chuqiyun.com",
  },
  {
    badgeUrl: "https://img.shields.io/badge/CC-BY--NC--SA4.0-red",
    link: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },
  {
    badgeUrl:
      "https://img.shields.io/badge/%E8%90%8CICP%E5%A4%87-20222035-ff69b4",
    link: "https://icp.gov.moe/?keyword=20222035",
  },
];
