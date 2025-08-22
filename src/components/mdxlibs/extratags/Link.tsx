import { ImgWithFalldown } from "@/components/ImageWithFalldown";
import { siteConfigs } from "@/config";

export default function LinkTag({
  link,
  title,
  subtitle,
}: {
  link: string;
  title: string;
  subtitle: string;
}) {
  return (
    <>
      <a
        className="etag-link"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
      >
        <span className="etag-link-tip">前往以下网站，不保证安全性哦喵~</span>
        <ImgWithFalldown
          className="etag-link-img"
          src={`https://toolb.cn/favicon/${
            link?.[0] == "/" || link?.[0] == "."
              ? siteConfigs.siteUrl.split("://")[1]
              : link?.split("://")[1]?.split("/")[0]
          }`}
          falldownImg="https://img.0v0.my/2024/07/07/668a8ffdacde3.png"
        />
        <span className="etag-link-title">{title}</span>
        <span className="etag-link-subtitle">{subtitle}</span>
      </a>
    </>
  );
}
