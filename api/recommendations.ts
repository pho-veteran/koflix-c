import axios from "axios";
import { MovieBase } from "@/types/movie";
import { getIdToken } from "@/lib/firebase-auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Fetches top 10 trending movies.
 * @returns Promise<MovieBase[]> - Array of trending movies.
 */
export async function getTrendingMovies(): Promise<MovieBase[]> {
    try {
        const response = await axios.get(
            `${API_URL}/api/public/recommendations/popularity/trending`
        );

        return response.data.data;
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        throw error;
    }
}

/**
 * Fetches recently added movies.
 * @param limit - Optional limit for the number of movies to fetch. Defaults to 12.
 * @returns Promise<MovieBase[]> - Array of recently added movies.
 */
export async function getRecentlyAddedMovies(
    limit: number = 12
): Promise<MovieBase[]> {
    try {
        const response = await axios.post(
            `${API_URL}/api/public/recommendations/recently-added`,
            {
                limit,
            }
        );

        return response.data.data;
    } catch (error) {
        console.error("Error fetching recently added movies:", error);
        throw error;
    }
}

/**
 * Fetches personalized movie recommendations for a user.
 * @returns Promise<MovieBase[]> - Array of recommended movies.
 */
export async function getRecommendedMovies(): Promise<MovieBase[]> {
    try {
        const tokenResult = await getIdToken(true);
        
        if (!tokenResult.success || !tokenResult.data) {
            console.warn("Cannot fetch recommended movies without valid authentication.");
            return [];
        }
        
        const response = await axios.post(
            `${API_URL}/api/public/recommendations/personalized/hybrid-for-you`,
            {
                idToken: tokenResult.data
            }
        );
        
        return response.data.data;
    } catch (error) {
        console.error("Error fetching recommended movies:", error);
        return [];
    }
}

/**
 * Fetches movies similar to a specific movie.
 * @param movieId - The ID of the movie to find similar ones for.
 * @param limit - Optional limit for the number of similar movies to fetch. Defaults to 10.
 * @returns Promise<MovieBase[]> - Array of similar movies.
 */
export async function getSimilarMovies(movieId: string): Promise<MovieBase[]> {
    if (!movieId) {
        console.warn("Cannot fetch similar movies without movieId.");
        return [];
    }
    try {
        const response = await axios.post(
            `${API_URL}/api/public/recommendations/similar`,
            {
                movieId,
            }
        );
        return response.data.data;
    } catch (error) {
        console.error(
            `Error fetching similar movies for movie ID ${movieId}:`,
            error
        );
        return [];
    }
}

/**
 * Fetches trending movies for a specific genre based on popularity metrics.
 * @param genreParams - Either genreId or genreSlug must be provided.
 * @param limit - Optional limit for the number of trending movies to fetch.
 * @returns Promise<MovieBase[]> - Array of trending movies for the specified genre.
 */
export async function getGenreTrending(
    genreParams: { genreId?: string; genreSlug?: string },
    limit?: number
): Promise<MovieBase[]> {
    // Ensure either genreId or genreSlug is provided
    if (!genreParams.genreId && !genreParams.genreSlug) {
        console.warn(
            "Either genreId or genreSlug must be provided for genre trending recommendations."
        );
        return [];
    }

    try {
        const response = await axios.post(
            `${API_URL}/api/public/recommendations/popularity/genre-trending`,
            {
                genreId: genreParams.genreId,
                limit: limit,
            }
        );

        return response.data.data;
    } catch (error) {
        console.error(`Error fetching trending movies for genre:`, error);
        return [];
    }
}

/**
 * Fetches trending movies for a specific movie type based on popularity metrics.
 * @param typeParams - Either typeId or typeSlug must be provided.
 * @param limit - Optional limit for the number of trending movies to fetch.
 * @returns Promise<MovieBase[]> - Array of trending movies for the specified type.
 */
export async function getTypeTrending(
    typeParams: { typeId?: string; typeSlug?: string },
    limit?: number
): Promise<MovieBase[]> {
    // Ensure either typeId or typeSlug is provided
    if (!typeParams.typeId && !typeParams.typeSlug) {
        console.warn(
            "Either typeId or typeSlug must be provided for type trending recommendations."
        );
        return [];
    }

    try {
        const response = await axios.post(
            `${API_URL}/api/public/recommendations/popularity/type-trending`,
            {
                typeId: typeParams.typeId,
                typeSlug: typeParams.typeSlug,
                limit: limit,
            }
        );

        return response.data.data;
    } catch (error) {
        console.error(`Error fetching trending movies for type:`, error);
        return [];
    }
}

/**
 * Fetches recently added movies for a specific genre.
 * @param genreId - The ID of the genre to fetch recently added movies for.
 * @param limit - Optional limit for the number of recently added movies to fetch.
 * @returns Promise<MovieBase[]> - Array of recently added movies for the specified genre.
 */
export async function getRecentGenre(
    genreId: string,
    limit?: number
): Promise<MovieBase[]> {
    if (!genreId) {
        console.warn(
            "Cannot fetch recently added movies for genre without genreId."
        );
        return [];
    }

    try {
        const url = `${API_URL}/api/public/recommendations/recently-added/genre/${genreId}`;
        const params = limit ? { limit } : {};

        const response = await axios.get(url, { params });
        return response.data.data;
    } catch (error) {
        console.error(
            `Error fetching recently added movies for genre ID ${genreId}:`,
            error
        );
        return [];
    }
}

/**
 * Fetches recently added movies for a specific movie type.
 * @param typeId - The ID of the movie type to fetch recently added movies for.
 * @param limit - Optional limit for the number of recently added movies to fetch.
 * @returns Promise<MovieBase[]> - Array of recently added movies for the specified type.
 */
export async function getRecentType(
    typeId: string,
    limit?: number
): Promise<MovieBase[]> {
    if (!typeId) {
        console.warn(
            "Cannot fetch recently added movies for type without typeId."
        );
        return [];
    }

    try {
        const url = `${API_URL}/api/public/recommendations/recently-added/type/${typeId}`;
        const params = limit ? { limit } : {};

        const response = await axios.get(url, { params });
        return response.data.data;
    } catch (error) {
        console.error(
            `Error fetching recently added movies for type ID ${typeId}:`,
            error
        );
        return [];
    }
}
