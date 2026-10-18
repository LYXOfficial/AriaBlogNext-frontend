import "styles/ASide/List.css";
import Link from "next/link";
import { ASideListItem } from "interfaces/asidelistitem";
import ImageWithFalldown from "components/ImageWithFalldown";

export default function ASideList({
  items,
  falldownImg,
}: {
  items: ASideListItem[];
  falldownImg: string;
}) {
  return (
    <div className="aside-list">
      {items.map((item: ASideListItem) => {
        return (
          <Link
            className="aside-list-item"
            title={item.title.substring(0, 50)}
            href={item.link}
            key={item.title}
          >
            {item.pic == "" ? (
              <></>
            ) : (
              <div className="aside-list-item-pic">
                <ImageWithFalldown
                  falldownImg={falldownImg}
                  src={item.pic}
                  className="aside-list-item-pic-img"
                  sizes="136px"
                  quality={90}
                  optimize
                  alt=""
                />
              </div>
            )}
            <div className="aside-list-item-content">
              <span className="aside-list-item-content-title">
                {item.title}
              </span>
              <span className="aside-list-item-content-text">
                {item.content}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
