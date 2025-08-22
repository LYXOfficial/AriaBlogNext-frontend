import PostHeader from "components/PostHeader";
import { Post } from "interfaces/post";
import { PageASides } from "components/ASides";
import PostContent from "components/PostContent";
import { siteConfigs } from "config";
import { notFound } from "next/navigation";
import { PostRightSide } from "components/RightSide";
import React from "react";

async function getPostInfo(slug: string): Promise<Post> {
  return new Promise((resolve, reject) => {
    fetch(`${siteConfigs.backEndUrl}/get/post/postBySlug?slug=${slug}`, {
      next: { revalidate: 7200, tags: [slug] },
    }).then(async (res) => {
      if (!res.ok) reject();
      const data = await res.json();
      if (data.message == "fail") reject();
      else resolve(data.data);
    });
  });
}
export default async function Page({ params }: { params: { slug: string } }) {
  let currentPost: Post;
  try {
    currentPost = await getPostInfo(params.slug);
  } catch (e) {
    return notFound();
  }
  return (
    <>
      <title>{currentPost.title + " | " + siteConfigs.title}</title>
      <style>{`#navbar{position:fixed}`}</style>
      <PostHeader postInfo={currentPost} />
      <div id="main-container" className="post">
        <PostContent
          mdContent={currentPost.mdContent!}
          postInfo={currentPost}
        />
        <PageASides postInfo={currentPost!} />
        <PostRightSide />
      </div>
    </>
  );
}
