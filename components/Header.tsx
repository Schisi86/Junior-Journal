import React from 'react';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-kids-blue/20">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-kids-yellow rounded-full flex items-center justify-center text-2xl animate-bounce">
            🌞
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-kids-purple">
            Junior Journal
          </h1>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`
            bg-kids-green text-white font-heading font-bold py-2 px-6 rounded-full 
            transform transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking...
            </>
          ) : (
            <>
              Refresh News 🔄
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;