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
    <GridWrapper className='grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8'>
      {fields.map(({ name, label, icon, placeholder, required, tooltip }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-neutral-300 flex items-center gap-2 mb-1.5'>
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
                  className='bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:ring-blue-500/50'
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
