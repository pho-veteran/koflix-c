export interface UserComment {
    id: string;
    name: string | null;
    avatarUrl: string | null;
}

export interface Comment {
    id: string;
    userId: string;
    content: string;
    movieId: string | null;
    episodeId: string | null;
    createdAt: string;
    updatedAt: string;
    user: UserComment;
    replyCount: number;
}

export interface Reply {
    id: string;
    userId: string;
    commentId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: UserComment;
}

export type InteractionType = "LIKE" | "DISLIKE" | "RATE" | "VIEW";

export interface MovieInteraction {
    id: string;
    userId: string;
    movieId: string;
    interactionType: InteractionType;
    rating: number | null;
    timestamp: string;
}

export interface EpisodeWatchHistory {
    id: string;
    userId: string;
    progress: number;
    durationWatched: number;
    watchedAt: string;
    movie?: {
        id: string;
        name: string;
        slug: string;
        poster_url: string;
        thumb_url: string;
        year: number;
        episode_total: string;
    };
    episodeServer?: {
        id: string;
        server_name: string;
        filename: string;
        episode: {
            id: string;
            name: string;
            slug: string;
        };
    };
}

export interface UnmappedEpisodeWatchHistory {
    id: string;
    progress: number;
    durationWatched: number;
    watchedAt: string;
    episodeServerId: string;
    serverName: string;
}

export interface EpisodeWatchHistoryResponse {
    success: boolean;
    data: {
        episodeId: string;
        watchHistory: UnmappedEpisodeWatchHistory[];
    };
}