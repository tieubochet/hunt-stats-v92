import { Button } from "frames.js/next";
import { frames } from "./frames";
import { appURL, formatNumber } from "../utils";

interface State {
  lastFid?: string;
}

const frameHandler = frames(async (ctx) => {
  interface UserData {
    fid: string;
    profileImageUrl: string;
  }

  let userData: UserData | null = null;

  let error: string | null = null;
  let isLoading = false;

  const fetchUserData = async (fid: string) => {
    isLoading = true;
    try {
      const airstackUrl = `${appURL()}/api/farscore?userId=${encodeURIComponent(fid)}`;
      const airstackResponse = await fetch(airstackUrl);
      if (!airstackResponse.ok) {
        throw new Error(
          `Airstack HTTP error! status: ${airstackResponse.status}`
        );
      }
      const airstackData = await airstackResponse.json();

      if (
        airstackData.userData.Socials.Social &&
        airstackData.userData.Socials.Social.length > 0
      ) {
        const social = airstackData.userData.Socials.Social[0];
        userData = {
          fid: social.userId || "N/A",
          profileImageUrl: social.profileImage || "N/A",
        };
      } else {
        throw new Error("No user data found");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      error = (err as Error).message;
    } finally {
      isLoading = false;
    }
  };


  const extractFid = (url: string): string | null => {
    try {
      const parsedUrl = new URL(url);
      let fid = parsedUrl.searchParams.get("userfid");

      //console.log("Extracted FID from URL:", fid);
      return fid;
    } catch (e) {
      console.error("Error parsing URL:", e);
      return null;
    }
  };

  let fid: string | null = null;

  if (ctx.message?.requesterFid) {
    fid = ctx.message.requesterFid.toString();
    //console.log("Using requester FID:", fid);
  } else if (ctx.url) {
    fid = extractFid(ctx.url.toString());
    console.log("Extracted FID from URL:", fid);
  } else {
    console.log("No ctx.url available");
  }

  if (!fid && (ctx.state as State)?.lastFid) {
    fid = (ctx.state as State).lastFid ?? null;
    console.log("Using FID from state:", fid);
  }

  console.log("Final FID used:", fid);

  const shouldFetchData =
    fid && (!userData || (userData as UserData).fid !== fid);

  if (shouldFetchData && fid) {
    await Promise.all([fetchUserData(fid)]);
  }

  const huntstats = `https://tip.hunt.town/api/stats/fid/${
    fid ? `${fid}` : ""
  }`;

  let huntstatsJSON: any = {};
  try {
    const huntstatsdata = await fetch(huntstats);
    if (huntstatsdata.ok) {
      huntstatsJSON = await huntstatsdata.json();
    } else {
      console.error('Lỗi server hoặc phản hồi không hợp lệ:', huntstatsdata.status);
    }
  } catch (error) {
    console.error('Lỗi khi fetch dữ liệu:', error);
  }

  const SplashScreen = () => (
    <div tw="flex flex-col flex-nowrap justify-center items-center w-full h-full bg-[#fff] text-[#FF6A72] text-[60px]">
      Check yours
    </div>
  );

  const ScoreScreen = () => {
    return (
      <div tw="flex flex-col flex-nowrap justify-center items-center w-full h-full bg-[#333333] text-[40px] text-[#fff]">
          <div tw="flex"><img
              src={userData?.profileImageUrl}
              alt="Profile"
              tw="w-32 h-32 rounded-md mb-2 border border-[#fff]"
            /></div>
          <div tw="flex text-[#fff]">@{huntstatsJSON.username}</div>
          <div tw="flex mb-3 mt-5">Daily Allowance: <span tw="flex text-[#FFF59D] ml-5 mr-5">{formatNumber(huntstatsJSON.tip_allowance)}</span></div>
          <div tw="flex mb-3">Remaining: <span tw="flex text-[#FFF59D] ml-5 mr-5">{formatNumber(huntstatsJSON.remaining_allowance)}</span></div>
          <div tw="flex mb-15">Received: <span tw="flex text-[#FFF59D] ml-5 mr-5">{formatNumber(huntstatsJSON.received)}</span></div>
          
      </div>
    );
  };
  const shareText = encodeURIComponent(
    userData
      ? `Check yours HUNT STATS`
      : `Check yours HUNT STATS`
  );

  // Change the url here
  /*
  const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=https://check-hunt-stats-v1.vercel.app/frames${
    fid ? `?userfid=${fid}&c=${cacheBust}` : `?userfid=${fid}&c=${cacheBust}`
  }`; 
  */
  const cacheBust = new Date().getTime();
  //const fidEncoded = fid ? encodeURIComponent(fid) : "";

  const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(
    appURL() +
      (fid
        ? `?userfid=${fid}&c=${cacheBust}`
        : `?c=${cacheBust}`)
  )}`;

  //const checkStatusUrl = `${appURL()}?userfid=${fidEncoded}&c=${cacheBust}`;

  const buttons = [];

  if (!userData) {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check yours Hunt stats
      </Button>
    );
  } else {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check yours Hunt stats
      </Button>,
      <Button action="link" target={shareUrl}>
        Share
      </Button>,
    );
  }

  return {
    image: fid && !error ? <ScoreScreen /> : <SplashScreen />,
    buttons: buttons,
    title: "Farcaster Frame",
    description: "Use this frame to check yours",
  };
});

export const GET = frameHandler;
export const POST = frameHandler;