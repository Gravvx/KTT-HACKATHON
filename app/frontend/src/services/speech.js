// app/frontend/src/services/speech.js
// Fail-proof Web Speech API (STT & TTS) with MediaRecorder fallback and Hindi/English voice synthesis

const langLocaleMap = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
};

class SpeechService {
  constructor() {
    this.recognition = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.activeStream = null;
    this.isListening = false;
    this.availableVoices = [];
    this.initVoices();
  }

  initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const populate = () => {
      this.availableVoices = window.speechSynthesis.getVoices() || [];
    };

    populate();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populate;
    }
  }

  async getVoices() {
    if (this.availableVoices.length > 0) return this.availableVoices;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];

    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.availableVoices = voices;
        return resolve(voices);
      }

      const handler = () => {
        this.availableVoices = window.speechSynthesis.getVoices();
        resolve(this.availableVoices);
      };

      window.speechSynthesis.onvoiceschanged = handler;
      setTimeout(() => {
        this.availableVoices = window.speechSynthesis.getVoices();
        resolve(this.availableVoices);
      }, 500);
    });
  }

  isSpeechRecognitionSupported() {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  isSpeechSynthesisSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  isMediaRecorderSupported() {
    return typeof window !== 'undefined' && navigator.mediaDevices && !!window.MediaRecorder;
  }

  // Pre-authorizes microphone hardware via getUserMedia
  async requestMicPermission() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone recording is not supported in this browser.');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  }

  // Voice to Text (Speech Recognition with graceful fallback)
  async startListening(lang = 'en', onInterimResult = null) {
    this.stopListening();

    // 1. First ensure real browser hardware microphone permission is active
    let micStream = null;
    try {
      micStream = await this.requestMicPermission();
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone blocked. Click the lock/tune icon in your browser address bar and set Microphone to "Allow".');
      }
      throw new Error(`Microphone hardware error: ${err.message}`);
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Release mic stream if speech recognition is unsupported
      micStream.getTracks().forEach((t) => t.stop());
      throw new Error('Speech recognition web service not available in this browser. Try Google Chrome or Edge.');
    }

    return new Promise((resolve, reject) => {
      const recognition = new SpeechRecognition();
      this.recognition = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      const locale = langLocaleMap[lang] || lang || 'en-IN';
      recognition.lang = locale;

      let finalTranscript = '';
      let hasEnded = false;

      this.isListening = true;

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }
        if (onInterimResult && interim) {
          onInterimResult(interim);
        }
      };

      recognition.onerror = (event) => {
        this.isListening = false;
        if (micStream) micStream.getTracks().forEach((t) => t.stop());
        if (hasEnded) return;
        hasEnded = true;

        if (event.error === 'no-speech') {
          if (finalTranscript.trim()) {
            return resolve(finalTranscript.trim());
          }
          return reject(new Error('No speech was detected. Please speak closer to the microphone.'));
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          return reject(
            new Error(
              'Browser speech recognition service is blocked. Tip: Chrome or Edge on localhost requires allowing microphone access in site settings.'
            )
          );
        }

        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.onend = () => {
        this.isListening = false;
        if (micStream) micStream.getTracks().forEach((t) => t.stop());
        if (hasEnded) return;
        hasEnded = true;

        if (finalTranscript.trim()) {
          resolve(finalTranscript.trim());
        } else {
          reject(new Error('No words detected. Tap microphone and try speaking again.'));
        }
      };

      try {
        recognition.start();
      } catch (err) {
        this.isListening = false;
        if (micStream) micStream.getTracks().forEach((t) => t.stop());
        reject(err);
      }
    });
  }

  // Audio Recording (MediaRecorder) for direct Gemini audio transcription fallback
  async startAudioRecording() {
    this.audioChunks = [];
    const stream = await this.requestMicPermission();
    this.activeStream = stream;

    const mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
    this.isListening = true;
  }

  stopAudioRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        this.isListening = false;
        return resolve(null);
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.isListening = false;
        if (this.activeStream) {
          this.activeStream.getTracks().forEach((t) => t.stop());
          this.activeStream = null;
        }

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          resolve({
            base64: base64data,
            mimeType: 'audio/webm',
            blob: audioBlob,
          });
        };
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.isListening = false;
        resolve(null);
      }
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((t) => t.stop());
      this.activeStream = null;
    }
    this.isListening = false;
  }

  // Text to Speech (Speech Synthesis) with verified Hindi & English voice matching
  async speak(text, lang = 'en') {
    if (!this.isSpeechSynthesisSupported()) {
      throw new Error('Speech synthesis is not supported in this browser.');
    }

    if (!text || !text.trim()) return;

    // Clean markdown asterisks and bullets for smooth spoken audio
    const cleanText = text
      .replace(/[*#_~`>]/g, '')
      .replace(/•/g, ', ')
      .replace(/\n+/g, '. ')
      .trim();

    window.speechSynthesis.cancel();

    const voices = await this.getVoices();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLocale = langLocaleMap[lang] || lang || 'en-IN';
    utterance.lang = targetLocale;

    // Smart voice matching (Hindi / English / Regional)
    if (lang === 'hi' || targetLocale.startsWith('hi')) {
      const hindiVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('swara') ||
          v.name.toLowerCase().includes('hemant') ||
          v.name.toLowerCase().includes('madhur') ||
          v.name.toLowerCase().includes('kalpana')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      utterance.rate = 0.9;
    } else {
      const engVoice = voices.find(
        (v) =>
          (v.lang.toLowerCase().startsWith('en') && v.name.toLowerCase().includes('india')) ||
          v.name.toLowerCase().includes('swara') ||
          v.lang === 'en-IN' ||
          v.lang === 'en-US'
      );
      if (engVoice) {
        utterance.voice = engVoice;
      }
      utterance.rate = 0.95;
    }

    return new Promise((resolve) => {
      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis playback event:', e);
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });
  }
}

const speechService = new SpeechService();
export default speechService;
