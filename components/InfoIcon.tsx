// components/InfoIcon.tsx
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface InfoIconProps {
  text: string;
}

/** Small tooltip-wrapped info icon used across form labels. */
export const InfoIcon: React.FC<InfoIconProps> = ({ text }) => (
  <TooltipProvider>
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <Info className='inline w-4 h-4 ml-1.5 text-neutral-500 hover:text-neutral-300 transition-colors cursor-help' />
      </TooltipTrigger>
      <TooltipContent className='bg-neutral-900 border-neutral-800 text-neutral-300 text-xs px-3 py-2 max-w-[200px]'>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
