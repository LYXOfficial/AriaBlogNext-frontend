import { ReactElement } from "react";

export declare interface siteConfig{
    author: string,
    avatar: string,
    title: string,
    socials: social[],
    createYear: number,
    createDay: number,
    createMonth: number,
    twikooEnv: string,
    siteUrl: string,
    pageMaxPosts: number,
    backEndUrl: string,
    falldownAvatar: string,
    falldownImg: string,
    fcircleUrl: string,
}
export declare interface social{
    name: string,
    url: string,
    icon: ReactElement,
}