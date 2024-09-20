export declare interface FriendLink {
  name: string;
  url: string;
  avatar: string;
  description: string;
  color: string;
  id: string;
  latency?: number;
}
export declare interface FriendLinkGroup {
  name: string;
  description: string;
  links: FriendLink[];
}
