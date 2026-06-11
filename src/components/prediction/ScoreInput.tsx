import { useCallback, useRef } from "react";

interface ScoreInputProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function ScoreInput({
  value,
  onChange,
  disabled = false,
}: ScoreInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      if (raw === "") return;
      const num = Math.min(Number(raw.slice(-1)), 9);
      onChange(num);
    },
    [onChange]
  );

  const handleFocus = useCallback(() => {
    inputRef.current?.select();
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={value !== null ? value : ""}
      onChange={handleChange}
      onFocus={handleFocus}
      disabled={disabled}
      placeholder="–"
      className="w-9 h-9 text-center font-mono text-lg font-bold
        bg-white border border-border rounded-lg
        text-text-primary placeholder:text-text-muted
        focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-shadow"
    />
  );
}
