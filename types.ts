export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum PipelineStage {
  IDLE = 'IDLE',
  QUEUED = 'QUEUED',      // Redis/BullMQ
  SCRAPING = 'SCRAPING',  // Cheerio/Readability
  AI_ANALYSIS = 'AI',     // Gemini
  SAVING = 'SAVING',      // MongoDB
  DONE = 'DONE'
}

export interface Job {
  id: string;
  input: string;
  status: JobStatus;
  stage: PipelineStage;
  result?: string;
  createdAt: number;
  completedAt?: number;
  logs: string[];
  error?: string;
}

export interface LogEntry {
  timestamp: number;
  jobId: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'system';
}

export interface PipelineStats {
  totalJobs: number;
  avgProcessingTime: number;
  queueDepth: number;
  successRate: number;
}