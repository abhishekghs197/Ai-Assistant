import React, { useState } from 'react';
import { Message, MessageSender } from '../types';
import { AiIcon, UserIcon, CopyIcon, CheckIcon, SpeakerWaveIcon, StopCircleIcon, FileIcon } from './IconComponents';
import TypingIndicator from './TypingIndicator';

interface ChatMessageProps {
  message: Message;
  onSpeak: (message: Message) => void;
  isSpeaking: boolean;
  speakingMessageId: string | null;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSpeak, isSpeaking, speakingMessageId }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.sender === MessageSender.USER;

  if (message.sender === MessageSender.AI && message.text.trim() === '' && !message.file) {
    return <TypingIndicator />;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const Icon = isUser ? UserIcon : AiIcon;
  const isCurrentlySpeaking = isSpeaking && speakingMessageId === message.id;

  const FileDisplay = message.file ? (
      <div className="mt-2">
        {message.file.type.startsWith('image/') ? (
          <img src={message.file.data} alt={message.file.name} className="max-w-xs rounded-lg border border-gray-600" />
        ) : (
          <a
            href={message.file.data}
            download={message.file.name}
            className="flex items-center gap-2 p-2 bg-gray-600 rounded-md hover:bg-gray-500 transition-colors"
          >
            <FileIcon className="w-6 h-6 flex-shrink-0" />
            <span className="text-sm truncate">{message.file.name}</span>
          </a>
        )}
      </div>
    ) : null;


  return (
    <div className={`flex items-start gap-4 my-6 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 flex-shrink-0 bg-indigo-600 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={`flex flex-col max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`group relative rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-700 text-gray-200 rounded-bl-none'
          }`}
        >
          {FileDisplay}
          {message.text && <p className={`text-sm whitespace-pre-wrap ${message.file ? 'mt-2' : ''}`}>{message.text}</p>}
          {!isUser && message.text && (
            <div className="absolute -top-3 -right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onSpeak(message)}
                className="p-1.5 bg-gray-600 rounded-full text-gray-300 hover:bg-gray-500"
                aria-label={isCurrentlySpeaking ? "Stop speaking" : "Speak message"}
                >
                {isCurrentlySpeaking ? <StopCircleIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 bg-gray-600 rounded-full text-gray-300 hover:bg-gray-500"
                aria-label="Copy message"
                >
                {isCopied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-500 mt-1.5">{message.timestamp}</span>
      </div>
      {isUser && (
        <div className="w-8 h-8 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;