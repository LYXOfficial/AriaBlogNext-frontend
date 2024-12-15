"use client";
import LazyLoad from "vanilla-lazyload";
import { useEffect } from "react";
import React from "react";

export default function Lazyload() {
    useEffect(() => {
        const lazyLoadInstance = new LazyLoad({ elements_selector: ".lazy-img" });
        lazyLoadInstance.update();
    }, []);
    return <></>
}