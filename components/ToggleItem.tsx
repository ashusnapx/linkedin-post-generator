// components/ToggleItem.tsx
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormControl,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Control } from "react-hook-form";
import { FormValues } from "../lib/schema";
import { InfoIcon } from "./InfoIcon";

interface ToggleItemProps {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: React.ReactNode;
  desc?: string;
  tip?: string;
}

/**
 * A single toggle row used in the grid of toggles.
 */
export const ToggleItem: React.FC<ToggleItemProps> = ({
  control,
  name,
  label,
  desc,
  tip,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className='flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition-colors hover:border-neutral-700'>
          <div className='space-y-0.5'>
            <FormLabel className='text-sm font-medium text-neutral-300 flex items-center gap-2'>
              {label} {tip && <InfoIcon text={tip} />}
            </FormLabel>
            {desc && (
              <FormDescription className='text-xs text-neutral-500 font-medium'>
                {desc}
              </FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              checked={!!field.value}
              onCheckedChange={field.onChange}
              className='data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-neutral-700'
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
