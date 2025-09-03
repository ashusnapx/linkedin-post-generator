import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { one } from "../lib/utils";
import { SelectField } from "./SelectField";
import { CTA_STYLES, READING_LEVELS } from "../lib/constants";
import { FormValues } from "../lib/schema";
import { Settings, Tag } from "lucide-react";
import { InfoIcon } from "./InfoIcon";

const pastel = {
  indigo: "#bfcaff",
};

type AdvancedField =
  | {
      kind: "slider";
      name: keyof FormValues;
      label: React.ReactNode;
      tooltip: string;
      min: number;
      max: number;
      step: number;
      getDisabled?: (addHashtags: boolean) => boolean;
      getValueLabel?: (value: any) => string;
    }
  | {
      kind: "select";
      name: keyof FormValues;
      label: React.ReactNode;
      tooltip: string;
      items: any[];
    }
  | {
      kind: "input";
      name: keyof FormValues;
      label: React.ReactNode;
      tooltip: string;
      inputType: string;
      placeholder?: string;
      onValueChange?: (
        v: any,
        setSeedValue: (v?: number) => void,
        onChange: (v: any) => void
      ) => void;
    }
  | {
      kind: "textarea";
      name: keyof FormValues;
      label: React.ReactNode;
      tooltip: string;
      placeholder?: string;
      extraClass?: string;
    };

const getFields = (addHashtags: boolean): AdvancedField[] => [
  {
    kind: "slider",
    name: "temperature",
    label: <>Creativity</>,
    tooltip: "Higher = more creative, lower = more consistent.",
    min: 0,
    max: 1,
    step: 0.05,
    getValueLabel: (v) => `Current: ${v.toFixed(2)}`,
  },
  {
    kind: "slider",
    name: "hashtagLimit",
    label: (
      <>
        <Tag size={16} color={pastel.indigo} />
        Hashtag Limit
      </>
    ),
    tooltip: "Max number of hashtags allowed.",
    min: 0,
    max: 10,
    step: 1,
    getDisabled: () => !addHashtags,
    getValueLabel: (v) => `Max hashtags: ${v}`,
  },
  {
    kind: "select",
    name: "ctaStyle",
    label: <>CTA Style</>,
    tooltip: "Shape of your call-to-action.",
    items: CTA_STYLES,
  },
  {
    kind: "select",
    name: "readingLevel",
    label: <>Reading Level</>,
    tooltip: "Controls vocabulary complexity.",
    items: READING_LEVELS,
  },
  {
    kind: "input",
    name: "seed",
    label: <>Seed (optional)</>,
    tooltip: "Same seed → reproducible outputs.",
    inputType: "number",
    placeholder: "e.g. 42",
    onValueChange: (e, setSeedValue, onChange) => {
      const v = e.target.value === "" ? undefined : Number(e.target.value);
      onChange(v);
      setSeedValue(v);
    },
  },
  {
    kind: "textarea",
    name: "examples",
    label: <>Examples</>,
    tooltip: "Paste sample posts to mimic style.",
    placeholder: "Paste sample posts to mimic tone/structure...",
    extraClass: "md:col-span-2",
  },
];

export const AdvancedSettings: React.FC<{
  control: Control<FormValues>;
  addHashtags: boolean;
  setSeedValue: (v?: number) => void;
}> = ({ control, addHashtags, setSeedValue }) => {
  const fields = getFields(addHashtags);

  return (
    <Accordion type='single' collapsible>
      <AccordionItem value='advanced'>
        <AccordionTrigger className='cursor-pointer flex items-center gap-2 text-base font-semibold group'>
          <Settings
            size={20}
            color={pastel.indigo}
            className='group-hover:rotate-12 transition-transform'
          />
          Advanced Settings
        </AccordionTrigger>
        <AccordionContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-4'>
            {fields.map((f) => {
              const infoTip = <InfoIcon text={f.tooltip} />;
              if (f.kind === "slider") {
                return (
                  <FormField
                    key={f.name as string}
                    control={control as any}
                    name={f.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-1'>
                          {f.label}
                          {infoTip}
                        </FormLabel>
                        <FormControl>
                          <div
                            className={
                              `px-3 py-4 rounded-xl border border-indigo-100 bg-slate-50 dark:bg-neutral-800 transition-opacity` +
                              (f.getDisabled && f.getDisabled(addHashtags)
                                ? " opacity-50 pointer-events-none"
                                : "")
                            }
                          >
                            <Slider
                              value={[field.value]}
                              min={f.min}
                              max={f.max}
                              step={f.step}
                              onValueChange={(v) => field.onChange(one(v))}
                              className='accent-indigo-500'
                            />
                            {f.getValueLabel && (
                              <p className='mt-2 text-xs text-muted-foreground'>
                                {f.getValueLabel(field.value)}
                              </p>
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                );
              }
              if (f.kind === "select") {
                return (
                  <SelectField
                    key={f.name as string}
                    control={control}
                    name={f.name}
                    label={
                      <span className='flex items-center gap-1'>
                        {f.label}
                        {infoTip}
                      </span>
                    }
                    items={f.items}
                  />
                );
              }
              if (f.kind === "input") {
                return (
                  <FormField
                    key={f.name as string}
                    control={control as any}
                    name={f.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-1'>
                          {f.label}
                          {infoTip}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={f.inputType}
                            inputMode={f.inputType}
                            placeholder={f.placeholder}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              f.onValueChange
                                ? f.onValueChange(
                                    e,
                                    setSeedValue,
                                    field.onChange
                                  )
                                : field.onChange(e.target.value)
                            }
                            className='bg-slate-50 dark:bg-neutral-800 border border-indigo-100'
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                );
              }
              if (f.kind === "textarea") {
                return (
                  <FormField
                    key={f.name as string}
                    control={control as any}
                    name={f.name}
                    render={({ field }) => (
                      <FormItem className={f.extraClass}>
                        <FormLabel className='flex items-center gap-1'>
                          {f.label}
                          {infoTip}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            rows={4}
                            placeholder={f.placeholder}
                            {...field}
                            className='bg-slate-50 dark:bg-neutral-800 border border-indigo-100'
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                );
              }
              return null;
            })}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
