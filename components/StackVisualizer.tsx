import React from 'react';
import { Database, Server, BrainCircuit, Layers, Globe, FileJson } from 'lucide-react';
import { PipelineStage } from '../types';

interface StackVisualizerProps {
  activeStage: PipelineStage;
}

const Node = ({ 
  icon: Icon, 
  label, 
  subLabel, 
  isActive, 
  color 
}: { 
  icon: any, 
  label: string, 
  subLabel: string, 
  isActive: boolean, 
  color: string 
}) => (
  <div className={`
    relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-500
    ${isActive 
      ? `bg-gray-800 border-${color}-500 shadow-[0_0_15px_rgba(var(--${color}-rgb),0.3)] scale-105` 
      : 'bg-gray-900 border-gray-800 opacity-60'}
  `}>
    <Icon className={`w-8 h-8 mb-2 ${isActive ? `text-${color}-400` : 'text-gray-500'}`} />
    <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{label}</span>
    <span className="text-[10px] text-gray-500">{subLabel}</span>
    
    {isActive && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
    )}
  </div>
);

const Arrow = ({ isActive }: { isActive: boolean }) => (
  <div className="flex-1 h-[2px] mx-2 bg-gray-800 relative overflow-hidden">
    {isActive && (
      <div className="absolute inset-0 bg-blue-500 animate-progress-slide" />
    )}
  </div>
);

export const StackVisualizer: React.FC<StackVisualizerProps> = ({ activeStage }) => {
  return (
    <div className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">System Architecture</h2>
        <div className="flex items-center gap-2">
           <span className={`w-2 h-2 rounded-full ${activeStage !== PipelineStage.IDLE ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
           <span className="text-xs text-gray-500">{activeStage === PipelineStage.IDLE ? 'System Idle' : 'Processing Pipeline Active'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 md:pb-0">
        {/* Client */}
        <Node 
          icon={Globe} 
          label="Client" 
          subLabel="React / Axios" 
          isActive={true} // Always visible as the view
          color="indigo" 
        />
        
        <Arrow isActive={activeStage !== PipelineStage.IDLE} />

        {/* API / Queue */}
        <Node 
          icon={Layers} 
          label="Queue" 
          subLabel="Redis / BullMQ" 
          isActive={activeStage === PipelineStage.QUEUED} 
          color="orange" 
        />

        <Arrow isActive={activeStage === PipelineStage.SCRAPING || activeStage === PipelineStage.AI_ANALYSIS} />

        {/* Scraper */}
        <Node 
          icon={FileJson} 
          label="Scraper" 
          subLabel="Cheerio / Readability" 
          isActive={activeStage === PipelineStage.SCRAPING} 
          color="pink" 
        />

        <Arrow isActive={activeStage === PipelineStage.AI_ANALYSIS} />

        {/* AI */}
        <Node 
          icon={BrainCircuit} 
          label="Intelligence" 
          subLabel="Google Gemini" 
          isActive={activeStage === PipelineStage.AI_ANALYSIS} 
          color="purple" 
        />

        <Arrow isActive={activeStage === PipelineStage.SAVING} />

        {/* DB */}
        <Node 
          icon={Database} 
          label="Storage" 
          subLabel="MongoDB" 
          isActive={activeStage === PipelineStage.SAVING} 
          color="emerald" 
        />
      </div>
      
      <style>{`
        @keyframes progress-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-slide {
          animation: progress-slide 1s infinite linear;
        }
      `}</style>
    </div>
  );
};