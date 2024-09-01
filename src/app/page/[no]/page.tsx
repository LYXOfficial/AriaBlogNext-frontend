export const revalidate=7200;

import Posts from 'components/PostCard';
import { HomeASides } from 'components/ASides';
import { HomeRightSide } from 'components/RightSide';
import { notFound } from 'next/navigation';

export default function Page({params}:{params:{no:string}}) {
    try{
        return (
            <div id="main-container">
                <Posts page={Number(params.no)}/>
                <HomeASides/>
                <HomeRightSide/>
            </div>
        );
    }
    catch(e){
        return notFound();
    }
}