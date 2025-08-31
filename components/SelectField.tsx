// components/SelectField.tsx
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";
import { FormValues } from "../lib/schema";
import { InfoIcon } from "./InfoIcon";

interface SelectFieldProps<T extends string> {
  control: Control<FormValues>;
  name: keyof FormValues;
  label: string;
  items: readonly T[];
  tooltip?: string;
}

/**
 * Generic select field using shadcn/ui select components and react-hook-form.
 */
export function SelectField<T extends string>({
  control,
  name,
  label,
  items,
  tooltip,
}: SelectFieldProps<T>) {
  return (
    <FormField
      control={control as any}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {tooltip && <InfoIcon text={tooltip} />}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value as string}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder='Select' />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {items.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
