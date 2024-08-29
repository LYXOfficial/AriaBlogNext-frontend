import "src/styles/ASide/List.css";
import Link from "next/link";
import Image from "next/image"
import { aSideListItem } from "src/interfaces/asidelistitem";

export default function ASideList({items}:{items:aSideListItem[]}){
    return (
        <div className="aside-list">
            {
                items.map((item:aSideListItem)=>{
                    return (
                        <Link className="aside-list-item" title={item.title.substring(0,50)} href={item.link} key={item.title}>
                            {item.pic==""?<></>:
                                <div className="aside-list-item-pic">
                                    <Image fill={true} src={item.pic} className="aside-list-item-pic-img" alt=""/>
                                </div>
                            }
                            <div className="aside-list-item-content">
                                <span className="aside-list-item-content-title">{item.title}</span>
                                <span className="aside-list-item-content-text">{item.content}</span>
                            </div>
                        </Link>
                    )
                })
            }
        </div>
    )
}