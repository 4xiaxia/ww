import React, { useState } from 'react';

interface TextInputProps {
  onSend: (text: string) => void;
  onClose: () => void;
}

const TextInput: React.FC<TextInputProps> = ({ onSend, onClose }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end animate-fade-in">
      <div className="w-full bg-white rounded-t-3xl p-4 shadow-2xl animate-slide-up-fast">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition"
          >
            <i className="fas fa-times"></i>
          </button>
          <span className="font-bold text-gray-700 flex-1">文字输入</span>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入您的问题..."
            autoFocus
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-red-400 focus:outline-none text-base"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold transition ${
              text.trim()
                ? 'bg-red-500 active:scale-95'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TextInput;
