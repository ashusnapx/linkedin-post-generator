import React from "react";
import { ToggleItem } from "../ToggleItem";
import { InfoIcon } from "../InfoIcon";
import { GridWrapper } from "./GridWrapper";

/**
 * Renders a group of toggle switches.
 */
export function ToggleFields({ fields, control }: any) {
  return (
    <GridWrapper className='grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6'>
      {fields.map(({ name, label, desc, icon, tooltip }) => (
        <ToggleItem
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
          desc={desc}
        />
      ))}
    </GridWrapper>
  );
}
