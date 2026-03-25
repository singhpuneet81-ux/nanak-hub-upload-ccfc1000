/**
 * useInlineValidation
 * Returns a helper that validates a value immediately and stores errors in state.
 * Usage: const { errors, validate, setError, clearError } = useInlineValidation();
 */
import { useState, useCallback } from "react";

export type ValidatorFn = (value: string) => string | null;

export function useInlineValidation() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Validate a single field and update errors immediately */
  const validate = useCallback(
    (field: string, value: string, validator: ValidatorFn) => {
      const error = validator(value);
      setErrors((prev) => {
        if (!error) {
          const next = { ...prev };
          delete next[field];
          return next;
        }
        return { ...prev, [field]: error };
      });
    },
    []
  );

  const setError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setErrors({}), []);

  /** Merge in bulk errors (e.g. from a submit-time full validate pass) */
  const mergeErrors = useCallback((bulk: Record<string, string>) => {
    setErrors((prev) => ({ ...prev, ...bulk }));
  }, []);

  return { errors, validate, setError, clearError, clearAll, mergeErrors };
}
