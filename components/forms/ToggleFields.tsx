import React from "react";
import { ToggleItem } from "../ToggleItem";
import { InfoIcon } from "../InfoIcon";
import { GridWrapper } from "./GridWrapper";

/**
 * Renders a group of toggle switches.
 */
export function ToggleFields({ fields, control }: any) {
  return (
    <GridWrapper colsMobile={2} colsSm={4} gap={4}>
      {fields.map(({ name, label, desc, icon, tooltip }) => (
        <ToggleItem
          key={name}
          control={control}
          name={name}
          label={
            <span className='flex items-center gap-2'>
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
