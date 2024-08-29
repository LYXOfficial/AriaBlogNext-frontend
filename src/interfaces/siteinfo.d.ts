import { ReactElement } from "react";

export declare interface webInfo{
    postCount: number,
    categoryCount: number,
    tagCount: number,
    runDays: number,
    wordCount: number,
    lastUpdateTime: number,
    commentCount: number,
}
export declare interface siteConfig{
    author: string,
    avatar: string,
    title: string,
    socials: social[],
    createYear: number,
    createDay: number,
    createMonth: number,
    twikooEnv: string,
    siteDomain: string,
    pageMaxPosts: number,
}
export declare interface social{
    name: string,
    url: string,
    icon: ReactElement,
}