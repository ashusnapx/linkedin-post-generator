import { LANGUAGES, LENGTHS, PERSONAS, POST_COUNTS } from "@/lib/constants";
import {
  User,
  BookText,
  Languages,
  SlidersHorizontal,
  Smile,
  Link2,
  Hash,
  Megaphone,
  CheckCircle,
} from "lucide-react";


const pastel = {
  lavender: "#c7ceea",
  mint: "#a8e6cf",
  gray: "#94a3b8",
  blue: "#a2d5f2",
};

export const inputFields = [
  {
    name: "topic",
    label: "Topic",
    icon: <BookText size={20} color={pastel.lavender} />,
    placeholder: "e.g. Cold-start strategies for marketplaces",
    required: true,
    tooltip: "Main subject or idea of your post.",
  },
  {
    name: "audience",
    label: "Audience",
    icon: <User size={20} color={pastel.gray} />,
    placeholder: "e.g. Founders, PMs, Job seekers",
    tooltip: "Target readers or viewers for your post.",
  },
];

export const selectFields = [
  {
    name: "tone",
    label: "Tone",
    icon: <SlidersHorizontal size={20} color={pastel.mint} />,
    items: PERSONAS,
    tooltip: "Style and feeling of your post's language.",
  },
  {
    name: "length",
    label: "Post Length",
    icon: <BookText size={20} color={pastel.lavender} />,
    items: LENGTHS,
    tooltip: "How long the generated posts should be.",
  },
  {
    name: "postCount",
    label: "Posts",
    icon: <CheckCircle size={20} color={pastel.blue} />,
    items: POST_COUNTS,
    tooltip: "Number of posts to create with each generation.",
  },
  {
    name: "language",
    label: "Language",
    icon: <Languages size={20} color={pastel.gray} />,
    items: LANGUAGES,
    tooltip: "Language used in generated posts.",
  },
];

export const toggleFields = [
  {
    name: "allowEmojis",
    label: "Use Emojis",
    icon: <Smile size={18} color={pastel.mint} />,
    desc: "Sprinkle relevant emojis.",
    tooltip: "Toggle adding emojis to posts.",
  },
  {
    name: "includeLinks",
    label: "Include Links",
    icon: <Link2 size={18} color={pastel.blue} />,
    desc: "Append helpful links.",
    tooltip: "Toggle appending external links.",
  },
  {
    name: "addHashtags",
    label: "Add Hashtags",
    icon: <Hash size={18} color={pastel.lavender} />,
    desc: "Auto-extract topic tags.",
    tooltip: "Toggle adding hashtags automatically.",
  },
  {
    name: "addCTA",
    label: "Add CTA",
    icon: <Megaphone size={18} color={pastel.gray} />,
    desc: "Prompt readers to engage.",
    tooltip: "Toggle adding a call-to-action.",
  },
];
