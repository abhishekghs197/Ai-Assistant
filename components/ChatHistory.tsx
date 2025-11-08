import React from 'react';
import { Chat } from '../types';
import { PlusIcon, DeleteIcon, MessageSquareIcon, XIcon } from './IconComponents';

interface ChatHistoryProps {
  chats: Chat[];
  activeChatId: string | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  chats,
  activeChatId,
  isOpen,
  setIsOpen,
  onNewChat,
  onSelectChat,
  onDeleteChat,
}) => {
  return (
    <>
        {/* Overlay for mobile */}
        <div 
            className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
        ></div>

        <aside className={`fixed top-0 left-0 z-40 w-64 bg-gray-800 flex flex-col h-full border-r border-gray-700 transition-transform duration-300 ease-in-out 
            md:relative md:translate-x-0 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between p-2 border-b border-gray-700">
              <h2 className="text-lg font-semibold px-2">Chats</h2>
              <button onClick={() => setIsOpen(false)} className="md:hidden p-2 rounded-md hover:bg-gray-700">
                  <XIcon className="w-6 h-6"/>
              </button>
          </div>
          <div className="p-2">
            <button
                onClick={onNewChat}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors"
            >
                <PlusIcon className="w-5 h-5" />
                New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2">
            <nav className="flex flex-col gap-1">
            {chats.map(chat => (
                <div
                key={chat.id}
                className={`group flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                    activeChatId === chat.id
                    ? 'bg-gray-700'
                    : 'hover:bg-gray-700/50'
                }`}
                onClick={() => onSelectChat(chat.id)}
                >
                <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquareIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                    {chat.title}
                    </span>
                </div>
                <button
                    onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0 ml-2"
                >
                    <DeleteIcon className="w-5 h-5" />
                </button>
                </div>
            ))}
            </nav>
          </div>
        </aside>
    </>
  );
};

export default ChatHistory;
