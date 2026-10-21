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
  let hostname = "";
  try {
    hostname = new URL(link, siteConfigs.siteUrl).hostname;
  } catch {
    // 地址格式异常时仍保留卡片，图标使用备用图。
  }

  return (
    <a
      className="etag-link"
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title={`${title}（在新窗口打开）`}
    >
      <span className="etag-link-icon">
        <ImgWithFalldown
          className="etag-link-img"
          src={hostname ? `https://toolb.cn/favicon/${hostname}` : ""}
          alt=""
          falldownImg="https://img.0v0.my/2024/07/07/668a8ffdacde3.png"
        />
      </span>
      <span className="etag-link-content">
        <span className="etag-link-title">{title}</span>
        {subtitle && <span className="etag-link-subtitle">{subtitle}</span>}
        <span className="etag-link-domain">{hostname || "查看链接"}</span>
      </span>
      <svg
        className="etag-link-arrow"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path
          d="M7 17 17 7M7 7h10v10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
