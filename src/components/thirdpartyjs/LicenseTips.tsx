"use client";
import { useEffect } from "react";
import "node-snackbar/src/sass/snackbar.sass";
import { useRouter } from "nextjs-toploader/app";
import React from "react";

export default function LicenseTips() {
  const router = useRouter();
  useEffect(() => {
    const showTip = async (text: string) => {
      const mod = await import("node-snackbar");
      const Snackbar = mod.default ?? mod;
      Snackbar.show({
        text,
        pos: "top-right",
        onActionClick: function () {
          router.push("/license");
        },
        actionText: "查看博客声明",
      });
    };
    const cpl = function () {
      void showTip("复制成功,转载请注明出处！");
    };
    document.addEventListener("copy", cpl);
    const kdl = function (event: KeyboardEvent) {
      if (event.keyCode == 123) {
        void showTip("已打开开发者模式，请谨记GPL协议！");
      }
    };
    document.addEventListener("keydown", kdl);
    return () => {
      document.removeEventListener("copy", cpl);
      document.removeEventListener("keydown", kdl);
    };
  }, []);
  return <></>;
}
