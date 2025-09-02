import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InfoIcon } from "../InfoIcon";
import { GridWrapper } from "./GridWrapper";

/**
 * Renders a group of text input fields.
 */
export function InputFields({ fields, control }: any) {
  return (
    <GridWrapper colsMobile={1} colsSm={2} gap={4}>
      {fields.map(({ name, label, icon, placeholder, required, tooltip }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-base font-medium flex items-center gap-2'>
                {icon}
                <span>{label}</span>
                {required && <span className='text-red-400'>*</span>}
                {tooltip && <InfoIcon text={tooltip} />}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={placeholder}
                  required={required}
                  {...field}
                  className='bg-slate-100 dark:bg-neutral-800 border-none'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </GridWrapper>
  );
}
