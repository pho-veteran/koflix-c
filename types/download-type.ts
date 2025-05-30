export enum DownloadStatus {
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface DownloadTask {
  id: string;
  m3u8Url?: string;
  mp4Url?: string;
  title: string;
  thumbUrl?: string;
  filePath: string;
  status: DownloadStatus;
  ffmpegSessionId?: number;
  downloadResumable?: any; // For Expo FileSystem downloads
  progress?: number;
  error?: string;
  createdAt: number;
  userId: string;
  
  episodeData?: {
    movieId?: string;
    episodeName?: string;
    episodeId?: string;
    episodeServerId?: string;
    episodeServerFileName?: string;
    episodeServerName?: string;
  };
}