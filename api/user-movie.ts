import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type InteractionType = "LIKE" | "DISLIKE" | "RATE" | "VIEW";

export interface MovieInteraction {
    id: string;
    userId: string;
    movieId: string;
    interactionType: InteractionType;
    rating: number | null;
    timestamp: string;
}

interface InteractionResponse {
    success: boolean;
    interaction: MovieInteraction | null;
}

/**
 * Records a user's interaction with a movie (like, dislike, rate, view)
 *
 * @param userId - The ID of the user performing the interaction
 * @param movieId - The ID of the movie being interacted with
 * @param interactionType - The type of interaction (LIKE, DISLIKE, RATE, VIEW)
 * @param rating - Optional rating value (0-5), required when interactionType is RATE
 * @returns Promise with the created/updated interaction data or null
 */
export async function postUserInteraction(
    userId: string,
    movieId: string,
    interactionType: InteractionType,
    rating?: number
): Promise<InteractionResponse> {
    try {
        if (!userId) throw new Error("User ID is required");
        if (!movieId) throw new Error("Movie ID is required");
        if (!interactionType) throw new Error("Interaction type is required");

        if (
            interactionType === "RATE" &&
            (rating === undefined || rating < 0 || rating > 5)
        ) {
            throw new Error(
                "Rating value (0-5) is required for RATE interactions"
            );
        }

        const payload: {
            userId: string;
            movieId: string;
            interactionType: InteractionType;
            rating?: number;
        } = {
            userId,
            movieId,
            interactionType,
        };

        if (interactionType === "RATE") {
            payload.rating = rating;
        }

        const response = await axios.post<InteractionResponse>(
            `${API_URL}/api/public/user-movie/interaction`,
            payload
        );

        return response.data;
    } catch (error: any) {
        if (error.response) {
            const status = error.response.status;
            const message =
                error.response.data?.error ||
                error.response.data?.details ||
                "Unknown API error";

            console.error(`API Error (${status}): ${message}`);
            throw new Error(`API Error (${status}): ${message}`);
        } else if (error.request) {
            console.error("No response received:", error.request);
            throw new Error("No response received from server");
        } else {
            console.error("Request setup error:", error.message);
            throw error;
        }
    }
}
