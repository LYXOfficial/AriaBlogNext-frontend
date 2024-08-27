import { ReactElement } from "react";

export interface menuItem{
    name: string,
    link: string,
    icon: ReactElement,
    childs: menuItemChild[]
}
export interface menuItemChild{
    name: string,
    link: string,
    icon: ReactElement,
}
export interface menuButton{
    name: string,
    icon: ReactElement,
    method: Function,
}