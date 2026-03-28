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
    description: "Check your HUNT STATS by @tieubochet.eth",
    openGraph: {
      title: "Hunt Stats Frame v1",
      description: "Check your HUNT STATS by @tieubochet.eth",
      images: [`${framesUrl.origin}/api/og`],
    },
    other: {
      ...(await fetchMetadata(framesUrl)),
      "fc:frame:cast_action:url": castActionUrl.toString(),
      "name": "talentapp:project_verification",
    "content": "b70c8833bbf0f77768198ee82925ee16a05a8b87eb5a34dd3d19d129f7f73c7327123836617fefcd7c04d96933d76707431f8f0651e20ba62a8aee8b9cd64d9a"
    },
  };
}

export default function Page() {
  return <span>Fetch data here: https://warpcast.com/~/developers/embeds</span>;
}
