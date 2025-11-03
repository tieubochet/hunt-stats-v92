import { headers } from "next/headers";

export function currentURL(pathname: string): URL {
  try {
    const headersList = headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    const protocol = headersList.get("x-forwarded-proto") || "http";

    return new URL(pathname, `${protocol}://${host}`);
  } catch (error) {
    //console.error(error);
    return new URL("http://localhost:3000");
  }
}

export function appURL() {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  } else {
    const url = process.env.APP_URL || vercelURL() || "http://localhost:3000";
    return url;
  }
}

export function vercelURL() {
  return process.env.VERCEL_URL
    ? `https://hunt-stats-v94.vercel.app/`
    : undefined;
}

export function formatNumber(num: number): string {
    return num.toLocaleString('en-US');
}
