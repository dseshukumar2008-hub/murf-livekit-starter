'use client';

import { type ComponentProps } from 'react';
import { AnimatePresence } from 'motion/react';
import { type AgentState, type ReceivedMessage } from '@livekit/components-react';
import { AgentChatIndicator } from '@/components/agents-ui/agent-chat-indicator';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';

/**
 * Props for the AgentChatTranscript component.
 */
export interface AgentChatTranscriptProps extends ComponentProps<'div'> {
  /**
   * The current state of the agent. When 'thinking', displays a loading indicator.
   */
  agentState?: AgentState;
  /**
   * Array of messages to display in the transcript.
   * @defaultValue []
   */
  messages?: ReceivedMessage[];
  /**
   * Additional CSS class names to apply to the conversation container.
   */
  className?: string;
}

/**
 * A chat transcript component that displays a conversation between the user and agent.
 * Shows messages with timestamps and origin indicators, plus a thinking indicator
 * when the agent is processing.
 *
 * @extends ComponentProps<'div'>
 *
 * @example
 * ```tsx
 * <AgentChatTranscript
 *   agentState={agentState}
 *   messages={chatMessages}
 * />
 * ```
 */
export function AgentChatTranscript({
  agentState,
  messages = [],
  className,
  ...props
}: AgentChatTranscriptProps) {
  return (
    <Conversation className={className} {...props}>
      <ConversationContent className="flex flex-col gap-2">
        {messages.map((receivedMessage) => {
          const { id, from, message, timestamp } = receivedMessage;
          const isUser = from?.isLocal;
          const messageOrigin = isUser ? 'user' : 'assistant';
          const timeString = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div key={id} className={`flex gap-3 px-4 py-2.5 rounded-lg border ${isUser ? 'bg-white border-transparent' : 'bg-[#F1FBF7] border-[#E8F8F2]/50'}`}>
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {isUser ? (
                  <div className="w-[30px] h-[30px] rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#7185A0]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                ) : (
                  <div className="w-[30px] h-[30px] rounded-full bg-[#008F6B] flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 9.53a11 11 0 0 0-2.29 2.77"/><path d="M12 5l2.96 4.53a11 11 0 0 1 2.29 2.77"/></svg>
                  </div>
                )}
              </div>
              
              {/* Message Content */}
              <div className="flex flex-col w-full min-w-0">
                <div className="flex items-center justify-between w-full mb-0.5">
                  <div className={`font-semibold text-[15px] leading-none ${isUser ? 'text-[#142A44]' : 'text-[#008F6B]'}`}>
                    {isUser 
                      ? 'You' 
                      : (messages.findIndex(m => !m.from?.isLocal && m.message.includes("I'll connect you with our care specialist")) !== -1 && 
                         messages.findIndex(m => !m.from?.isLocal && m.message.includes("I'll connect you with our care specialist")) < messages.indexOf(receivedMessage))
                        ? 'Care Specialist'
                        : 'Saathi'}
                  </div>
                  <div className="text-[12px] text-[#7185A0] font-medium">
                    {timeString}
                  </div>
                </div>
                <div className="text-[15px] text-[#142A44] leading-relaxed font-normal pr-1">
                  {message}
                </div>
              </div>
            </div>
          );
        })}
        <AnimatePresence>
          {agentState === 'thinking' && <AgentChatIndicator size="sm" />}
        </AnimatePresence>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
