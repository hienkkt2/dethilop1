import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Converts Vietnamese Grade 1 math symbols, blanks, comparison operators,
 * and slash-separated prompts into natural spoken Vietnamese text.
 */
export function formatVietnameseSpeechText(rawText: string): string {
  let text = rawText;

  // 1. Remove parenthetical "(?)" after "dấu chấm hỏi (?)"
  text = text.replace(/\(\s*\?\s*\)/g, ' ');

  // 2. Normalize blank placeholders before math operators
  text = text.replace(/\[\s*\?\s*\]/g, ' ô trống ');
  text = text.replace(/_{2,}/g, ' ô trống ');
  text = text.replace(/\.{3,}/g, ' chỗ trống ');

  // 3. Replace " = ?" at the end of arithmetic expressions -> " bằng bao nhiêu?"
  text = text.replace(/=\s*\?/g, ' bằng bao nhiêu?');

  // 4. Replace arithmetic minus (- / −) between operands (supports chained expressions via lookahead)
  text = text.replace(
    /(\d+|ô trống|chỗ trống)\s*[-−]\s*(?=(?:\d+|ô trống|chỗ trống|\?))/gi,
    '$1 trừ ',
  );

  // 5. Replace addition (+) and multiplication (×)
  text = text.replace(/\s*\+\s*/g, ' cộng ');
  text = text.replace(/(\d+|ô trống|chỗ trống)\s*[×x]\s*(?=\d+|ô trống|chỗ trống)/gi, '$1 nhân ');

  // 6. Replace comparison and equality operators (>, <, =)
  text = text.replace(/\s*>\s*/g, ' lớn hơn ');
  text = text.replace(/\s*<\s*/g, ' bé hơn ');
  text = text.replace(/\s*=\s*/g, ' bằng ');

  // 7. Replace em-dash and spaced slashes for natural pauses
  text = text.replace(/\s*—\s*/g, ', ');
  text = text.replace(/\s+\/\s+/g, ', ');
  // Handle tightly joined letter pairs like c/k, g/gh, r/d/gi (apply twice for 3-way slashes)
  text = text.replace(/([a-zA-ZÀ-ỹ]+)\/([a-zA-ZÀ-ỹ]+)/g, '$1, $2');
  text = text.replace(/([a-zA-ZÀ-ỹ]+)\/([a-zA-ZÀ-ỹ]+)/g, '$1, $2');

  // 8. Clean up duplicate spaces & punctuation spacing
  text = text
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

export function useSpeechSynthesis() {
  const [supported] = useState<boolean>(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [rate, setRate] = useState<number>(0.9);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setActiveKey(null);
  }, [supported]);

  const speak = useCallback(
    (text: string, key: string = 'default', lang: 'vi-VN' | 'en-US' = 'vi-VN') => {
      if (!supported) return;

      // Toggle off if clicking the currently active speaker button
      if (isSpeaking && activeKey === key) {
        stop();
        return;
      }

      window.speechSynthesis.cancel();

      const cleaned = formatVietnameseSpeechText(text);

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = 1.02;

      const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
      const targetPrefix = lang.slice(0, 2).toLowerCase();
      const matchedVoice =
        voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setActiveKey(key);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        setActiveKey(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        setActiveKey(null);
      };

      setIsSpeaking(true);
      setActiveKey(key);
      window.speechSynthesis.speak(utterance);
    },
    [supported, isSpeaking, activeKey, rate, stop],
  );

  return {
    supported,
    isSpeaking,
    activeKey,
    rate,
    setRate,
    speak,
    stop,
  };
}
