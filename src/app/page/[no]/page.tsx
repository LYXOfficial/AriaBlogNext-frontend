export const revalidate=7200;

import Posts from 'components/PostCard';
import { HomeASides } from 'components/ASides';
import { RightButtonsHome } from 'components/RightButtons';
import { notFound } from 'next/navigation';

export default function Page({params}:{params:{no:string}}) {
    try{
        return (
            <div id="main-container">
                <Posts page={Number(params.no)}/>
                <HomeASides/>
                <RightButtonsHome/>
            </div>
        );
    }
    catch(e){
        return notFound();
    }
}