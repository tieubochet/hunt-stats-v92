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
    <div tw="flex flex-col flex-nowrap justify-center items-center w-full h-full bg-[#fff] text-[#FF6A72] text-[60px]">
      CHECK YOUR HUNT STATS
    </div>
  );

  const ScoreScreen = () => {
    return (
      <div tw="flex flex-col w-full h-screen">
          <img
              src="https://i.imgur.com/G3M412U.png"
              tw="h-screen w-full"
          />
          <img
            src={userData?.profileImageUrl}
            alt="Profile"
            tw="w-25 h-25 rounded-3 absolute top-100 left-60"
          />
          <div tw="flex text-[35px] absolute top-102 left-95 text-black">{userData?.username}</div>
          <div tw="flex text-[26px] absolute top-115 left-95 text-black">FID: {userData?.fid}</div>
          <div tw="flex text-[44px] justify-end absolute top-133 right-66 text-[#FF0F15]">{formatNumber(huntstatsJSON.tip_allowance)}</div>
          <div tw="flex text-[44px] justify-end absolute top-155 right-66 text-[#FF0F15]">{formatNumber(huntstatsJSON.remaining_allowance)}</div>
          <div tw="flex text-[44px] justify-end absolute top-177 right-66 text-[#FF0F15]">{formatNumber(huntstatsJSON.received)}</div>
          <div tw="flex mb-0 absolute bottom-5 left-5">@tieubochet.eth</div>
      </div>
    );
  };
  const shareText = encodeURIComponent(
    userData
      ? `Check your HUNT STATS here 👇 If you like this frame, share and follow @tieubochet.eth`
      : `Check your HUNT STATS here 👇 If you like this frame, share and follow @tieubochet.eth`
  );

  // Change the url here
  /*
  const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=https://check-hunt-stats-v1.vercel.app/frames${
    fid ? `?userfid=${fid}&c=${cacheBust}` : `?userfid=${fid}&c=${cacheBust}`
  }`; 
  */
  const cache = new Date().getTime();
  //const fidEncoded = fid ? encodeURIComponent(fid) : "";

  const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(
    appURL() +
      (fid
        ? `?userfid=${fid}&c=${cache}`
        : `?c=${cache}`)
  )}`;

  //const checkStatusUrl = `${appURL()}?userfid=${fidEncoded}&c=${cacheBust}`;

  const buttons = [];

  if (!userData) {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check your HUNT STATS
      </Button>
    );
  } else {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Check your HUNT STATS
      </Button>,
      <Button action="link" target={shareUrl}>
        Share
      </Button>,
    );
  }

  return {
    image: fid && !error ? <ScoreScreen /> : <SplashScreen />,
    buttons: buttons,
    imageOptions: {
      aspectRatio:"1:1",
    },
    title: "Hunt Stats Frame",
    description: "Use this frame to check yours Hunt Stats",
  };
});

export const GET = frameHandler;
export const POST = frameHandler;