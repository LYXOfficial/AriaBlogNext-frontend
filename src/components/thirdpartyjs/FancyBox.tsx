"use client";
import { useEffect } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import React from "react";

export default function FancyBox() {
  useEffect(() => {
    Fancybox.bind("[data-fancybox]");
  }, []);
  return <></>;
}
