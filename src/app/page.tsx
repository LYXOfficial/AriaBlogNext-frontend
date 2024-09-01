export const revalidate=7200;

import Posts from 'components/PostCard';
import { HomeASides } from 'components/ASides';
import HomeSpeaks from '@/components/HomeSpeaks';
import { HomeRightSide } from '@/components/RightSide';

export default function Page() {
  return (
    <div id="main-container">
      <HomeSpeaks/>
      <Posts page={1}/>
      <HomeASides/>
      <HomeRightSide/>
    </div>
  );
}