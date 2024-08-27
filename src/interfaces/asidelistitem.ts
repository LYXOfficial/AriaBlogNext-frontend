export interface aSideListItem{
    link: string,
    title: string,
    content: string,
    pic: string
}
export interface latestCommentListItem{
    link: string,
    content: string,
    user: string,
    time: number,
    avatar: string
}
export interface archiveListItem{
    year: number,
    month: number,
    count: number
}