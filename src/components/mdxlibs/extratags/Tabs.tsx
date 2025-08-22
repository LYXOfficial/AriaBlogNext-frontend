"use client";
import React, { ReactNode, useState } from "react";

export default function TabsTag({ children }: { children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabHeaders: string[] = [];
  const tabContents: ReactNode[] = [];

  React.Children.forEach(children, (child, index) => {
    if (React.isValidElement(child) && child.props.title) {
      tabHeaders.push(child.props.title);
      tabContents.push(child.props.children);
    }
  });

  return (
    <div className="etag-tabs-container">
      <div className="etag-tab-headers">
        {tabHeaders.map((title, index) => (
          <button
            key={index}
            className={`etag-tab-header${activeIndex === index ? " active" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            {title}
          </button>
        ))}
      </div>
      <div className="etag-tab-bodies">
        {tabContents.map((content, index) => (
          <div
            key={index}
            className={`etag-tab-body${activeIndex === index ? " active" : ""}`}
            style={{ display: activeIndex === index ? "block" : "none" }}
          >
            {content}
          </div>
        ))}
      </div>
    </div>
  );
}

export const TabTag = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return <>{children}</>;
};
