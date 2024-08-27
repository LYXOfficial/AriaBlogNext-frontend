export interface Post{
    slug: string,
    title: string,
    description?: string,
    publishTime: number,
    lastUpdateTime: number,
    tags: string[],
    category: string,
    plainContent?: string,
    commentCount: number,
    summary?: string,
    wordCount?: number,
    viewCount?: number,
    bannerImg: string
}