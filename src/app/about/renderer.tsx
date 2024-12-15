"use client";
import Content from "./content.mdx";
import KaTex from "@/components/thirdpartyjs/KaTex";
export default function Renderer() {
    return <><Content /><KaTex /></>;
}