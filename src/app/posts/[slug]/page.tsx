import PostHeader from "components/PostHeader";
import { Post } from "interfaces/post";
import { PageASides } from "components/ASides";
import PostContent from "components/PostContent";
import { siteConfigs } from "config";
import MDRender from "utils/mdrender";
import { notFound } from "next/navigation";
import { PostRightSide } from "components/RightSide";
import { MDXRemote } from 'next-mdx-remote/rsc';
import React from "react";
import Markdown from 'markdown-to-jsx'

async function getPostInfo(slug: string): Promise<Post> {
    return new Promise((resolve, reject) => {
        fetch(`${siteConfigs.backEndUrl}/get/post/postBySlug?slug=${slug}`, { next: { revalidate: 7200, tags: [slug] } })
            .then(async res => {
                if (!res.ok) reject();
                let data = (await res.json());
                if (data.message == "fail") reject();
                else resolve(data.data);
            });
    });
}
export default async function Page({ params }: { params: { slug: string } }) {
    let currentPost: Post;
    try {
        currentPost = await getPostInfo(params.slug);
    }
    catch (e) {
        return notFound();
    }
    let htmlContent: string;
    htmlContent = currentPost.mdContent!;
    return (<>
        <title>{currentPost.title + " | " + siteConfigs.title}</title>
        <style>{`#navbar{position:fixed}`}</style>
        <PostHeader postInfo={currentPost} />
        <div id="main-container" className="post">
            <PostContent htmlContent={<Markdown>{htmlContent}</Markdown>} postInfo={currentPost} />
            <PageASides postInfo={currentPost!} />
            <PostRightSide />
        </div>
    </>);
}