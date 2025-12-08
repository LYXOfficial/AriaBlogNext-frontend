import Posts from "components/PostCard";
import { HomeASides } from "components/ASides";
import { HomeRightSide } from "components/RightSide";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  try {
    return (
      <div id="main-container">
        <Posts page={parseInt(no)} />
        <HomeASides />
        <HomeRightSide />
      </div>
    );
  } catch (e) {
    return notFound();
  }
}
