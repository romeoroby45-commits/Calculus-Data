import React from 'react';
import { COUNTRIES, CountryInfo } from '../../utils/whatsapp';

interface CountrySelectProps {
  selectedDialCode: string;
  onSelect: (country: CountryInfo) => void;
  className?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  selectedDialCode,
  onSelect,
  className = '',
}) => {
  const current = COUNTRIES.find((c) => c.dialCode === selectedDialCode) || COUNTRIES[0];

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={current.dialCode}
        onChange={(e) => {
          const found = COUNTRIES.find((c) => c.dialCode === e.target.value);
          if (found) onSelect(found);
        }}
        className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg px-2.5 py-2 pr-8 pl-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
        dir="ltr"
      >
        {COUNTRIES.map((c) => (
          <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
            {c.flag} {c.dialCode} ({c.name})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
