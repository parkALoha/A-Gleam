"use client";

import { Fragment } from "react";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectGroup = {
  label: string;
  options: SelectOption[];
};

const DEFAULT_BUTTON_CLASS =
  "mt-1.5 flex w-full items-center justify-between gap-2 rounded-xl border border-shop-blush-100 bg-white px-4 py-2.5 text-left text-sm text-shop-text outline-none focus:border-shop-blush-500 disabled:cursor-not-allowed disabled:bg-shop-beige-100 disabled:text-shop-text-soft";

const OPTION_CLASS =
  "cursor-pointer truncate rounded-lg px-3 py-2 data-focus:bg-shop-blush-50 data-disabled:cursor-not-allowed data-disabled:text-shop-text-soft data-selected:font-medium data-selected:text-shop-blush-600";

function flatten(options?: SelectOption[], groups?: SelectGroup[]): SelectOption[] {
  return [...(options ?? []), ...(groups ?? []).flatMap((g) => g.options)];
}

export default function Select({
  value,
  onChange,
  options,
  groups,
  disabled,
  buttonClassName,
  id,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  disabled?: boolean;
  buttonClassName?: string;
  /** When set, a visually-hidden native <select> with this id mirrors the
   * selection — some forms look it up via document.getElementById to run
   * native required-field validation (el.validity / el.reportValidity()). */
  id?: string;
  required?: boolean;
}) {
  const flat = flatten(options, groups);
  const selectedLabel = flat.find((o) => o.value === value)?.label ?? "";

  return (
    <div className="relative">
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <ListboxButton className={buttonClassName ?? DEFAULT_BUTTON_CLASS}>
          <span className="truncate">{selectedLabel}</span>
          <svg
            className="h-4 w-4 shrink-0 text-shop-text-soft"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
          >
            <path d="M6 8l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </ListboxButton>
        <ListboxOptions
          anchor="bottom start"
          transition
          className="z-50 min-w-[var(--button-width)] overflow-auto rounded-xl border border-shop-blush-100 bg-white p-1 text-sm shadow-lg outline-none [--anchor-gap:6px] data-closed:scale-95 data-closed:opacity-0"
        >
          {options?.map((opt) => (
            <ListboxOption
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className={OPTION_CLASS}
            >
              {opt.label}
            </ListboxOption>
          ))}
          {groups?.map((group) => (
            <Fragment key={group.label}>
              <div className="px-3 py-1.5 text-xs font-medium text-shop-text-soft">
                {group.label}
              </div>
              {group.options.map((opt) => (
                <ListboxOption
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className={OPTION_CLASS}
                >
                  {opt.label}
                </ListboxOption>
              ))}
            </Fragment>
          ))}
        </ListboxOptions>
      </Listbox>

      {id && (
        <select
          id={id}
          required={required}
          value={value}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-0"
          style={{ pointerEvents: "none" }}
        >
          {flat.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
