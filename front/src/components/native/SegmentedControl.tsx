import React from 'react';
import { tapFeedback } from '../../utils/native';

interface SegmentOption<T extends string> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (key: T) => void;
}

function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div role="tablist" className="grid rounded-2xl bg-aurora-navy/5 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((option) => {
        const selected = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => {
              if (selected) return;
              tapFeedback();
              onChange(option.key);
            }}
            className={`min-h-[44px] rounded-xl text-sm font-semibold transition-all duration-200 ${
              selected ? 'bg-white text-aurora-navy shadow-aurora-sm' : 'text-aurora-navy/55 active:bg-white/60'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;