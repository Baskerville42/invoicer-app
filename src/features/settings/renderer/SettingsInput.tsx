import React from 'react';

interface SettingsInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

export const SettingsInput: React.FC<SettingsInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = ' ',
  type = 'text',
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider pl-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          className="input input-floating w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};
