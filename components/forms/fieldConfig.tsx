import { config } from "@/src/config";
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

// Using standard Tailwind colors via classes in rendering or keeping generic icons
// For consistency, we'll pass the icon components directly.

export const inputFields = [
  {
    name: "topic",
    label: "Topic",
    icon: <BookText size={18} className='text-blue-400' />,
    placeholder: "e.g. Cold-start strategies for marketplaces",
    required: true,
    tooltip: "Main subject or idea of your post.",
  },
  {
    name: "audience",
    label: "Audience",
    icon: <User size={18} className='text-purple-400' />,
    placeholder: "e.g. Founders, PMs, Job seekers",
    tooltip: "Target readers or viewers for your post.",
  },
];

export const selectFields = [
  {
    name: "tone",
    label: "Tone",
    icon: <SlidersHorizontal size={18} className='text-green-400' />,
    items: config.ui.personas,
    tooltip: "Style and feeling of your post's language.",
  },
  {
    name: "length",
    label: "Post Length",
    icon: <BookText size={18} className='text-pink-400' />,
    items: config.ui.lengths,
    tooltip: "How long the generated posts should be.",
  },
  {
    name: "postCount",
    label: "Posts",
    icon: <CheckCircle size={18} className='text-yellow-400' />,
    items: config.ui.postCounts,
    tooltip: "Number of posts to create with each generation.",
  },
  {
    name: "language",
    label: "Language",
    icon: <Languages size={18} className='text-orange-400' />,
    items: config.ui.languages,
    tooltip: "Language used in generated posts.",
  },
];

export const toggleFields = [
  {
    name: "allowEmojis",
    label: "Use Emojis",
    icon: <Smile size={18} className='text-cyan-400' />,
    desc: "Sprinkle relevant emojis.",
    tooltip: "Toggle adding emojis to posts.",
  },
  {
    name: "includeLinks",
    label: "Include Links",
    icon: <Link2 size={18} className='text-indigo-400' />,
    desc: "Append helpful links.",
    tooltip: "Toggle appending external links.",
  },
  {
    name: "addHashtags",
    label: "Add Hashtags",
    icon: <Hash size={18} className='text-rose-400' />,
    desc: "Auto-extract topic tags.",
    tooltip: "Toggle adding hashtags automatically.",
  },
  {
    name: "addCTA",
    label: "Add CTA",
    icon: <Megaphone size={18} className='text-teal-400' />,
    desc: "Prompt readers to engage.",
    tooltip: "Toggle adding a call-to-action.",
  },
];
