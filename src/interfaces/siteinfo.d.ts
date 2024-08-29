import { ReactElement } from "react";

export declare interface webInfo{
    postCount: number,
    categoryCount: number,
    tagCount: number,
    runDays: number,
    wordCount: number,
    visitorCount: number,
    viewCount: number,
    lastUpdateTime: number,
    commentCount: number,
}
export declare interface siteInfo{
    author: string,
    avatar: string,
    title: string,
    socials: social[],
    createYear: number,
    createDay: number,
    createMonth: number,
    twikooEnv: string,
    siteDomain: string,
}
export declare interface social{
    name: string,
    url: string,
    icon: ReactElement,
}