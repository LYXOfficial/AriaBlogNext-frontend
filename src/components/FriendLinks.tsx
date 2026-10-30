import "styles/FriendLinks.css";
import { FriendLinkGroup } from "interfaces/friendlink";
import { fetchFlinkGroups } from "@/utils/api";
import React from "react";
import { FriendLinkItem } from "./FriendLinkItem";

export function FriendLinkGroupItem({ group }: { group: FriendLinkGroup }) {
  return (
    <div className="flink-group">
      <h2 className="flink-group-heading">
        {group.name}
        <span className="flink-group-count">{group.links.length} 位朋友</span>
      </h2>
      <span className="flink-group-description">{group.description}</span>
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
  const res = await fetchFlinkGroups();
  if (res.ok) {
    flinks = res.data ?? [];
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
