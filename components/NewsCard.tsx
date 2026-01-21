import React, { useState } from 'react';
import { NewsStory } from '../types';
import { generateSpeech, playAudioBuffer } from '../services/geminiService';

interface NewsCardProps {
  story: NewsStory;
  index: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ story, index }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentSource, setCurrentSource] = useState<AudioBufferSourceNode | null>(null);

  const colors = [
    'border-kids-pink bg-pink-50',
    'border-kids-blue bg-cyan-50',
    'border-kids-purple bg-purple-50'
  ];
  
  const accentColor = colors[index % colors.length];

  const handleReadAloud = async () => {
    if (isPlaying && currentSource) {
      currentSource.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsBuffering(true);
      const textToRead = `${story.headline}. ${story.summary}. Fun fact: ${story.funFact}`;
      const audioBuffer = await generateSpeech(textToRead);
      
      const source = playAudioBuffer(audioBuffer);
      setCurrentSource(source);
      setIsPlaying(true);
      setIsBuffering(false);

      source.onended = () => {
        setIsPlaying(false);
        setCurrentSource(null);
      };
    } catch (err) {
      console.error("Failed to play audio", err);
      setIsBuffering(false);
      setIsPlaying(false);
      alert("Oops! Could not read the story right now.");
    }
  };

  return (
    <div className={`
      relative overflow-hidden rounded-3xl border-4 ${accentColor} 
      shadow-[0_8px_0_0_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-1 duration-300
      flex flex-col h-full
    `}>
      {/* Category Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-gray-100">
          {story.category}
        </span>
      </div>

      {/* Image Placeholder */}
      <div className="h-48 w-full bg-gray-200 overflow-hidden relative group">
         <img 
           src={`https://picsum.photos/seed/${story.headline.replace(/\s/g, '')}/600/400`} 
           alt="News illustration" 
           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
            <span className="text-6xl filter drop-shadow-lg transform translate-y-2">{story.emoji}</span>
         </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <h2 className="text-2xl font-heading font-bold text-gray-800 mb-3 leading-tight">
          {story.headline}
        </h2>
        
        <p className="text-gray-700 font-body text-lg leading-relaxed mb-4 flex-1">
          {story.summary}
        </p>

        {story.funFact && (
          <div className="bg-white/60 rounded-xl p-3 mb-4 border border-gray-100">
            <span className="text-xs font-bold text-kids-purple uppercase block mb-1">💡 Fun Fact</span>
            <p className="text-sm text-gray-600 italic">
              {story.funFact}
            </p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-4">
          <button
            onClick={handleReadAloud}
            disabled={isBuffering}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all
              ${isPlaying 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}
            `}
          >
            {isBuffering ? (
              <span className="animate-pulse">Loading Audio...</span>
            ) : isPlaying ? (
              <>⏹ Stop Reading</>
            ) : (
              <>🔊 Read to me</>
            )}
          </button>
        </div>
        
        {/* Sources Section - Grounding Requirement */}
        {story.sources && story.sources.length > 0 && (
           <div className="mt-3 text-xs text-gray-400">
             <p className="font-bold mb-1">Source:</p>
             <ul className="list-disc pl-4 truncate">
               {story.sources.map((src, i) => (
                 <li key={i}>
                   <a href={src.uri} target="_blank" rel="noopener noreferrer" className="hover:text-kids-blue underline">
                     {src.title}
                   </a>
                 </li>
               ))}
             </ul>
           </div>
        )}
      </div>
    </div>
  );
};

export default NewsCard;