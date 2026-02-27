/** Format a numeric phone (e.g. 9496895018) to "949-689-5018". */
export function formatPhoneNumber(phone: number | undefined): string {
  if (!phone) return "";
  const digits = String(phone);
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return digits;
}

/** Get a dialable tel: URI from a phone number. */
export function getPhoneUri(phone: number): string {
  const digits = String(phone);
  return digits.length === 10 ? `tel:1${digits}` : `tel:${digits}`;
}

/** Clean a URL for display: remove protocol, www, query params, trailing slash. */
export function cleanUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\?.*$/, "")
    .replace(/\/+$/, "");
}

export type SocialPlatform =
  | "bluesky"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "medium"
  | "onlyfans"
  | "pinterest"
  | "reddit"
  | "snapchat"
  | "substack"
  | "telegram"
  | "threads"
  | "tiktok"
  | "twitch"
  | "twitter"
  | "vimeo"
  | "wechat"
  | "youtube"
  | "link";

const PLATFORM_RULES: [SocialPlatform, string[]][] = [
  ["bluesky", ["bluesky", "bsky.app"]],
  ["facebook", ["facebook", "fb.com"]],
  ["instagram", ["instagram"]],
  ["linkedin", ["linkedin"]],
  ["medium", ["medium"]],
  ["onlyfans", ["onlyfans"]],
  ["pinterest", ["pinterest", "pin.it"]],
  ["reddit", ["reddit"]],
  ["snapchat", ["snapchat"]],
  ["substack", ["substack"]],
  ["telegram", ["telegram", "t.me"]],
  ["threads", ["threads.net"]],
  ["tiktok", ["tiktok"]],
  ["twitch", ["twitch.tv"]],
  ["twitter", ["twitter", "x.com"]],
  ["vimeo", ["vimeo"]],
  ["wechat", ["wechat", "weixin"]],
  ["youtube", ["youtube", "youtu.be"]],
];

/** Detect social platform from URL. Returns "link" for generic URLs. */
export function detectSocialPlatform(url: string): SocialPlatform {
  const lower = url.toLowerCase();
  for (const [platform, keywords] of PLATFORM_RULES) {
    if (keywords.some((kw) => lower.includes(kw))) return platform;
  }
  return "link";
}

/** Sort priority for social links sheet display. Lower index = higher priority. */
const SORT_PRIORITY: SocialPlatform[] = [
  "link",
  "instagram",
  "facebook",
  "youtube",
  "twitter",
  "tiktok",
  "linkedin",
  "pinterest",
  "threads",
  "medium",
  "substack",
  "bluesky",
  "reddit",
  "telegram",
  "twitch",
  "vimeo",
  "wechat",
  "snapchat",
  "onlyfans",
];

/** Sort social link URLs by display priority. */
export function sortSocialLinks(urls: string[]): string[] {
  return [...urls].sort((a, b) => {
    const pa = SORT_PRIORITY.indexOf(detectSocialPlatform(a));
    const pb = SORT_PRIORITY.indexOf(detectSocialPlatform(b));
    return pa - pb;
  });
}

/** Get initials from a display name. e.g. "John Doe" → "JD". */
export function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (
    (parts[0][0] ?? "").toUpperCase() +
    (parts[parts.length - 1][0] ?? "").toUpperCase()
  );
}

/** Non-agent member types (uppercased). */
const NON_AGENT_TYPES = new Set([
  "AE", "AR", "AS", "C", "DAR", "F", "G", "H", "HI", "HIS", "HS", "HW",
  "I", "LC", "M", "MIL", "MKT", "MOV", "NM", "NMDA", "NMDP", "NMLA",
  "NMLS", "NMOS", "NMUA", "OS", "P", "PH", "PHS", "RAD", "RI", "RIS",
  "S", "T", "TM", "UA", "WAV", "SUPERADMIN", "GUEST", "MLS STAFF",
]);

/** Check if a MemberType indicates a non-agent profile. */
export function isNonAgentType(memberType: string | undefined): boolean {
  if (!memberType) return false;
  return NON_AGENT_TYPES.has(memberType.toUpperCase());
}

/** Get the branded background and logo for a non-agent profile based on officeUid. */
export function getOfficeBranding(officeUid: string | undefined): {
  background: string;
  logo: string;
} {
  switch (officeUid) {
    case "100001":
      return { background: "TTBackground", logo: "TTLogo" };
    case "100002":
      return { background: "GSBackground", logo: "GSLogo" };
    case "1014120231006194839356363000000":
      return { background: "RLBackground", logo: "RLLogo" };
    case "1034020605":
      return { background: "NSBackground", logo: "NSLogo" };
    default:
      return { background: "GSBackground", logo: "GSLogo" };
  }
}
