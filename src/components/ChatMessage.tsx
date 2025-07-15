import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={cn(
      'flex items-start space-x-3 mb-4',
      isUser ? 'flex-row-reverse space-x-reverse' : ''
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message content */}
      <div className={cn(
        'max-w-[70%] rounded-lg px-4 py-2 shadow-sm',
        isUser 
          ? 'chat-message-user' 
          : 'chat-message-bot'
      )}>
        {/* Step indicator for bot messages */}
        {!isUser && message.isStep && message.stepNumber && (
          <div className="flex items-center mb-2">
            <span className="step-indicator">{message.stepNumber}</span>
            <span className="text-sm font-medium">
              Step {message.stepNumber} of {message.totalSteps}
            </span>
          </div>
        )}
        
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        
        <div className={cn(
          'text-xs mt-2 opacity-70',
          isUser ? 'text-right' : 'text-left'
        )}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;