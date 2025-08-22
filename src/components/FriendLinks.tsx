import "styles/FriendLinks.css";
import { FriendLinkGroup } from "interfaces/friendlink";
import { siteConfigs } from "@/config";
import React from "react";
import { FriendLinkItem } from "./FriendLinkItem";

export function FriendLinkGroupItem({ group }: { group: FriendLinkGroup }) {
  return (
    <div className="flink-group">
      <h2>{group.name}</h2>
      <span>{group.description}</span>
      <div className="flink-group-item">
        {group.links.map((link) => (
          <FriendLinkItem key={link.url} link={link} />
        ))}
      </div>
    </div>
  );
}

export default async function FriendLinks() {
  let flinks: FriendLinkGroup[] = [];
  const res = await fetch(`${siteConfigs.backEndUrl}/get/flink/flinks`, {
    next: { revalidate: 7200, tags: ["flinks"] },
  });
  if (res.ok) {
    flinks = (await res.json()).data;
  }
  return (
    <>
      <div id="flinks">
        {flinks.map((group) => (
          <FriendLinkGroupItem key={group.name} group={group} />
        ))}
      </div>
    </>
  );
}
