import React, { useEffect, useRef } from 'react';
import { Job, LogEntry, JobStatus } from '../types';
import { Terminal, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';

interface JobConsoleProps {
  logs: LogEntry[];
  jobs: Job[];
}

export const JobConsole: React.FC<JobConsoleProps> = ({ logs, jobs }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
      {/* Active Jobs List */}
      <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
          <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-indigo-400" />
            Job Queue
          </h3>
          <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400">{jobs.length} active</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {jobs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center">
                <Terminal className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-sm">No active jobs</p>
            </div>
          ) : (
            jobs.slice().reverse().map((job) => (
              <div key={job.id} className="p-3 rounded-lg bg-gray-950/50 border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-gray-500">#{job.id.slice(0, 6)}</span>
                  {job.status === JobStatus.COMPLETED ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : job.status === JobStatus.FAILED ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  )}
                </div>
                <p className="text-sm text-gray-300 truncate mb-1" title={job.input}>{job.input}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                    {job.stage}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(job.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Logs */}
      <div className="lg:col-span-2 bg-gray-950 border border-gray-800 rounded-xl flex flex-col font-mono text-sm overflow-hidden shadow-inner shadow-black/50">
        <div className="p-3 bg-gray-900/80 border-b border-gray-800 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-500" />
          <span className="text-gray-400 text-xs">System Output Stream</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-hide bg-black/20">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-gray-600 whitespace-nowrap text-[10px] mt-0.5">
                  {new Date(log.timestamp).toISOString().split('T')[1].split('.')[0]}
                </span>
                <div className="flex-1 break-all">
                  {log.type === 'system' && <span className="text-blue-500 mr-2">[SYSTEM]</span>}
                  {log.type === 'success' && <span className="text-green-500 mr-2">[OK]</span>}
                  {log.type === 'error' && <span className="text-red-500 mr-2">[ERR]</span>}
                  {log.type === 'info' && <span className="text-gray-500 mr-2">[INFO]</span>}
                  <span className={log.type === 'error' ? 'text-red-400' : 'text-gray-300'}>
                    {log.message}
                  </span>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};