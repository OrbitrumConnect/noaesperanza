import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  title?: string;
  children?: React.ReactNode;
  variant?: 'help' | 'info';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export default function InfoTooltip({ 
  content, 
  title, 
  children, 
  variant = 'help',
  side = 'top' 
}: InfoTooltipProps) {
  const Icon = variant === 'help' ? HelpCircle : Info;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <button className="inline-flex items-center justify-center">
              <Icon className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {title && (
            <div className="font-semibold text-sm mb-1">{title}</div>
          )}
          <p className="text-xs leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}