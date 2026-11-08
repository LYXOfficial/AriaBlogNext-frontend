import { ReactElement } from "react";

export declare interface MenuItem {
  name: string;
  link: string;
  icon: ReactElement;
  childs: MenuItemChild[];
  /** 只用于顶栏高亮：不在菜单里、但算在这个分组下的站内路径前缀，如 /posts 归「文章」、/page 归「首页」。 */
  activeMatch?: string[];
}
export declare interface MenuItemChild {
  name: string;
  link?: string;
  func?: MouseEventHandler<HTMLAnchorElement>;
  icon: ReactElement;
}
export declare interface MenuButton {
  name: string;
  icon: ReactElement;
  method: Function;
}
