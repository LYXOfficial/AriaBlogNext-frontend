import Posts from 'src/components/PostCard';
import { HomeASides } from 'src/components/ASides';
import { RightButtonsHome } from 'src/components/RightButtons';
import { notFound } from 'next/navigation';
import { siteConfigs } from 'public/config';

export default function homePage({params}:{params:{no:string}}) {
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