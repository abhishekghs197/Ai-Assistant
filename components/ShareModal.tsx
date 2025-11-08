import React, { useState, useEffect } from 'react';
import { Chat } from '../types';
import { XIcon, CopyIcon, CheckIcon } from './IconComponents';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, chat }) => {
  const [shareableText, setShareableText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (chat) {
      const text = `Chat: ${chat.title}\n\n${chat.messages
        .map(msg => `${msg.sender === 'user' ? 'You' : 'AI'}: ${msg.text}`)
        .join('\n\n')}`;
      setShareableText(text);
    }
  }, [chat]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300"
        onClick={onClose}
    >
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg relative transition-transform duration-300 scale-95"
           onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Share Chat</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700">
            <XIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-400 mb-2">
            Copy the conversation below to share it.
          </p>
          <div className="bg-gray-900 rounded-md p-3 max-h-60 overflow-y-auto border border-gray-700">
            <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans">
                {shareableText}
            </pre>
          </div>
        </div>
        <div className="flex justify-end p-4 bg-gray-800/50 border-t border-gray-700 rounded-b-lg">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
          >
            {isCopied ? <CheckIcon className="w-5 h-5" /> : <CopyIcon className="w-5 h-5" />}
            {isCopied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
