export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Country {
    id: string;
    name: string;
    slug: string;
}

export interface EpisodeServer {
    id: string;
    server_name: string;
    filename: string;
    link_embed: string;
    link_m3u8: string;
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
}

export interface Episode {
    id: string;
    name: string;
    slug: string;
    servers: EpisodeServer[];
}

export interface Tmdb {
    type: string;
    id: string;
    season: number;
    vote_average: number;
    vote_count: number;
}

// Added interface for the user interaction data
export interface UserInteractionData {
    isLiked: boolean;
    isDisliked: boolean;
    rating: number | null;
}

export interface MovieDetail {
    id: string;
    name: string;
    slug: string;
    origin_name: string;
    type: string; // Name of the movie type
    poster_url: string;
    thumb_url: string;
    sub_docquyen: boolean;
    episode_current: string;
    time: string;
    quality: string;
    lang: string;
    year: number;

    tmdb: Tmdb;
    imdb: {
        id: string;
    };
    content: string;
    status: string;
    is_copyright: boolean;
    chieurap: boolean;
    trailer_url?: string; // Optional based on endpoint logic (can be null)
    episode_total: string;
    notify: string;
    showtimes: string;

    view: number;
    rating: number;
    ratingCount: number;
    likeCount: number;
    dislikeCount: number;

    category: Category[]; // Array containing the movie's type info
    country: Country[]; // Array of country objects
    actor: string[];
    director: string[];
    genres: string[]; // Array of genre names
    episodes: Episode[];

    createdAt: string; // ISO String
    updatedAt: string; // ISO String

    // Added userInteraction field, which can be null if userId is not provided
    userInteraction: UserInteractionData | null;
}

export interface MovieBase {
    id: string;
    name: string;
    slug: string;
    poster_url: string | null;
    thumb_url: string | null;
    year: number | null;
    genres: string[];
    score?: number;
    popularityScore?: number; 
}

export interface MovieType {
    id: string;
    name: string;
    slug: string;
}

export interface MovieGenre {
    id: string;
    name: string;
    slug: string;
}