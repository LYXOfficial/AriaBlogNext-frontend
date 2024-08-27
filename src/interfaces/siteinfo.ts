import { ReactElement } from "react";

export interface webInfo{
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
export interface siteInfo{
    author: string,
    avatar: string,
    title: string,
    socials: social[],
    createYear: number,
    createDay: number,
    createMonth: number,
}
export interface social{
    name: string,
    url: string,
    icon: ReactElement,
}