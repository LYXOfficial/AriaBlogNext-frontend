"use client";
import React, { ReactElement, useEffect, useState } from "react";
import { Autoplay, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/mousewheel";
import "styles/CommentBarrage.css";
import Link from "next/link";
import { siteConfigs } from "@/config";
import throttle from "lodash/throttle";

interface BarrageData {
  id: string;
  avatar?: string;
  link?: string;
  nick: string;
  comment: string;
  mailMd5: string;
  created?: number;
  replies?: BarrageData[];
}

const CommentBarrage = ({ toggleBarrage }: { toggleBarrage: () => void }) => {
  const [currentSwiper, setCurrentSwiper] = useState<ReactElement>(<></>);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(siteConfigs.twikooEnv, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "COMMENT_GET",
            "commentBarrageConfig.accessToken":
              "1059857c25a2ce9fba9cff298f4f33ee",
            url: window.location.pathname,
          }),
        });
        const result = await response.json();
        const comments = result.data.sort(
          (a: BarrageData, b: BarrageData) => b.created! - a.created!,
        );
        const flattenedComments = comments.flatMap(getCommentReplies);
        if (flattenedComments.length)
          setCurrentSwiper(
            <BarrageSwiper
              barrages={flattenedComments}
              toggleBarrage={toggleBarrage}
            />,
          );
      } catch (error) {
        console.error("Error fetching barrages:", error);
      }
    };

    fetchData();

    const handleScroll = throttle(() => {
      const postCommentElement = document.getElementById("twikoo");
      if (postCommentElement) {
        const isInViewPort = isInViewPortOfOne(postCommentElement);
        if (isInViewPort) {
          document
            .querySelector("#barrage-container")
            ?.setAttribute(
              "style",
              "transform: translateX(514px); opacity: 0;",
            );
        } else {
          document
            .querySelector("#barrage-container")
            ?.removeAttribute("style");
        }
      }
    }, 200); // 200ms 节流时间

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [toggleBarrage]);

  const isInViewPortOfOne = (el: HTMLElement) => {
    const viewPortHeight =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight;
    const offsetTop = el.offsetTop;
    const scrollTop = document.documentElement.scrollTop;
    return offsetTop - scrollTop <= viewPortHeight;
  };

  const getCommentReplies = (item: BarrageData): BarrageData[] => {
    if (item.replies) {
      return [item, ...item.replies.flatMap(getCommentReplies)];
    }
    return [];
  };

  return <div id="barrage-container">{currentSwiper}</div>;
};

interface BarrageSwiperProps {
  barrages: BarrageData[];
  toggleBarrage: () => void;
}

const BarrageSwiper: React.FC<BarrageSwiperProps> = ({
  barrages,
  toggleBarrage,
}) => {
  return (
    <Swiper
      modules={[Autoplay, Mousewheel]}
      direction="vertical"
      loop={true}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
        stopOnLastSlide: false,
      }}
      mousewheel={true}
      slidesPerView={1}
      spaceBetween={0}
      className="barrageswiper swiper-container"
    >
      {barrages.map((barrage) => (
        <SwiperSlide key={barrage.id} className="comment-barrage-slide">
          <CommentBarrageItem barrage={barrage} toggleBarrage={toggleBarrage} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

interface CommentBarrageItemProps {
  barrage: BarrageData;
  toggleBarrage: () => void;
}

const CommentBarrageItem: React.FC<CommentBarrageItemProps> = ({
  barrage,
  toggleBarrage,
}) => {
  const { avatar, link, nick, comment, id, mailMd5 } = barrage;
  const avatarUrl = avatar || `https://weavatar.com/avatar/${mailMd5}?d=mp`;

  return (
    <div className="comment-barrage-item">
      <div className="barrageHead">
        <img className="barrageAvatar" src={avatarUrl} alt={nick} />
        {link ? (
          <a
            href={link}
            className="barrageNick"
            target="_blank"
            rel="noopener noreferrer"
          >
            {nick}
          </a>
        ) : (
          <div className="barrageNick">{nick}</div>
        )}
        <a
          onClick={() => {
            toggleBarrage();
          }}
          style={{ fontSize: "20px" }}
          className="barrageClose"
        >
          ×
        </a>
      </div>
      <Link
        href={`#${id}`}
        className="barrageContent"
        dangerouslySetInnerHTML={{ __html: comment }}
      />
    </div>
  );
};

export default CommentBarrage;
