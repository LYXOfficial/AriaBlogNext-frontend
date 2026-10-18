"use client";
import "styles/ASide/global.css";
import "styles/ASide/LoveU.css";
import { LoveUContent } from "@/config";
import { Icon } from "@iconify/react";

export default function CardLoveU() {
  return (
    <div className="card-widget card-aside card-loveu">
      <div className="card-body">
        <div className="loveu-avatars">
          <img
            src={LoveUContent.myAvatar}
            title={LoveUContent.myName}
            alt={LoveUContent.myName}
            className="loveu-avatar"
          />
          <Icon
            icon="solar:heart-angle-line-duotone"
            width="24"
            height="24"
            className="loveu-icon"
          />
          <img
            src={LoveUContent.yourAvatar}
            title={LoveUContent.yourName}
            alt={LoveUContent.yourName}
            className="loveu-avatar"
          />
        </div>
        <div className="loveu-text">
          <span className="loveu-text-line">
            <b>
              {LoveUContent.myName} ♥️ {LoveUContent.yourName}
            </b>
          </span>
          <span className="loveu-text-line">
            {LoveUContent.startDate.join("-")} ~{" "}
            {new Date().toLocaleDateString("zh-CN").replace(/\//g, "-")}
          </span>
          <span className="loveu-text-line">
            QwQ{" "}
            <b>
              {Math.floor(
                (new Date().getTime() -
                  new Date(LoveUContent.startDate.join("-")).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              天
            </b>
            了喵！
          </span>
        </div>
      </div>
    </div>
  );
}
