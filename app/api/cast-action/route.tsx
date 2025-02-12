// app/api/cast-action/route.ts
import { NextRequest } from "next/server";
import { appURL } from "../../utils";
import { frames } from "../../frames/frames";
import { castAction, castActionFrame } from "frames.js/core";

export const GET = async (req: NextRequest) => {
  return castAction({
    action: {
      type: "post",
    },
    icon: "pulse",
    name: "Hunt Stats Frame v1",
    aboutUrl: `${appURL()}`,
    description: "Check your HUNT STATS by @tieubochet.eth",
  });
};

export const POST = frames(async (ctx) => {
  //console.log("Cast Action FID: " + ctx.message?.castId?.fid);
  return castActionFrame(`${appURL()}?userfid=${ctx.message?.castId?.fid}`);
});
