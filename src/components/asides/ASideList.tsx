import "src/styles/ASide/List.css";
import Link from "next/link";
import Image from "next/image"

export default function ASideList({items}:any) {
    return (
        <div className="aside-list">
            {
                items.map((item:any)=>{
                    return (
                        <Link className="aside-list-item" title={item.title} href={item.link} key={item.title}>
                            {item.pic==""?<></>:
                                <div className="aside-list-item-pic">
                                    <img src={item.pic} className="aside-list-item-pic-img" alt=""/>
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