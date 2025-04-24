import axios from "axios";
import { MovieBase, MovieDetail, MovieGenre, MovieType } from "@/types/movie-type";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Fetches detailed information for a specific movie.
 * @param movieId - The ID of the movie to fetch details for.
 * @param userId - Optional user ID to retrieve personalized interaction data.
 * @returns Promise<MovieDetail> - Detailed movie information.
 */
export async function getMovieDetail(
    movieId: string,
    userId?: string
): Promise<MovieDetail> {
    if (!movieId) {
        throw new Error("Movie ID is required to fetch movie details");
    }

    try {
        const url = `${API_URL}/api/public/movies/${movieId}`;

        const params = userId ? { userId } : {};

        const response = await axios.get(url, { params });
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching details for movie ID ${movieId}:`, error);
        throw error;
    }
}

/**
 * Fetches list of all countries available for movie filtering and categorization.
 * @returns Promise<Array<{id: string, name: string, slug: string}>> - List of countries.
 */
export async function getCountries() {
    try {
        const url = `${API_URL}/api/public/countries`;
        const response = await axios.get(url);

        return response.data.data;
    } catch (error) {
        console.error("Error fetching countries:", error);
        throw error;
    }
}

/**
 * Fetches list of all genres available for movie filtering and categorization.
 * @returns Promise<MovieGenre[]> - List of genres.
 */
export async function getGenres(): Promise<MovieGenre[]> {
    try {
        const url = `${API_URL}/api/public/genres`;
        const response = await axios.get(url);

        return response.data.data;
    } catch (error) {
        console.error("Error fetching genres:", error);
        throw error;
    }
}

/**
 * Fetches list of all types available for movie filtering and categorization.
 * @returns Promise<MovieType[]> - List of types.
 */
export async function getTypes(): Promise<MovieType[]> {
    try {
        const url = `${API_URL}/api/public/types`;
        const response = await axios.get(url);

        return response.data.data;
    } catch (error) {
        console.error("Error fetching types:", error);
        throw error;
    }
}

interface FilterParams {
    typeId?: string;
    genreIds?: string[];
    countryId?: string;
    startYear?: number;
    endYear?: number;
    name?: string;
    contentSearch?: string;
    page?: number;
    limit?: number;
}

interface FilterResponse {
    data: MovieBase[];
    pagination: {
        currentPage: number;
        limit: number;
        totalPages: number;
        totalCount: number;
    };
}

/**
 * Fetches movies with filtering and pagination using POST request.
 * Supports metadata filtering and semantic content search.
 * @param params - Filter, search, and pagination parameters
 * @returns Promise with filtered movies and pagination data
 */
export async function getFilteredMovies(
    params: FilterParams = {}
): Promise<FilterResponse> {
    try {
        const requestBody: FilterParams = {
            page: 1,
            limit: 20, // Default limit
            ...params,
        };

        // Ensure limit does not exceed max
        if (requestBody.limit && requestBody.limit > 100) {
            console.warn("Requested limit exceeds maximum (100). Setting limit to 100.");
            requestBody.limit = 100;
        }

        const url = `${API_URL}/api/public/filter`;
        const response = await axios.post(url, requestBody);

        return response.data;
    } catch (error) {
        console.error("Error fetching filtered movies:", error);

        if (axios.isAxiosError(error)) {
            if (error.response?.status === 400) {
                console.error("Bad request:", error.response.data);
            } else if (error.response?.status === 500) {
                console.error("Internal server error:", error.response.data);
            }
        }
        throw error; // Re-throw the error after logging
    }
}
