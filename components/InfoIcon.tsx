// components/InfoIcon.tsx
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LucideInfo } from "lucide-react";

interface InfoIconProps {
  text: string;
}

/** Small tooltip-wrapped info icon used across form labels. */
export const InfoIcon: React.FC<InfoIconProps> = ({ text }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <LucideInfo className='inline w-4 h-4 ml-1 text-muted-foreground cursor-pointer' />
      </TooltipTrigger>
      <TooltipContent>
        <p className='text-sm'>{text}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
