import React from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface VoiceControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onToggleVoice: () => void;
  voiceEnabled: boolean;
}

export default function VoiceControls({
  isRecording,
  isProcessing,
  onStartRecording,
  onStopRecording,
  onToggleVoice,
  voiceEnabled
}: VoiceControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Voice Response Toggle */}
      <Button
        variant={voiceEnabled ? "default" : "outline"}
        size="sm"
        onClick={onToggleVoice}
        className="px-3"
      >
        <Volume2 className={`w-4 h-4 ${voiceEnabled ? 'text-white' : 'text-muted-foreground'}`} />
      </Button>

      {/* Voice Recording Button */}
      <Button
        variant={isRecording ? "destructive" : "secondary"}
        size="sm"
        onClick={isRecording ? onStopRecording : onStartRecording}
        disabled={isProcessing}
        className="px-3 relative"
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isRecording ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <MicOff className="w-4 h-4" />
          </motion.div>
        ) : (
          <Mic className="w-4 h-4" />
        )}
        
        {isRecording && (
          <motion.div
            className="absolute -inset-1 bg-red-500/30 rounded-md"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </Button>

      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="font-medium">Gravando...</span>
        </div>
      )}
      
      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="font-medium">Processando...</span>
        </div>
      )}
    </div>
  );
}