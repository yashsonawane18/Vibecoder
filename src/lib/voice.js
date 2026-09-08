export const startListening = (onResult, onError) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError('Speech recognition not supported in this browser');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError(event.error);
  };

  try {
    recognition.start();
  } catch (e) {
    onError('Failed to start speech recognition');
  }

  return recognition;
};

export const speakText = (text) => {
  if (!window.speechSynthesis) {
    return null;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.lang = 'en-US';

  window.speechSynthesis.speak(utterance);

  return utterance;
};

export const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export const isRecognitionSupported = () => {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export const isSynthesisSupported = () => {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
};
