export enum DownloadStatus {
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface DownloadTask {
  id: string;
  m3u8Url: string;
  title: string;
  thumbUrl?: string;
  filePath: string;
  status: DownloadStatus;
  ffmpegSessionId?: number;
  error?: string;
  createdAt: number;
  userId: string; // Add userId field to associate downloads with specific users
  
  episodeData?: {
    movieId?: string;
    episodeName?: string;
    episodeId?: string;
    episodeServerId?: string;
    episodeServerFileName?: string;
    episodeServerName?: string;
  };
}