"use client";
import { Icon } from "@iconify/react";
import { ReactElement } from "react";
import { FriendLink } from "interfaces/friendlink";
import { siteConfigs } from "@/config";
import { LazyImageWithFalldown } from "./ImageWithFalldown";

export function FriendLinkItem({ link }: { link: FriendLink }) {
  let latencyIcon: ReactElement = <></>;
  if (link.latency! > 0) {
    if (link.latency! <= 1)
      latencyIcon = <Icon icon="system-uicons:signal-full" />;
    else if (link.latency! <= 2)
      latencyIcon = <Icon icon="system-uicons:signal-medium" />;
    else if (link.latency! <= 3)
      latencyIcon = <Icon icon="system-uicons:signal-low" />;
    else latencyIcon = <Icon icon="system-uicons:signal-none" />;
  } else
    latencyIcon = (
      <Icon icon="system-uicons:close" className="flink-none-icon" />
    );
  return (
    <a
      className="flink-item cf-friends-link"
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      id={`flink-${link.id}`}
    >
      <style>
        {`
                    #flink-${link.id}{
                        background-color:${link.color ?? "#888888"};
                        background-color:color-mix(in srgb,${link.color ?? "#888888"},transparent 25%);
                        color:white;
                    }
                `}
      </style>
      <div className="flink-avatar">
        <LazyImageWithFalldown
          className="flink-avatar-img"
          src={link.avatar}
          data-src={link.avatar}
          alt={link.name}
          falldownImg={siteConfigs.falldownAvatar}
        />
        <span className="cf-friends-avatar" data-src={link.avatar} />
      </div>
      <span className="flink-name cf-friends-name">{link.name}</span>
      <span className="flink-desc">{link.description}</span>
      <span
        className="flink-status"
        title={
          link.latency! > 0
            ? "加载: " + Math.round(link.latency! * 1000) + "ms"
            : "不可达"
        }
      >
        {latencyIcon}
        {/* {link.latency!>0?`${link.latency}s`:""} */}
      </span>
    </a>
  );
}
