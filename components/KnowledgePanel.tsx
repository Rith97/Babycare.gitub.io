
import React, { useState } from 'react';
import { getBabyCareAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const KnowledgePanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAsk = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError('');
    setResponse('');
    try {
      const result = await getBabyCareAdvice(query);
      setResponse(result);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl sm:text-2xl font-bold">📚 ចំណេះដឹង (AI)</h3>
      </div>
      <div className="space-y-4">
        <div>
            <label className="klabel">សួរសំណួរអំពីការថែទាំទារក</label>
            <textarea 
                value={query}
                onChange={e => setQuery(e.target.value)}
                rows={4}
                placeholder="ឧ. ហេតុអ្វីបានជាទារកយំនៅពេលយប់? តើគួរធ្វើដូចម្តេច?"
                className="w-full"
                disabled={isLoading}
            />
        </div>
        <button onClick={handleAsk} className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? <span className="loading"></span> : '🧠 សួរ AI'}
        </button>

        {error && <p className="text-red-500 text-center">{error}</p>}
        
        {isLoading && (
            <div className="flex justify-center items-center py-8">
                <div className="loading loading-center !w-12 !h-12"></div>
            </div>
        )}
        
        {response && (
          <div className="prose dark:prose-invert max-w-none p-4 rounded-xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
          </div>
        )}
      </div>
    </section>
  );
};

export default KnowledgePanel;