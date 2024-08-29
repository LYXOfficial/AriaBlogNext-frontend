import { ReactElement } from "react";

export declare interface menuItem{
    name: string,
    link: string,
    icon: ReactElement,
    childs: menuItemChild[]
}
export declare interface menuItemChild{
    name: string,
    link: string,
    icon: ReactElement,
}
export declare interface menuButton{
    name: string,
    icon: ReactElement,
    method: Function,
}