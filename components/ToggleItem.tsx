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
  label: string;
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
      control={control as any}
      name={name as any}
      render={({ field }) => (
        <FormItem className='flex items-center justify-between rounded-xl border p-4'>
          <div className='space-y-0.5'>
            <FormLabel>
              {label} {tip && <InfoIcon text={tip} />}
            </FormLabel>
            {desc && <FormDescription>{desc}</FormDescription>}
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
