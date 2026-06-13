'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  FileText,
  UploadCloud,
  Sparkles,
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  Info,
  FolderOpen,
  Zap,
  FileSearch,
} from 'lucide-react';

import { Button } from '@anode/ui/components/ui/button';
import { Input } from '@anode/ui/components/ui/input';
import { Label } from '@anode/ui/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@anode/ui/components/ui/card';
import { Slider } from '@anode/ui/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@anode/ui/components/ui/select';
import { Alert, AlertDescription } from '@anode/ui/components/ui/alert';
import { Badge } from '@anode/ui/components/ui/badge';

interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export default function RagPlayground() {
  const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('global');

  const [sourceName, setSourceName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [ingestStatus, setIngestStatus] = useState({ type: '', msg: '' });
  const [isIngesting, setIsIngesting] = useState(false);

  const [queryText, setQueryText] = useState('');
  const [limit, setLimit] = useState(3);
  const [answer, setAnswer] = useState('');
  const [references, setReferences] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fetchSources = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/rag/sources`, {
        method: 'GET',
        headers: {
          'x-tenant-id': TENANT_ID as string,
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

  const handleIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName || !file) {
      setIngestStatus({ type: 'error', msg: 'Please enter a source name and select a file.' });
      return;
    }

    setIsIngesting(true);
    setIngestStatus({ type: 'info', msg: 'Registering knowledge source entry...' });

    try {
      const sourceRes = await fetch(`${BACKEND_URL}/rag/source`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': TENANT_ID as string,
        },
        body: JSON.stringify({ name: sourceName, type: 'file' }),
      });

      if (!sourceRes.ok) throw new Error('Failed to register knowledge source record.');
      const sourceData = await sourceRes.json();
      const sourceId = sourceData.id || sourceData.sourceId;

      setIngestStatus({ type: 'info', msg: 'Source created. Extracting and embedding vectors...' });

      const formData = new FormData();
      formData.append('sourceId', sourceId);
      formData.append('file', file);

      const ingestRes = await fetch(`${BACKEND_URL}/rag/ingest-file`, {
        method: 'POST',
        headers: {
          'x-tenant-id': TENANT_ID as string,
        },
        body: formData,
      });

      if (!ingestRes.ok) throw new Error('File chunk extraction or embedding task failed.');

      setIngestStatus({ type: 'success', msg: `Successfully vectorized and saved "${file.name}"!` });
      setSourceName('');
      setFile(null);

      await fetchSources();
    } catch (err: any) {
      setIngestStatus({ type: 'error', msg: err.message || 'Ingestion failure occurred.' });
    } finally {
      setIsIngesting(false);
    }
  };

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
          'x-tenant-id': TENANT_ID as string,
        },
        body: JSON.stringify({
          query: queryText,
          limit: limit,
          ...(selectedSourceId !== 'global' ? { sourceId: selectedSourceId } : {}),
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="mb-8 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Anode AI RAG Workspace</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Testing sandbox for isolated multi-tenant file ingestion and structured semantic search.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANEL: INGESTION FORM */}
        <Card className="lg:col-span-5 bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-indigo-400 flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              1. Ingest Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIngestion} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Source Context Label
                </Label>
                <Input
                  type="text"
                  placeholder="e.g., Plant Biology Chapter 1"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  disabled={isIngesting}
                  className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Upload Plain Text Document
                </Label>
                <label
                  htmlFor="file-upload"
                  className={`flex items-center gap-3 w-full bg-slate-950 border border-dashed border-slate-700 rounded-lg px-4 py-3 text-sm cursor-pointer transition-colors hover:border-indigo-500 ${
                    isIngesting ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <UploadCloud className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-400 truncate">
                    {file ? file.name : 'Click to choose a .txt file'}
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={isIngesting}
                    className="hidden"
                  />
                </label>
              </div>

              <Button
                type="submit"
                disabled={isIngesting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
              >
                {isIngesting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing Vectors...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Upload & Process Ingestion
                  </>
                )}
              </Button>
            </form>

            {ingestStatus.msg && (
              <Alert
                className={`mt-4 border ${
                  ingestStatus.type === 'success'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                    : ingestStatus.type === 'error'
                    ? 'bg-rose-950/40 text-rose-400 border-rose-800'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {ingestStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {ingestStatus.type === 'error' && <XCircle className="w-4 h-4 shrink-0" />}
                  {ingestStatus.type === 'info' && <Loader2 className="w-4 h-4 shrink-0 animate-spin" />}
                  <AlertDescription className="text-xs font-medium">{ingestStatus.msg}</AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* RIGHT PANEL: CHAT SEARCH SANDBOX */}
        <Card className="lg:col-span-7 bg-slate-900 border-slate-800 shadow-xl flex flex-col min-h-[500px]">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              2. Refined Query Playground
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <form onSubmit={handleSearch} className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Search Context Scope
                </Label>
                {mounted ? (
    <Select value={selectedSourceId} onValueChange={setSelectedSourceId} disabled={isSearching}>
      <SelectTrigger className="bg-slate-950 border-slate-700 text-slate-200 focus:ring-emerald-500">
        <SelectValue placeholder="Select scope" />
      </SelectTrigger>
      <SelectContent className="bg-slate-950 border-slate-700 text-slate-200">
        <SelectItem value="global">
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Global Tenant Scope (Search All Uploaded Files)
          </span>
        </SelectItem>
        {sources.map((source) => (
          <SelectItem key={source.id} value={source.id}>
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              {source.name}
              <span className="text-slate-500 text-xs">
                ({new Date(source.createdAt).toLocaleDateString()})
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : (
    /* 🛠️ SKELETON PLACEHOLDER MATCHING THE DOCKING COMPONENT HEIGHT */
    <div className="h-10 bg-slate-950 border border-slate-800 rounded-lg animate-pulse" />
  )}

              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Ask something about your document context scope..."
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    disabled={isSearching}
                    className="pl-9 bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus-visible:ring-emerald-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors min-w-[110px]"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Ask AI
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <Label className="text-xs text-slate-400 font-medium uppercase tracking-wider whitespace-nowrap">
                  Max Context Traces ({limit})
                </Label>
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[limit]}
                  onValueChange={(val:any) => setLimit(val[0])}
                  disabled={isSearching}
                  className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500"
                />
              </div>
            </form>

            {/* MAIN OUTPUT ZONES */}
            <div className="flex-1 space-y-4">
              {isSearching && (
                <div className="space-y-3 animate-pulse">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Synthesizing response...
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-800 rounded w-full" />
                      <div className="h-3 bg-slate-800 rounded w-5/6" />
                      <div className="h-3 bg-slate-800 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 h-14" />
                    ))}
                  </div>
                </div>
              )}

              {!isSearching && answer && (
                <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Refined Synthesis Response
                  </h3>
                  <p className="text-base text-slate-100 leading-relaxed font-medium">{answer}</p>
                </div>
              )}

              {!isSearching && references.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4 pl-1 flex items-center gap-2">
                    <FileSearch className="w-3.5 h-3.5" />
                    Retrieved Vector Snippets (Context Matches)
                  </h3>
                  {references.map((ref, index) => (
                    <div
                      key={ref.id || index}
                      className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300"
                    >
                      <div className="flex justify-between items-center text-slate-500 font-mono mb-1">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3" />
                          Trace #{index + 1} (ID: {ref.id?.substring(0, 8)}...)
                        </span>
                        {ref.similarityScore && (
                          <Badge
                            variant="outline"
                            className="text-indigo-400 border-indigo-800 bg-indigo-950/40 font-semibold"
                          >
                            Score: {(ref.similarityScore * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                      <p className="italic text-slate-400">"{ref.snippet}"</p>
                    </div>
                  ))}
                </div>
              )}

              {!answer && !isSearching && (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-600 border border-dashed border-slate-800 rounded-xl p-12 text-center text-sm">
                  <Info className="w-6 h-6" />
                  Type a message and hit enter to view a targeted query trace.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}