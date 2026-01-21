import React, { useEffect, useState, useCallback } from 'react';
import Header from './components/Header';
import NewsCard from './components/NewsCard';
import { fetchKidsNews } from './services/geminiService';
import { NewsStory, FetchStatus } from './types';

function App() {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [status, setStatus] = useState<FetchStatus>(FetchStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const getNews = useCallback(async () => {
    setStatus(FetchStatus.LOADING);
    setError(null);
    try {
      const data = await fetchKidsNews();
      setStories(data);
      setStatus(FetchStatus.SUCCESS);
    } catch (err) {
      setError("Oops! We couldn't find the news right now. Maybe try again later?");
      setStatus(FetchStatus.ERROR);
    }
  }, []);

  // Fetch news on mount
  useEffect(() => {
    getNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen font-body pb-20">
      <Header 
        onRefresh={getNews} 
        isLoading={status === FetchStatus.LOADING} 
      />

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-800 mb-2">
            What's Happening in the World? 🌍
          </h2>
          <p className="text-gray-600 text-lg">
            Top 3 stories picked just for you!
          </p>
        </div>

        {status === FetchStatus.LOADING && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-white rounded-3xl border-4 border-gray-100 shadow-sm p-4">
                <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        )}

        {status === FetchStatus.ERROR && (
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 text-center border-4 border-red-100 shadow-lg">
            <div className="text-6xl mb-4">🙈</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Uh oh!</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={getNews}
              className="bg-kids-blue text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-blue-400 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {status === FetchStatus.SUCCESS && stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, index) => (
              <NewsCard key={index} story={story} index={index} />
            ))}
          </div>
        )}
        
        {status === FetchStatus.SUCCESS && stories.length === 0 && (
           <div className="text-center py-20 text-gray-500">
             <p>No news found. Try refreshing!</p>
           </div>
        )}
      </main>

      {/* Decorative background elements */}
      <div className="fixed bottom-0 left-0 -z-10 w-64 h-64 bg-kids-yellow/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      <div className="fixed top-20 right-0 -z-10 w-96 h-96 bg-kids-pink/10 rounded-full blur-3xl transform translate-x-1/3"></div>
    </div>
  );
}

export default App;