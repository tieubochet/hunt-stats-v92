import { fetchMetadata } from "frames.js/next";
import { appURL } from "./utils";
import { Inter } from 'next/font/google'
import type { Metadata } from "next";



export async function generateMetadata({
  searchParams,
}: {
  searchParams: { userfid?: string };
}) {
  const framesUrl = new URL("/frames", appURL());

  if (searchParams.userfid) {
    framesUrl.searchParams.set("userfid", searchParams.userfid);
    framesUrl.searchParams.set("action", "fetch");
  }

  //console.log("Fetching metadata from:", framesUrl.toString());

  const castActionUrl = new URL("/api/cast-action", appURL());

  return {
    title: "Hunt Stats Frame v1",
    description: "Check your HUNT STATS by @teeboo.eth",
    openGraph: {
      title: "Hunt Stats Frame v1",
      description: "Check your HUNT STATS by @teeboo.eth",
      images: [`${framesUrl.origin}/api/og`],
    },
    other: {
      ...(await fetchMetadata(framesUrl)),
      "fc:frame:cast_action:url": castActionUrl.toString()
    },
  };
}

export default function Page() {
  return <span>Fetch data here: https://warpcast.com/~/developers/embeds</span>;
}
