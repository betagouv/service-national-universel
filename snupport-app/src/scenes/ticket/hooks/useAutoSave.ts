import { useEffect, useRef, useState } from "react";

type EqualityFn<T> = (a: T, b: T) => boolean;

export type UseAutoSaveOptions<T> = {
  readonly delayMs?: number;
  readonly isEnabled?: boolean;
  readonly isEqual?: EqualityFn<T>;
};

const defaultIsEqual = <T>(a: T, b: T) => a === b;

/**
 * Debounced autosave hook. Calls onSave(value) after delay when value changes.
 */
export function useAutoSave<T>(value: T, onSave: (value: T) => void | Promise<void>, options?: UseAutoSaveOptions<T>): boolean {
  const { delayMs = 500, isEnabled = true, isEqual = defaultIsEqual } = options ?? {};

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedValueRef = useRef<T | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEnabled) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    // Initialize lastSavedValueRef with the initial value
    if (lastSavedValueRef.current === undefined) {
      lastSavedValueRef.current = value;
    }

    if (lastSavedValueRef.current !== undefined && isEqual(lastSavedValueRef.current, value)) {
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      await onSave(value);
      lastSavedValueRef.current = value;
      setIsSaving(false);
    }, delayMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delayMs, isEnabled, isEqual, onSave]);

  return isSaving;
}

export default useAutoSave;
