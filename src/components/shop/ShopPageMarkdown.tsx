"use client";

import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
}

export default function ShopPageMarkdown({ content }: Props) {
  return (
    <div className="shop-page-body">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
