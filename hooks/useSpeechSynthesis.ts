import { useState, useEffect, useCallback } from 'react';

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
}

export const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech Synthesis API not supported.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
        // The 'interrupted' error is expected when we cancel speech to start a new one.
        // We can safely ignore it and only log other, unexpected errors.
        if (e.error !== 'interrupted') {
          console.error('Speech synthesis error:', e.error);
        }
        setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, cancel, isSpeaking };
};