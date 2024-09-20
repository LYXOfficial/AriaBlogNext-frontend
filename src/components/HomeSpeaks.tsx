"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Mousewheel } from "swiper/modules";
import { Icon } from "@iconify/react";
import { ReactElement, useEffect, useState } from "react";
import { siteConfigs } from "@/config";
import { BB } from "interfaces/bb";
import relativeTime from "utils/reltime";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/mousewheel";
import "styles/HomeSpeaks.css";
import Link from "next/link";

export default function HomeSpeaks({ speaksContent }: { speaksContent: BB[] }) {
  const [speaks, setSpeaks] = useState<ReactElement>(<></>);
  useEffect(() => {
    setSpeaks(
      <Swiper
        modules={[Autoplay, Mousewheel]}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          stopOnLastSlide: false,
        }}
        className="homespeaks-swiper"
        mousewheel={true}
        direction="vertical"
        slidesPerView={1}
        spaceBetween={0}
      >
        {speaksContent.map((item: BB, index: number) => {
          return (
            <SwiperSlide key={index} className="homespeaks-slide">
              <Link href="/speaks" className="homespeaks-item">
                {relativeTime(item.time) + ": " + item.plainContent}
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>,
    );
  }, []);
  return (
    <div id="homespeaks-container" className="card-widget">
      <Icon
        icon="mdi:comment"
        className="homespeaks-icon left"
        width={20}
        height={20}
      />
      <div className="homespeaks-bbbox">{speaks}</div>
      <Icon
        icon="mdi:arrow-right"
        className="homespeaks-icon right"
        width={22}
        height={22}
      />
    </div>
  );
}
