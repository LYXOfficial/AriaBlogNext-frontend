import Posts from '../components/PostCard';
import { HomeASides } from '../components/ASides';
export default function homePage() {
  return (
    <div id="main-container">
      <Posts/>
      <HomeASides/>
    </div>
  );
}