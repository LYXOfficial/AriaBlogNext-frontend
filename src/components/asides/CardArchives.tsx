import "../../styles/ASide/Archive.css";
import "../../styles/ASide/global.css";
import { Icon } from '@iconify/react';
import Link from "next/link";

export default function ASideList({items}:any) {
    return (
        <div className="card-widget card-aside card-latest-comments">
            <div className="card-headline">
                <Icon icon="fa6-solid:box-archive" />
                <span className="card-title">归档</span>
                <Link className="card-viewmore" title="查看更多" href="/archives">
                    <Icon icon="fa6-solid:angle-right" />
                </Link>
            </div>
            <div className="card-body">
                <div className="archives-list">
                    {
                        items.map((item:any)=>{
                            return (
                                <Link className="archives-list-item" href={item.link} key={item.date}>
                                    <span className="archives-list-item-content-date">{item.date}</span>
                                    <span className="archives-list-item-content-count">{item.count}</span>
                                </Link>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}