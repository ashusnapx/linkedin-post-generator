import React from "react";
import { SelectField } from "../SelectField";
import { InfoIcon } from "../InfoIcon";
import { GridWrapper } from "./GridWrapper";

import { Control } from "react-hook-form";
import { FormValues } from "../../lib/schema";

interface SelectFieldConfig {
  name: keyof FormValues;
  label: string;
  icon?: React.ReactNode;
  items: readonly string[];
  tooltip?: string;
}

/**
 * Renders a group of select dropdown fields.
 */
export function SelectFields({
  fields,
  control,
}: {
  fields: SelectFieldConfig[];
  control: Control<FormValues>;
}) {
  return (
    <GridWrapper className='grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8'>
      {fields.map(({ name, label, icon, items, tooltip }) => (
        <SelectField
          key={name}
          control={control}
          name={name}
          label={
            <span className='flex items-center gap-2 text-sm text-neutral-300'>
              {icon}
              <span>{label}</span>
              {tooltip && <InfoIcon text={tooltip} />}
            </span>
          }
          items={items}
        />
      ))}
    </GridWrapper>
  );
}
