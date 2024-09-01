export const revalidate=7200;

import Posts from 'components/PostCard';
import { HomeASides } from 'components/ASides';
import { RightButtonsHome } from 'components/RightButtons';
import HomeSpeaks from '@/components/HomeSpeaks';

export default function Page() {
  return (
    <div id="main-container">
      <HomeSpeaks/>
      <Posts page={1}/>
      <HomeASides/>
      <RightButtonsHome/>
    </div>
  );
}