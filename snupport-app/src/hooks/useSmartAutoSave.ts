import { useRef, useCallback, useState, useEffect } from "react";

interface UseSmartAutoSaveOptions {
  onSave: () => void | Promise<void>;
  saveInterval?: number; // in ms, default 500ms
  inactivityDelay?: number; // in ms, default 500ms
  autoStart?: boolean;
}

interface UseSmartAutoSaveReturn {
  isActive: boolean;
  startAutoSave: () => void;
  stopAutoSave: () => void;
  triggerUserAction: () => void;
  saveNow: () => void;
}

export const useSmartAutoSave = ({ onSave, saveInterval = 500, inactivityDelay = 500, autoStart = false }: UseSmartAutoSaveOptions): UseSmartAutoSaveReturn => {
  const [isActive, setIsActive] = useState(autoStart);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveCallbackRef = useRef(onSave);
  saveCallbackRef.current = onSave;

  const clearAllTimers = useCallback(() => {
    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const startSaveTimer = useCallback(() => {
    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current);
    }

    saveTimerRef.current = setInterval(() => {
      saveCallbackRef.current();
    }, saveInterval);
  }, [saveInterval]);

  const startInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      setIsActive(false);
      clearAllTimers();
    }, inactivityDelay);
  }, [inactivityDelay, clearAllTimers]);

  const startAutoSave = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
      startSaveTimer();
      startInactivityTimer();
    }
  }, [isActive, startSaveTimer, startInactivityTimer]);

  const stopAutoSave = useCallback(() => {
    setIsActive(false);
    clearAllTimers();
  }, [clearAllTimers]);

  const triggerUserAction = useCallback(() => {
    if (isActive) {
      startInactivityTimer();
    } else {
      startAutoSave();
    }
  }, [isActive, startInactivityTimer, startAutoSave]);

  const saveNow = useCallback(() => {
    saveCallbackRef.current();
  }, []);

  useEffect(() => {
    if (autoStart && !isActive) {
      startAutoSave();
    }
  }, [autoStart, isActive, startAutoSave]);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  useEffect(() => {
    if (isActive) {
      startSaveTimer();
      startInactivityTimer();
    } else {
      clearAllTimers();
    }
  }, [isActive, startSaveTimer, startInactivityTimer, clearAllTimers]);

  return {
    isActive,
    startAutoSave,
    stopAutoSave,
    triggerUserAction,
    saveNow,
  };
};
