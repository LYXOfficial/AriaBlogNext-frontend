import moment from "moment";

export default function relativeTime(timestamp: number) {
  let aftertime;
  const nowtime = Math.floor(Date.now() / 1000);
  if (nowtime - timestamp < 60) aftertime = "刚刚";
  else if (nowtime - timestamp < 3600)
    aftertime = Math.floor((nowtime - timestamp) / 60) + "分钟前";
  else if (nowtime - timestamp < 86400)
    aftertime = Math.floor((nowtime - timestamp) / 3600) + "小时前";
  else if (nowtime - timestamp < 604800)
    aftertime = Math.floor((nowtime - timestamp) / 86400) + "天前";
  else aftertime = moment.unix(timestamp).format("yyyy-MM-DD");
  return aftertime;
}
