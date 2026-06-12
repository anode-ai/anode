'use client';

import { useState, useEffect } from 'react';

interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export default function RagPlayground() {
  // Global hardcoded tenant boundary matching your backend requirement
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || '11111111-1111-1111-1111-111111111111';
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // State Management
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>(''); // Empty string = Global Tenant Search
  
  const [sourceName, setSourceName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [ingestStatus, setIngestStatus] = useState({ type: '', msg: '' });
  const [isIngesting, setIsIngesting] = useState(false);

  const [queryText, setQueryText] = useState('');
  const [limit, setLimit] = useState(3);
  const [answer, setAnswer] = useState('');
  const [references, setReferences] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Phase 0: Fetch Available Knowledge Sources for current Tenant
  const fetchSources = async () => {
    try {
      // Assuming GET /rag/sources returns an array of sources for this tenant.
      // If you don't have this endpoint yet, you can temporarily paste your UUIDs into options.
      const res = await fetch(`${BACKEND_URL}/rag/sources`, {
        method: 'GET',
        headers: {
          'x-tenant-id': TENANT_ID,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (err) {
      console.error('Failed to automatically sync active knowledge source list:', err);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  // Phase 1: Ingest Sequence (Source Registration -> File Upload Chunking)
  const handleIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName || !file) {
      setIngestStatus({ type: 'error', msg: 'Please enter a source name and select a file.' });
      return;
    }

    setIsIngesting(true);
    setIngestStatus({ type: 'info', msg: 'Registering knowledge source entry...' });

    try {
      // 1. Create the Knowledge Source entry
      const sourceRes = await fetch(`${BACKEND_URL}/rag/source`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': TENANT_ID,
        },
        body: JSON.stringify({ name: sourceName, type: 'file' }),
      });

      if (!sourceRes.ok) throw new Error('Failed to register knowledge source record.');
      const sourceData = await sourceRes.json();
      
      // Match key layout coming from your specific controller setup
      const sourceId = sourceData.id || sourceData.sourceId;

      setIngestStatus({ type: 'info', msg: 'Source created. Extracting and embedding vectors...' });

      // 2. Upload and chunk the file
      const formData = new FormData();
      formData.append('sourceId', sourceId);
      formData.append('file', file);

      const ingestRes = await fetch(`${BACKEND_URL}/rag/ingest-file`, {
        method: 'POST',
        headers: {
          'x-tenant-id': TENANT_ID,
        },
        body: formData,
      });

      if (!ingestRes.ok) throw new Error('File chunk extraction or embedding task failed.');

      setIngestStatus({ type: 'success', msg: `Successfully vectorized and saved "${file.name}"!` });
      setSourceName('');
      setFile(null);
      
      // Refresh dropdown selection pool immediately
      await fetchSources();
    } catch (err: any) {
      setIngestStatus({ type: 'error', msg: err.message || 'Ingestion failure occurred.' });
    } finally {
      setIsIngesting(false);
    }
  };

  // Phase 2: Vector Search & Llama 3 Synthesis with precision file scoping
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setIsSearching(true);
    setAnswer('');
    setReferences([]);

    try {
      const response = await fetch(`${BACKEND_URL}/rag/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': TENANT_ID,
        },
        body: JSON.stringify({
          query: queryText,
          limit: limit,
          // 🎯 Conditionally append the tracking parameter only if a specific option is checked
          ...(selectedSourceId ? { sourceId: selectedSourceId } : {}),
        }),
      });

      if (!response.ok) throw new Error('Vector retrieval pipeline failed.');
      const data = await response.json();

      setAnswer(data.answer);
      setReferences(data.references || []);
    } catch (err: any) {
      setAnswer(`Error querying engine: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <header className="mb-8 border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Anode AI RAG Workspace</h1>
        <p className="text-slate-400 mt-1 text-sm">Testing sandbox for isolated multi-tenant file ingestion and structured semantic search.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: INGESTION FORM */}
        <div className="lg:col-span-5 bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-xl">
          <h2 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
            <span>📁</span> 1. Ingest Knowledge Base
          </h2>
          
          <form onSubmit={handleIngestion} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Source Context Label</label>
              <input
                type="text"
                placeholder="e.g., Plant Biology Chapter 1"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upload Plain Text Document</label>
              <input
                type="file"
                accept=".txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isIngesting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isIngesting ? 'Processing Vectors...' : 'Upload & Process Ingestion'}
            </button>
          </form>

          {ingestStatus.msg && (
            <div className={`mt-4 p-3 rounded-lg text-xs font-medium border ${
              ingestStatus.type === 'success' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' :
              ingestStatus.type === 'error' ? 'bg-rose-950/40 text-rose-400 border-rose-800' :
              'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              {ingestStatus.msg}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: CHAT SEARCH SANDBOX WITH DROPDOWN FILTER */}
        <div className="lg:col-span-7 bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col min-h-[500px]">
          <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <span>⚡</span> 2. Refined Query Playground
          </h2>

          <form onSubmit={handleSearch} className="space-y-4 mb-6">
            {/* 🎯 CONTEXT FILTER DROPDOWN */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Search Context Scope
              </label>
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">🌍 Global Tenant Scope (Search All Uploaded Files)</option>
                {sources.map((source) => (
                  <option key={source.id} value={source.id}>
                    📄 {source.name} ({new Date(source.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask something about your document context scope..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Ask AI'}
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-lg border border-slate-800">
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wider whitespace-nowrap">
                Max Context Traces ({limit})
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </form>

          {/* MAIN OUTPUT ZONES */}
          <div className="flex-1 space-y-4">
            {answer && (
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Refined Synthesis Response</h3>
                <p className="text-base text-slate-100 leading-relaxed font-medium">{answer}</p>
              </div>
            )}

            {references.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4 pl-1">
                  Retrieved Vector Snippets (Context Matches)
                </h3>
                {references.map((ref, index) => (
                  <div key={ref.id || index} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                    <div className="flex justify-between text-slate-500 font-mono mb-1">
                      <span>Trace #{index + 1} (ID: {ref.id?.substring(0, 8)}...)</span>
                      {ref.similarityScore && (
                        <span className="text-indigo-400 font-semibold">
                          Score: {(ref.similarityScore * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="italic text-slate-400">"{ref.snippet}"</p>
                  </div>
                ))}
              </div>
            )}

            {!answer && !isSearching && (
              <div className="h-full flex items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-xl p-12 text-center text-sm">
                Type a message and hit enter to view a targeted query trace.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}