"use client";

import dynamic from "next/dynamic";

const ShopVisitTracker = dynamic(() => import("./ShopVisitTracker"), {
  ssr: false,
  loading: () => null,
});

interface Props {
  shopSlug: string;
}

export default function ShopVisitTrackerLoader({ shopSlug }: Props) {
  return <ShopVisitTracker shopSlug={shopSlug} />;
}
