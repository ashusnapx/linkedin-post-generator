// components/AdvancedSettings.tsx
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
import { FormValues } from "../lib/schema";
import { Control } from "react-hook-form";
import { one } from "../lib/utils";
import { SelectField } from "./SelectField";
import { CTA_STYLES, READING_LEVELS } from "../lib/constants";
import { InfoIcon } from "./InfoIcon";

interface AdvancedSettingsProps {
  control: Control<FormValues>;
  addHashtags: boolean;
  setSeedValue: (v?: number) => void;
}

/**
 * Advanced settings block (collapsible). Contains temperature, hashtag limit, seed and examples.
 */
export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  control,
  addHashtags,
  setSeedValue,
}) => {
  return (
    <Accordion type='single' collapsible>
      <AccordionItem value='advanced'>
        <AccordionTrigger className='cursor-pointer'>
          ⚙️ Advanced Settings
        </AccordionTrigger>
        <AccordionContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={control as any}
              name='temperature'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Creativity{" "}
                    <InfoIcon text='Higher = more creative, lower = more consistent.' />
                  </FormLabel>
                  <FormControl>
                    <div className='px-2 py-3 rounded-xl border'>
                      <Slider
                        value={[field.value]}
                        min={0}
                        max={1}
                        step={0.05}
                        onValueChange={(v) => field.onChange(one(v))}
                      />
                      <p className='mt-2 text-xs text-muted-foreground'>
                        Current:{" "}
                        <span className='font-medium'>
                          {field.value.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control as any}
              name='hashtagLimit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hashtag Limit{" "}
                    <InfoIcon text='Max number of hashtags allowed.' />
                  </FormLabel>
                  <FormControl>
                    <div
                      className={`px-2 py-3 rounded-xl border ${
                        !addHashtags ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      <Slider
                        value={[field.value]}
                        min={0}
                        max={10}
                        step={1}
                        onValueChange={(v) => field.onChange(one(v))}
                      />
                      <p className='mt-2 text-xs text-muted-foreground'>
                        Max hashtags:{" "}
                        <span className='font-medium'>{field.value}</span>
                      </p>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <SelectField
              control={control}
              name='ctaStyle'
              label='CTA Style'
              items={CTA_STYLES}
              tooltip='Shape of your call-to-action.'
            />
            <SelectField
              control={control}
              name='readingLevel'
              label='Reading Level'
              items={READING_LEVELS}
              tooltip='Controls vocabulary complexity.'
            />

            <FormField
              control={control as any}
              name='seed'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Seed (optional){" "}
                    <InfoIcon text='Same seed → reproducible outputs.' />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      placeholder='e.g. 42'
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const v =
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value);
                        field.onChange(v);
                        setSeedValue(v);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control as any}
              name='examples'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel>
                    Examples{" "}
                    <InfoIcon text='Paste sample posts to mimic style.' />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder='Paste sample posts to mimic tone/structure...'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
