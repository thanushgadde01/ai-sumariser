import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Plus, Github, Server, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Job, JobStatus, LogEntry, PipelineStage, PipelineStats } from './types';
import { summarizeContent } from './services/gemini';
import { StackVisualizer } from './components/StackVisualizer';
import { MetricsPanel } from './components/MetricsPanel';
import { JobConsole } from './components/JobConsole';

const MOCK_DELAY = 1200; // ms per stage to simulate network latency

export default function App() {
  const [input, setInput] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeStage, setActiveStage] = useState<PipelineStage>(PipelineStage.IDLE);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<{ time: string; duration: number }[]>([]);
  const processingRef = useRef(false);

  const addLog = (message: string, type: LogEntry['type'] = 'info', jobId: string = 'SYSTEM') => {
    setLogs(prev => [...prev, { timestamp: Date.now(), message, type, jobId }].slice(-100));
  };

  const stats: PipelineStats = {
    totalJobs: jobs.filter(j => j.status === JobStatus.COMPLETED).length,
    avgProcessingTime: history.length ? Math.round(history.reduce((acc, curr) => acc + curr.duration, 0) / history.length) : 0,
    queueDepth: jobs.filter(j => j.status === JobStatus.PENDING).length,
    successRate: jobs.length ? Math.round((jobs.filter(j => j.status === JobStatus.COMPLETED).length / jobs.length) * 100) : 100,
  };

  // The Worker Loop
  useEffect(() => {
    const processQueue = async () => {
      if (processingRef.current) return;
      
      const pendingJob = jobs.find(j => j.status === JobStatus.PENDING);
      if (!pendingJob) {
        setActiveStage(PipelineStage.IDLE);
        return;
      }

      processingRef.current = true;
      const startTime = Date.now();

      try {
        // 1. QUEUE - Redis Simulation
        updateJobStatus(pendingJob.id, JobStatus.PROCESSING, PipelineStage.QUEUED);
        setActiveStage(PipelineStage.QUEUED);
        addLog(`Job ${pendingJob.id.slice(0,6)} picked up from Redis queue: "default"`, 'system', pendingJob.id);
        await new Promise(r => setTimeout(r, MOCK_DELAY));

        // 2. SCRAPER - Cheerio Simulation
        updateJobStatus(pendingJob.id, JobStatus.PROCESSING, PipelineStage.SCRAPING);
        setActiveStage(PipelineStage.SCRAPING);
        addLog(`Worker 01 executing scraper: Readability.js`, 'info', pendingJob.id);
        await new Promise(r => setTimeout(r, MOCK_DELAY));

        // 3. AI - Gemini Analysis (Real Call)
        updateJobStatus(pendingJob.id, JobStatus.PROCESSING, PipelineStage.AI_ANALYSIS);
        setActiveStage(PipelineStage.AI_ANALYSIS);
        addLog(`Sending payload to Gemini 2.5 Flash...`, 'info', pendingJob.id);
        
        let summary = '';
        try {
          summary = await summarizeContent(pendingJob.input);
          addLog(`Gemini response received (${summary.length} bytes)`, 'success', pendingJob.id);
        } catch (e) {
          addLog(`AI inference failed: ${e}`, 'error', pendingJob.id);
          throw e;
        }

        // 4. DB - MongoDB Simulation
        updateJobStatus(pendingJob.id, JobStatus.PROCESSING, PipelineStage.SAVING);
        setActiveStage(PipelineStage.SAVING);
        addLog(`Writing document to MongoDB collection: "summaries"`, 'system', pendingJob.id);
        await new Promise(r => setTimeout(r, MOCK_DELAY));

        // COMPLETE
        const duration = Date.now() - startTime;
        setJobs(prev => prev.map(j => j.id === pendingJob.id ? { 
          ...j, 
          status: JobStatus.COMPLETED, 
          stage: PipelineStage.DONE,
          result: summary,
          completedAt: Date.now()
        } : j));
        
        setHistory(prev => [...prev, { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          duration 
        }].slice(-20));
        
        addLog(`Job ${pendingJob.id.slice(0,6)} completed in ${duration}ms`, 'success', pendingJob.id);

      } catch (error) {
        updateJobStatus(pendingJob.id, JobStatus.FAILED, PipelineStage.DONE);
        addLog(`Job failed processing`, 'error', pendingJob.id);
      } finally {
        processingRef.current = false;
      }
    };

    const interval = setInterval(processQueue, 1000);
    return () => clearInterval(interval);
  }, [jobs]);

  const updateJobStatus = (id: string, status: JobStatus, stage: PipelineStage) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status, stage } : j));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newJob: Job = {
      id: crypto.randomUUID(),
      input: input,
      status: JobStatus.PENDING,
      stage: PipelineStage.QUEUED,
      createdAt: Date.now(),
      logs: []
    };

    setJobs(prev => [...prev, newJob]);
    addLog(`Received API request POST /jobs`, 'info', newJob.id);
    setInput('');
  };

  const hasApiKey = !!process.env.API_KEY;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                <Server className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">StackFlow Simulator</h1>
            </div>
            <p className="text-gray-400 text-sm max-w-xl">
              Full-stack architecture visualization. Simulating Node.js/BullMQ/Redis pipeline with real-time Gemini AI processing.
            </p>
          </div>
          <div className="flex gap-3">
             {!hasApiKey && (
               <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-xs font-medium">
                 <AlertCircle className="w-4 h-4" />
                 Missing API_KEY
               </div>
             )}
             <a href="#" className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-lg text-gray-300 text-sm transition-colors">
               <Github className="w-4 h-4" />
               View Source
             </a>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content: Visualizer & Console */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Input Section */}
            <div className="bg-gray-900/50 p-1 rounded-2xl border border-gray-800 backdrop-blur-sm sticky top-0 z-10 shadow-xl">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter a URL (e.g., https://example.com) or a topic to research..."
                  className="flex-1 bg-gray-950 text-gray-100 px-4 py-3 rounded-xl border border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder-gray-600"
                />
                <button 
                  disabled={!hasApiKey}
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Enqueue Job</span>
                </button>
              </form>
            </div>

            <StackVisualizer activeStage={activeStage} />

            {/* Recent Completed Job Result */}
            {jobs.find(j => j.status === JobStatus.COMPLETED) && (
               <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-indigo-400 uppercase tracking-widest">Latest Intelligence Report</h3>
                    <span className="text-xs text-gray-500">Source: MongoDB "summaries" collection</span>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none prose-headings:text-gray-200 prose-p:text-gray-400 prose-a:text-blue-400 prose-code:text-orange-300 prose-pre:bg-gray-950">
                    <ReactMarkdown>
                      {jobs.slice().reverse().find(j => j.status === JobStatus.COMPLETED)?.result || ''}
                    </ReactMarkdown>
                  </div>
               </div>
            )}

            <JobConsole logs={logs} jobs={jobs.filter(j => j.status !== JobStatus.COMPLETED)} />
          </div>

          {/* Sidebar: Metrics */}
          <div className="lg:col-span-4 space-y-6">
            <MetricsPanel stats={stats} history={history} />
            
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-xl p-6">
              <h4 className="text-indigo-400 font-medium mb-2">System Status</h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm border-b border-gray-800/50 pb-2">
                  <span className="text-gray-500">Node.js Workers</span>
                  <span className="text-green-400">Online (Cluster: 4)</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-800/50 pb-2">
                  <span className="text-gray-500">BullMQ Redis</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex justify-between text-sm border-b border-gray-800/50 pb-2">
                  <span className="text-gray-500">MongoDB Atlas</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gemini API</span>
                  <span className={hasApiKey ? "text-green-400" : "text-red-400"}>{hasApiKey ? "Authenticated" : "Missing Key"}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}