import React from "react";
import { SelectField } from "../SelectField";
import { InfoIcon } from "../InfoIcon";
import { GridWrapper } from "./GridWrapper";

/**
 * Renders a group of select dropdown fields.
 */
export function SelectFields({ fields, control }: any) {
  return (
    <GridWrapper colsMobile={2} colsMd={4} gap={4}>
      {fields.map(({ name, label, icon, items, tooltip }) => (
        <SelectField
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
          items={items}
        />
      ))}
    </GridWrapper>
  );
}
