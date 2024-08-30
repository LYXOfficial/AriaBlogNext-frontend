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
    siteDomain: string,
    pageMaxPosts: number,
    backEndUrl: string,
}
export declare interface social{
    name: string,
    url: string,
    icon: ReactElement,
}