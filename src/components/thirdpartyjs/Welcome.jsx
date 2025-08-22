"use client";
import { useEffect, useState } from "react";
import Snackbar from "node-snackbar";
import "node-snackbar/src/sass/snackbar.sass";
import { useRouter } from "next/navigation";
import calendar from "js-calendar-converter";

const today = new Date();
const year = today.getFullYear(),
  month = today.getMonth() + 1,
  day = today.getDate();

const SpecialDaysGre = new Map([
  ["1-1", `新年新气象，喜迎${year}，元旦快乐！`],
  ["4-4", "清风化雨，润物无声，清明安康。"],
  ["4-5", "清风化雨，润物无声，清明安康。"],
  ["4-6", "清风化雨，润物无声，清明安康。"],
  ["5-1", "劳动节快乐！"],
  ["6-1", "儿童节快乐！大家都是永远的小朋友哦喵！"],
  ["7-7", `卢沟桥事变 ${year - 1937} 周年，勿忘国耻，振兴中华！`],
  ["9-18", `九一八事变 ${year - 1931} 周年，勿忘国耻，振兴中华！`],
  ["10-1", `祖国 ${year - 1949} 岁生日快乐！`],
  ["10-2", `祖国 ${year - 1949} 岁生日快乐！`],
  ["10-3", `祖国 ${year - 1949} 岁生日快乐！`],
  ["12-13", `南京大屠杀 ${year - 1937} 周年，勿忘国耻，振兴中华！`],
]);
const SpecialDaysLunar = new Map([
  ["12-29", "愿得长如此，年年物候新"],
  ["12-30", "千门万户曈曈日，总把新桃换旧符"],
  ["1-1", "爆竹声中一岁除，新年快乐！"],
  ["1-2", "今日初二，喜气洋洋，财源滚滚！"],
  ["1-3", "今日初三，旧气已去，新岁伴来！"],
  ["1-4", "今日初四，恭喜发财，红包拿来TAT"],
  ["1-5", "新年快乐，岁岁平安！"],
  ["1-15", "上元花开，灯喜满城，元宵快乐！"],
  ["5-5", "粽香传千里，安康端午日"],
  ["7-7", "家家乞巧望秋月，穿尽红丝几万条"],
  ["8-15", "花好月圆，今日中秋！"],
  ["9-9", "遍插茱萸，登高节快！"],
]);

export default function Welcome() {
  const router = useRouter();
  const [gray, setGray] = useState(null);
  useEffect(() => {
    if (month === 12 && day === 13) {
      document.documentElement.style.filter = "grayscale(100%)";
      setGray(
        <style
          dangerouslySetInnerHTML={{
            __html: `body { filter: grayscale(100%); }`,
          }}
        ></style>,
      );
    }
    (async () => {
      if (localStorage.getItem("showedWelcome") != "1") {
        const referrer = document.referrer;
        Snackbar.show({
          pos: "top-right",
          showAction: false,
          text:
            referrer &&
            referrer.indexOf("yaria.top") == -1 &&
            referrer.indexOf("0v0.my") == -1 &&
            referrer.indexOf("yisous.xyz") == -1
              ? `欢迎来自${new URL(referrer).hostname}的朋友访问本站！`
              : "欢迎访问本站！",
        });
        setTimeout(() => {
          Snackbar.show({
            text: "本站使用Cookie和本地/会话存储保证浏览体验和网站统计",
            pos: "bottom-right",
            actionText: "查看博客声明",
            onActionClick: () => router.push("/license"),
          });
          localStorage.setItem("showedWelcome", "1");
        }, 3000);
      }
      const { lMonth, lDay } = calendar.solar2lunar(year, month, day);
      const specialDaysMessage =
        SpecialDaysGre.get(`${month}-${day}`) ||
        SpecialDaysLunar.get(`${lMonth}-${lDay}`);
      if (specialDaysMessage)
        Snackbar.show({
          text: specialDaysMessage,
          pos: "top-left",
          showAction: false,
        });
    })();
  }, [router]);
  return <>{gray}</>;
}
