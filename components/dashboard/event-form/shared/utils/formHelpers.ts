export const handleDateInputClick = (
  inputRef: React.RefObject<HTMLInputElement | null>
): void => {
  if (inputRef.current) {
    inputRef.current.showPicker();
  }
};

export const formatNumberInput = (value: string): string => {
  return /^\d*\.?\d*$/.test(value) ? value : "";
};

export const parseNumberValue = (value: string): number | undefined => {
  return value ? Number(value) : undefined;
};