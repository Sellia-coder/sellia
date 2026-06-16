"use client";

import dynamic from "next/dynamic";

const ShopChatWidget = dynamic(() => import("./ShopChatWidget"), {
  ssr: false,
  loading: () => null,
});

interface Props {
  shopSlug: string;
  shopName: string;
  shopLogoUrl?: string | null;
  primaryColor?: string | null;
}

export default function ShopChatWidgetLoader(props: Props) {
  return <ShopChatWidget {...props} />;
}
