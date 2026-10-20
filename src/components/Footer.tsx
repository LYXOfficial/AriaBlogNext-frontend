"use client";
import "styles/Footer.css";
import { useEffect, useState, type CSSProperties } from "react";
import { FooterBadges, siteConfigs } from "config";
import { Icon } from "@iconify/react";

export default function Footer() {
  const [footerRunDaysContent, setFooterRunDaysContent] = useState(
    "这个小破站已运行 2 年 85 天 2 时 12 分 19 秒",
  );
  useEffect(() => {
    const tick = () => {
      const seconds = 1000;
      const minutes = seconds * 60;
      const hours = minutes * 60;
      const days = hours * 24;
      const years = days * 365;
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth() + 1;
      const todayDate = today.getDate();
      const todayHour = today.getHours();
      const todayMinute = today.getMinutes();
      const todaySecond = today.getSeconds();
      const t1 = Date.UTC(
        siteConfigs.createYear,
        siteConfigs.createMonth,
        siteConfigs.createDay,
        12,
        0,
        0,
      );
      const t2 = Date.UTC(
        todayYear,
        todayMonth,
        todayDate,
        todayHour,
        todayMinute,
        todaySecond,
      );
      const diff = t2 - t1;
      const diffYears = Math.floor(diff / years);
      const diffDays = Math.floor(diff / days - diffYears * 365);
      const diffHours = Math.floor(
        (diff - (diffYears * 365 + diffDays) * days) / hours,
      );
      const diffMinutes = Math.floor(
        (diff - (diffYears * 365 + diffDays) * days - diffHours * hours) /
          minutes,
      );
      const diffSeconds = Math.floor(
        (diff -
          (diffYears * 365 + diffDays) * days -
          diffHours * hours -
          diffMinutes * minutes) /
          seconds,
      );
      setFooterRunDaysContent(
        " 这个小破站已运行 " +
          diffYears +
          " 年 " +
          diffDays +
          " 天 " +
          diffHours +
          " 时 " +
          diffMinutes +
          " 分 " +
          diffSeconds +
          " 秒",
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <footer id="footer">
      <div id="footer-wrap">
        <div id="footer-copyright">
          ©{siteConfigs.createYear} - {new Date().getFullYear()} By{" "}
          {siteConfigs.author}
        </div>
        <div id="footer-framework-info">
          {FooterBadges.map((item) => {
            return (
              <a
                target="_blank"
                key={item.link}
                title={item.name}
                rel="noopener external nofollow noreferrer"
                href={item.link}
                style={
                  {
                    "--footer-link-color": item.color,
                    "--footer-link-dark-color": item.darkColor,
                  } as CSSProperties
                }
              >
                <Icon icon={item.icon} aria-hidden="true" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </div>
        <div id="footer-rundays">{footerRunDaysContent}</div>
      </div>
    </footer>
  );
}
