import { ReactElement } from "react";

export declare interface SiteConfig {
  author: string;
  avatar: string;
  title: string;
  socials: Social[];
  createYear: number;
  createDay: number;
  createMonth: number;
  twikooEnv: string;
  siteUrl: string;
  homeMaxPosts: number;
  pageMaxPosts: number;
  backEndUrl: string;
  falldownAvatar: string;
  falldownImg: string;
  fcircleUrl: string;
}
export declare interface Social {
  name: string;
  url: string;
  icon: ReactElement;
}
