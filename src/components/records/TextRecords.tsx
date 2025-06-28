import twitterIcon from "../../assets/social/twitter.svg";
import warpcastIcon from "../../assets/social/warpcast.svg";
import githubIcon from "../../assets/social/github.svg";
import discordIcon from "../../assets/social/discord.svg";
import telegramIcon from "../../assets/social/telegram.svg";
import youtubeIcon from "../../assets/social/youtube.svg";

export interface KnownText {
  key: string;
  label: string;
  type: "social" | "profile";
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
}

export const KnownTexts: Record<string, KnownText> = {
  name: {
    key: "name",
    label: "Nickname",
    type: "profile",
    placeholder: "ex. John Wick",
  },
  avatar: {
    key: "avatar",
    label: "Avatar",
    type: "profile",
    placeholder: "Your avatar url",
  },
  url: {
    key: "url",
    label: "Website",
    type: "profile",
    placeholder: "ex. https://www.namespace.ninja",
  },
  description: {
    key: "description",
    label: "Short Bio",
    type: "profile",
    placeholder: "ex. I love Namespace!",
  },
  mail: {
    key: "mail",
    label: "Email",
    type: "profile",
    placeholder: "ex. me@...",
  },
  location: {
    key: "location",
    type: "profile",
    label: "Location",
    placeholder: "ex. Japan/Tokyo",
  },
  "com.twitter": {
    key: "com.twitter",
    type: "social",
    label: "Twitter",
    placeholder: "ex. johndoe",
    icon: twitterIcon,
  },
  "com.warpcast": {
    key: "com.warpcast",
    type: "social",
    label: "Warpcast",
    placeholder: "ex. johndoe",
    icon: warpcastIcon,
  },
  "com.github": {
    key: "com.github",
    type: "social",
    label: "Github",
    placeholder: "ex. johndoe",
    icon: githubIcon,
  },
  "com.discord": {
    key: "com.discord",
    type: "social",
    label: "Discord",
    placeholder: "ex. johndoe",
    icon: discordIcon,
  },
  "org.telegram": {
    key: "org.telegram",
    type: "social",
    label: "Telegram",
    placeholder: "ex. @johndoe",
    icon: telegramIcon,
  },
  "com.youtube": {
    key: "com.youtube",
    type: "social",
    label: "Youtube",
    placeholder: "ex. @johndoe",
    icon: youtubeIcon,
  },
};
