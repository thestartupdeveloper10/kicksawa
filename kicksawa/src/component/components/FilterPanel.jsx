import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { filterLabel } from '@/lib/products';

/** One collapsible facet. Open by default — a filter nobody can see is a
 *  filter nobody uses, and these lists are short. */
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line py-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-[0.9375rem] font-semibold">{title}</span>
        <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <Plus
            className={cn(
              'absolute h-4 w-4 transition-[opacity,transform] duration-[280ms] ease-swift',
              open ? 'rotate-90 scale-[0.25] opacity-0' : 'rotate-0 scale-100 opacity-100'
            )}
            strokeWidth={2}
          />
          <Minus
            className={cn(
              'absolute h-4 w-4 transition-[opacity,transform] duration-[280ms] ease-swift',
              open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-[0.25] opacity-0'
            )}
            strokeWidth={2}
          />
        </span>
      </button>

      {open && <div className="pt-4">{children}</div>}
    </div>
  );
};

/** Custom control: the native checkbox cannot be styled to match the type. */
const CheckRow = ({ checked, onChange, label, count }) => (
  <label className="group flex cursor-pointer items-center gap-3 py-1.5">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="peer sr-only"
    />
    <span
      aria-hidden="true"
      className={cn(
        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border',
        'transition-[background-color,border-color] duration-fast ease-swift',
        'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
        checked
          ? 'border-foreground bg-foreground'
          : 'border-line-strong group-hover:border-foreground'
      )}
    >
      <Check
        className={cn(
          'h-3 w-3 text-background transition-opacity duration-fast',
          checked ? 'opacity-100' : 'opacity-0'
        )}
        strokeWidth={3}
      />
    </span>
    <span className="flex-1 text-sm capitalize">{label}</span>
    {typeof count === 'number' && (
      <span className="tnum text-xs text-subtle-foreground">{count}</span>
    )}
  </label>
);

const ColorSwatches = ({ options, selected, onToggle }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((option) => {
      const isSelected = selected.includes(option.value);
      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onToggle(option.value)}
          aria-pressed={isSelected}
          aria-label={`Colour ${option.value}`}
          title={`${option.value} (${option.count})`}
          className={cn(
            // 40px hit area from padding, with a smaller visible swatch inside.
            'flex h-10 w-10 items-center justify-center rounded-full p-1',
            'transition-[background-color,transform] duration-fast ease-swift active:scale-[0.96]',
            isSelected ? 'bg-foreground/10' : 'hover:bg-surface'
          )}
        >
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full',
              // Ring instead of border so the swatch colour stays exact.
              isSelected ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'ring-1 ring-foreground/15'
            )}
            style={{ backgroundColor: option.value }}
          >
            {isSelected && (
              <Check
                className="h-3.5 w-3.5 mix-blend-difference text-white"
                strokeWidth={3}
              />
            )}
          </span>
        </button>
      );
    })}
  </div>
);

/**
 * The facet rail. Renders only the facets a page asks for, and only when the
 * underlying data actually has options for them.
 */
const FilterPanel = ({ facets, active, onToggle, show = ['brands', 'categories', 'prices', 'colors'] }) => {
  const sections = [
    { key: 'brands', title: 'Brand' },
    { key: 'categories', title: 'Category' },
    { key: 'prices', title: 'Price' },
    { key: 'colors', title: 'Colour' },
  ].filter((section) => show.includes(section.key) && facets[section.key]?.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="border-t border-line">
      {sections.map((section) => (
        <FilterSection key={section.key} title={section.title}>
          {section.key === 'colors' ? (
            <ColorSwatches
              options={facets.colors}
              selected={active.colors}
              onToggle={(value) => onToggle('colors', value)}
            />
          ) : (
            <div className="max-h-72 overflow-y-auto pr-1">
              {facets[section.key].map((option) => (
                <CheckRow
                  key={option.value}
                  checked={active[section.key].includes(option.value)}
                  onChange={() => onToggle(section.key, option.value)}
                  label={option.label ?? filterLabel(section.key, option.value)}
                  count={option.count}
                />
              ))}
            </div>
          )}
        </FilterSection>
      ))}
    </div>
  );
};

export default FilterPanel;
