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
    username: string;
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
          username: social.profileName || "unknown",
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
      return fid;
    } catch (e) {
      console.error("Error parsing URL:", e);
      return null;
    }
  };

  let fid: string | null = null;

  if (ctx.message?.requesterFid) {
    fid = ctx.message.requesterFid.toString();
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

  const getCurrentUTCTime = (): string => {
    const now = new Date();

    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0"); 
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}, ${hours}:${minutes}:${seconds} UTC`;
  };

  const dateNow = getCurrentUTCTime();

  const getTimeUntilMidnightUTC = () => {
    const now = new Date();
    const nowTime = now.getTime(); // milliseconds
  
    // Lấy ngày hiện tại và set giờ phút giây về 0 (bắt đầu ngày mới)
    const midnight = new Date(now);
    midnight.setUTCHours(0, 0, 0, 0);
  
    // Thêm 1 ngày để tính 00:00 UTC ngày hôm sau
    midnight.setUTCDate(midnight.getUTCDate() + 1);
  
    const midnightTime = midnight.getTime(); // milliseconds
  
    const timeLeft = midnightTime - nowTime; // milliseconds còn lại
  
    const seconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
  
    const remainingMinutes = minutes % 60;
    const remainingHours = hours % 24;
  
    return `${remainingHours} hours ${remainingMinutes} minutes`;
  };
  
  const timeLeft = getTimeUntilMidnightUTC();

  const huntstats = `https://tip.hunt.town/api/stats/fid/${fid ? `${fid}` : ""}`;

  let huntstatsJSON: any = {};
  try {
    const huntstatsdata = await fetch(huntstats);
    if (huntstatsdata.ok) {
      huntstatsJSON = await huntstatsdata.json();
    } else {
      console.error('Error:', huntstatsdata.status);
    }
  } catch (error) {
    console.error('Fetch data error:', error);
  }

  const SplashScreen = () => (
    <div tw="flex flex-col w-full h-screen">
      <img
          src="https://i.imgur.com/jJQ4xtP.png"
          tw="h-screen w-full"
        />
    </div>
  );

  const ScoreScreen = () => {
    return (
      <div tw="flex flex-col w-full h-screen">
          <img
              src="https://i.imgur.com/qZazp7y.png"
              tw="h-screen w-full"
          />
          <img
            src={huntstatsJSON.pfp_url}
            alt="Profile"
            tw="w-25 h-25 rounded-3 absolute top-85 left-60"
          />
          <div tw="flex mb-0 absolute top-4 right-5">{dateNow}</div>
          <div tw="flex mb-0 absolute top-4 left-63">#Season 7</div>
          <div tw="flex text-[35px] absolute top-87 left-95 text-black">{userData?.username}</div>
          <div tw="flex text-[26px] absolute top-100 left-95 text-black">FID: {userData?.fid}</div>
          <div tw="flex mb-0 absolute bottom-5 right-5 text-[26px] text-[#000000]">Reset time: {timeLeft}</div>
          <div tw="flex text-[32px] justify-end absolute top-88 right-55 text-black">Score: {formatNumber(huntstatsJSON.farscore)}</div>
          <div tw="flex text-[32px] w-25 justify-end absolute top-122 right-137 text-[#FF0F15]">{huntstatsJSON.miniBuildingCount }</div>
          <div tw="flex text-[32px] w-25 justify-end absolute top-122 left-42 text-[#FF0F15]">{huntstatsJSON.buildings.length }</div>
          <div tw="flex text-[44px] justify-end absolute top-142 right-66 text-[#FF0F15]">{formatNumber(huntstatsJSON.tip_allowance)} 👏</div>
          <div tw="flex text-[44px] justify-end absolute top-163 right-66 text-[#FF0F15]">{formatNumber(huntstatsJSON.remaining_allowance)} 👏</div>
          <div tw="flex text-[44px] justify-end absolute top-185 right-66 text-[#FF0F15]">{formatNumber(huntstatsJSON.tipped)} 👏</div>
          <div tw="flex text-[44px] justify-end absolute top-205 right-66 text-[#f00707]">{formatNumber(huntstatsJSON.received)} 👏</div>
          <div tw="flex mb-0 absolute bottom-5 left-5 text-[26px] text-[#000000]">Frame Created by @tieubochet.eth</div>
          
      </div>
    );
  };
  const shareText = encodeURIComponent(
    userData
      ? `Check your HUNT STATS here 👇 If you like this frame, please share and follow @tieubochet.eth 🤤`
      : `Check your HUNT STATS here 👇 If you like this frame, please share and follow @tieubochet.eth 🤤`
  );

  const cache = new Date().getTime();

  const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(
    appURL() +
      (fid
        ? `?userfid=${fid}&c=${cache}`
        : `?c=${cache}`)
  )}`;

  const buttons = [];

  if (!userData) {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check yours
      </Button>,
      <Button action="link" target="https://warpcast.com/tieubochet.eth">
      Tip here
    </Button>,
      <Button action="link" target={shareUrl}>
        Share
      </Button>,
      <Button
      action="link"
        // Change the url here
        target="https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fcheck-hunt-stats-v93.vercel.app%2Fapi%2Fcast-action"
      >
        Add Action
      </Button>,
    );
  } else {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check yours
      </Button>,
      <Button action="link" target="https://warpcast.com/tieubochet.eth">
        Tip here
      </Button>,
      <Button action="link" target={shareUrl}>
        Share
      </Button>,
      <Button action="link"
        // Change the url here
        target="https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fcheck-hunt-stats-v93.vercel.app%2Fapi%2Fcast-action"
      >
        Add Action
      </Button>,
    );
  }

  return {
    image: fid && !error ? <ScoreScreen /> : <SplashScreen />,
    buttons: buttons,
    imageOptions: {
      aspectRatio:"1:1",
    },
    title: "Farcaster Frame",
    description: "Use this frame to check your Hunt Stats",
  };
});

export const GET = frameHandler;
export const POST = frameHandler;
