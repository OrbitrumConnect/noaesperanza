import { useState, useCallback, useRef } from 'react';

interface VoiceChatProps {
  onTranscription: (text: string) => void;
  onAudioResponse: (audioUrl: string) => void;
}

export const useVoiceChat = ({ onTranscription, onAudioResponse }: VoiceChatProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎙️ Iniciando gravação...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🛑 Gravação parada, processando áudio...');
        setIsProcessing(true);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64 for sending
        const reader = new FileReader();
        reader.onload = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          processAudio(base64Audio);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250); // Capture in 250ms chunks
      setIsRecording(true);
      console.log('✅ Gravação iniciada com sucesso');
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('🛑 Parando gravação...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processAudio = async (audioBase64: string) => {
    try {
      console.log('🔄 Enviando áudio para processamento...');
      
      // Simulated transcription (replace with actual speech-to-text service)
      setTimeout(() => {
        const mockTranscription = "Como posso melhorar minha energia durante o dia?";
        console.log('📝 Transcrição recebida:', mockTranscription);
        onTranscription(mockTranscription);
        setIsProcessing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      setIsProcessing(false);
    }
  };

  const speakText = useCallback(async (text: string) => {
    try {
      console.log('🔊 Convertendo texto para fala com ElevenLabs:', text);
      
      // Import supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://jpgmzygxmsiscrmpskgf.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZ216eWd4bXNpc2NybXBza2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0ODA3NDcsImV4cCI6MjA1MDA1Njc0N30.Ll_zL6BNEHgrcVLt3mIZF_lJlFJhEI_8R4Hw_YtMuR8'
      );

      // Call ElevenLabs edge function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voiceId: 'Alice', // Using Alice voice for the AI
          modelId: 'eleven_multilingual_v2'
        }
      });

      if (error) {
        console.error('Erro na API ElevenLabs:', error);
        throw new Error('Falha na síntese de voz');
      }

      if (data?.audioContent) {
        // Convert base64 to audio and play
        const audioBlob = new Blob([
          new Uint8Array(atob(data.audioContent).split('').map(c => c.charCodeAt(0)))
        ], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onplay = () => console.log('🔊 Iniciando fala ElevenLabs...');
        audio.onended = () => {
          console.log('✅ Fala ElevenLabs concluída');
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
        onAudioResponse(audioUrl);
      }
      
    } catch (error) {
      console.error('Erro ElevenLabs, usando fallback:', error);
      
      // Fallback to browser speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      const voices = speechSynthesis.getVoices();
      const ptBrVoice = voices.find(voice => voice.lang.includes('pt-BR') || voice.lang.includes('pt'));
      if (ptBrVoice) {
        utterance.voice = ptBrVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    speakText
  };
};