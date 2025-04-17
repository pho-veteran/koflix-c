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