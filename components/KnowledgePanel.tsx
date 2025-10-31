
import React, { useState } from 'react';
import { generateGeminiResponse, AiMode, WebResponse } from '../services/geminiService';
import type { GenerateContentResponse } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const KnowledgePanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<AiMode>('standard');
  const [sources, setSources] = useState<{ web: { uri: string; title: string } }[]>([]);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError('');
    setResponse('');
    setSources([]);
    try {
      const result = await generateGeminiResponse(query, mode);

      if (mode === 'quick') {
        let fullResponse = '';
        for await (const chunk of result as AsyncGenerator<GenerateContentResponse>) {
          fullResponse += chunk.text;
          setResponse(fullResponse);
        }
      } else if (mode === 'web') {
        const webResult = result as WebResponse;
        setResponse(webResult.text);
        setSources(webResult.sources);
      } else {
        setResponse(result as string);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const modeConfig = {
    standard: { label: '💡 Standard', description: 'Balanced advice for everyday questions.' },
    quick: { label: '⚡ Quick', description: 'Low-latency answers for when you\'re in a hurry.' },
    deep: { label: '🤔 Deep Dive', description: 'In-depth analysis for complex situations.' },
    web: { label: '🌐 Web Search', description: 'Up-to-date information from the web.' },
  };

  return (
    <section className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl sm:text-2xl font-bold">📚 ចំណេះដឹង (AI)</h3>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 overflow-x-auto no-scrollbar">
        {Object.entries(modeConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setMode(key as AiMode)}
            className={`tab ${mode === key ? 'tab-active' : ''}`}
            title={config.description}
            disabled={isLoading}
          >
            {config.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
            <label className="klabel">សួរសំណួរអំពីការថែទាំទារក</label>
            <p className="text-sm text-text-muted mb-2">{modeConfig[mode].description}</p>
            <textarea 
                value={query}
                onChange={e => setQuery(e.target.value)}
                rows={4}
                placeholder="ឧ. ហេតុអ្វីបានជាទារកយំនៅពេលយប់? តើគួរធ្វើដូចម្តេច?"
                className="w-full"
                disabled={isLoading}
            />
        </div>
        <button onClick={handleAsk} className="btn btn-primary w-full" disabled={isLoading || !query.trim()}>
          {isLoading ? <><span className="loading"></span> {mode === 'deep' ? 'Thinking...' : 'Asking...'}</> : '🧠 សួរ AI'}
        </button>

        {error && <p className="text-red-500 text-center">{error}</p>}
        
        {isLoading && !response && (
            <div className="flex flex-col justify-center items-center py-8">
                <div className="loading loading-center !w-12 !h-12"></div>
                <p className="mt-4 text-text-muted">
                    {mode === 'deep' ? 'Performing deep analysis... this may take a moment.' : 
                     mode === 'web' ? 'Searching the web for the latest information...' :
                     'Generating a response...'}
                </p>
            </div>
        )}
        
        {response && (
          <div className="prose dark:prose-invert max-w-none p-4 rounded-xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
            {sources.length > 0 && (
                <div className="mt-6 border-t pt-4 border-indigo-200 dark:border-slate-600">
                    <h4 className="font-bold text-sm uppercase tracking-wider text-text-muted">Sources</h4>
                    <ul className="list-none p-0 m-0 mt-2 space-y-2">
                        {sources.map((source, index) => (
                          source.web && (
                            <li key={index} className="!p-0 !m-0">
                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm break-all">
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                          )
                        ))}
                    </ul>
                </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default KnowledgePanel;
