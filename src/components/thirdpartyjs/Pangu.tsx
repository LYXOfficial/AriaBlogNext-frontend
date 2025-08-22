"use client";
import pangu from "pangu";
import { useEffect } from "react";
import React from "react";

export default function Pangu({ container }: { container: string }) {
  useEffect(() => {
    pangu.spacingElementById(container);
  }, []);
  return <></>;
}
