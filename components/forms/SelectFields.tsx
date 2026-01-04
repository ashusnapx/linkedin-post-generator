import React from "react";
import { SelectField } from "../SelectField";
import { InfoIcon } from "../InfoIcon";
import { GridWrapper } from "./GridWrapper";

/**
 * Renders a group of select dropdown fields.
 */
export function SelectFields({ fields, control }: any) {
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
