import { ReactElement } from "react";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  rows?: number;
}

export default function TextEditor({
  value,
  onChange,
  label,
  placeholder = "Enter text...",
  rows = 4,
}: TextEditorProps): ReactElement {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {value.length} characters
      </p>
    </div>
  );
}
