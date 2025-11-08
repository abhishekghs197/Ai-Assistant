import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { SendIcon, MicrophoneIcon, StopIcon, PaperclipIcon, XIcon, FileIcon } from './IconComponents';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isLoading: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);
  
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = await fileToBase64(selectedFile);
      setFilePreview(previewUrl);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || file) && !isLoading) {
      onSendMessage(text.trim(), file ?? undefined);
      setText('');
      removeFile();
      if(isListening) stopListening();
    }
  };

  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as any);
    }
  };


  return (
    <div>
        {filePreview && (
            <div className="relative inline-block bg-gray-700 p-2 rounded-lg mb-2">
                {file?.type.startsWith('image/') ? (
                    <img src={filePreview} alt="Preview" className="max-h-24 rounded-md" />
                ) : (
                    <div className="flex items-center gap-2 p-2 text-white">
                        <FileIcon className="w-8 h-8"/>
                        <span className="text-sm truncate max-w-xs">{file?.name}</span>
                    </div>
                )}
                <button onClick={removeFile} className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-0.5 text-white hover:bg-gray-600">
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-800 p-2 rounded-xl">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 rounded-full hover:bg-gray-700 text-gray-400 transition-colors"
                aria-label="Attach file"
            >
                <PaperclipIcon className="w-5 h-5"/>
            </button>
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message or use the microphone..."
                className="w-full bg-transparent p-2 text-gray-200 resize-none focus:outline-none max-h-40"
                rows={1}
                disabled={isLoading}
            />
            <button
                type="button"
                onClick={handleVoiceClick}
                disabled={isLoading}
                className={`p-2 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-700 text-gray-400'
                }`}
            >
                {isListening ? <StopIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
            </button>
            <button
                type="submit"
                disabled={isLoading || (!text.trim() && !file)}
                className="p-2 rounded-full bg-indigo-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </form>
    </div>
  );
};

export default ChatInput;