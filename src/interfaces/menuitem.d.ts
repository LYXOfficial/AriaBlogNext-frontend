import { ReactElement } from "react";

export declare interface MenuItem {
  name: string;
  link: string;
  icon: ReactElement;
  childs: MenuItemChild[];
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
