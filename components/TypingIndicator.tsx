
import React from 'react';
import { AiIcon } from './IconComponents';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-4 my-6">
       <div className="w-8 h-8 flex-shrink-0 bg-indigo-600 rounded-full flex items-center justify-center">
          <AiIcon className="w-5 h-5 text-white" />
        </div>
      <div className="bg-gray-700 rounded-lg px-4 py-3 rounded-bl-none">
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
