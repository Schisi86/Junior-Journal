export interface NewsSource {
  title: string;
  uri: string;
}

export interface NewsStory {
  headline: string;
  summary: string;
  emoji: string;
  category: string;
  funFact?: string;
  sources?: NewsSource[];
}

export enum FetchStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface AudioState {
  isPlaying: boolean;
  currentStoryIndex: number | null;
}