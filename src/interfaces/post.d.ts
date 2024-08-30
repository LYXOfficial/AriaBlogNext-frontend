export declare interface Post{
    slug: string,
    title: string,
    description?: string,
    publishTime: number,
    lastUpdatedTime: number,
    tags: string[],
    category: string,
    plainContent?: string,
    mdContent?: string,
    commentCount: number,
    summary?: string,
    wordCount?: number,
    bannerImg: string
}