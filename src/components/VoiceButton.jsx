'use client'

import React, { useState, useEffect } from 'react';
import { speakText, startListening } from '@/lib/voice';

export default function VoiceButton({ text, mode, onResult }) {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const speechSupported = 'speechSynthesis' in window;
      const recognitionSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      
      if (mode === 'speak' && !speechSupported) setSupported(false);
      if (mode === 'listen' && !recognitionSupported) setSupported(false);
    }
  }, [mode]);

  const handleSpeak = async () => {
    if (!supported) return;
    try {
      if (isPlaying) {
        window.speechSynthesis?.cancel();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        await speakText(text);
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  const handleListen = () => {
    if (!supported) return;
    try {
      setIsListening(true);
      startListening(
        (result) => {
          if (onResult) onResult(result);
          setIsListening(false);
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
        }
      );
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  if (!supported) {
    return (
      <button 
        type="button"
        title={mode === 'speak' ? 'Text to speech not supported' : 'Speech recognition not supported'}
        className="p-2 rounded-full text-gray-300 cursor-not-allowed bg-gray-50"
        disabled
      >
        {mode === 'speak' ? '🔇' : '🎤'}
      </button>
    );
  }

  if (mode === 'speak') {
    return (
      <button
        type="button"
        onClick={handleSpeak}
        title={isPlaying ? "Stop reading" : "Read aloud"}
        className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'}`}
      >
        🔊
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleListen}
      title="Start voice input"
      className={`p-2 rounded-full transition-colors relative flex items-center justify-center ${isListening ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100 text-gray-600'}`}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30"></span>
      )}
      🎤
    </button>
  );
}
