"use client";
// src/context/ApiKeyContext.tsx
/**
 * API KEY CONTEXT
 *
 * Manages user-provided Gemini API key.
 * - Stored in sessionStorage (never persisted permanently)
 * - Provides validation logic
 * - Exposes key status to all components
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { config } from "@/src/config";

interface ApiKeyContextType {
  apiKey: string | null;
  isKeySet: boolean;
  isValidating: boolean;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  validateKey: (key: string) => Promise<boolean>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(config.apiKey.storageKey);
      if (stored) {
        setApiKeyState(stored);
      }
    }
  }, []);

  // Validate API key format
  const validateKey = useCallback(async (key: string): Promise<boolean> => {
    // Basic format validation
    if (!key || key.length < config.apiKey.minLength) {
      return false;
    }

    // Check prefix (only if prefixes are configured)
    if (config.apiKey.prefixes.length > 0) {
      const hasValidPrefix = config.apiKey.prefixes.some((p) =>
        key.startsWith(p)
      );
      if (!hasValidPrefix) {
        return false;
      }
    }

    // Optional: Test the key against Gemini API
    setIsValidating(true);
    try {
      const response = await fetch("/api/validate-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [config.apiKey.headerName]: key,
        },
      });
      return response.ok;
    } catch {
      // If validation endpoint fails, accept the key based on format
      return true;
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Set API key
  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(config.apiKey.storageKey, key);
    }
  }, []);

  // Clear API key
  const clearApiKey = useCallback(() => {
    setApiKeyState(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(config.apiKey.storageKey);
    }
  }, []);

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        isKeySet: !!apiKey,
        isValidating,
        setApiKey,
        clearApiKey,
        validateKey,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKey() {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error("useApiKey must be used within an ApiKeyProvider");
  }
  return context;
}
