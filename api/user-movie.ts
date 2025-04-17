import axios from "axios";
import { Comment, Reply, MovieInteraction, InteractionType } from "@/types/user-movie-type";
import { getIdToken } from "@/lib/firebase-auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface InteractionResponse {
    success: boolean;
    interaction: MovieInteraction | null;
}

/**
 * Records a user's interaction with a movie (like, dislike, rate, view) using Firebase ID token.
 *
 * @param movieId - The ID of the movie being interacted with
 * @param interactionType - The type of interaction (LIKE, DISLIKE, RATE, VIEW)
 * @param rating - Optional rating value (0-5), required when interactionType is RATE
 * @returns Promise with the created/updated interaction data or null
 */
export async function postUserInteraction(
    movieId: string,
    interactionType: InteractionType,
    rating?: number
): Promise<InteractionResponse> {
    try {
        // Get authentication token
        const tokenResult = await getIdToken(true);

        if (!tokenResult.success || !tokenResult.data) {
            console.error("Failed to get ID token for interaction:", tokenResult.error?.message);
            throw new Error("Authentication required to perform this action.");
        }

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
        if (interactionType !== "RATE" && rating !== undefined) {
            throw new Error("Rating should only be provided for RATE interactions");
        }

        const payload: {
            idToken: string;
            movieId: string;
            interactionType: InteractionType;
            rating?: number;
        } = {
            idToken: tokenResult.data,
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
        let errorMessage = "An unexpected error occurred during interaction.";
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const status = error.response.status;
                const apiError = error.response.data?.error || error.response.data?.message || "Unknown API error";
                errorMessage = `API Error (${status}): ${apiError}`;
                console.error(`API Error (${status}):`, error.response.data);
            } else if (error.request) {
                errorMessage = "No response received from server. Check network connection.";
                console.error("No response received:", error.request);
            } else {
                errorMessage = `Request setup error: ${error.message}`;
                console.error("Request setup error:", error.message);
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
            console.error("Interaction pre-request error:", error.message);
        } else {
            console.error("Unexpected error type:", error);
        }
        return { success: false, interaction: null };
    }
}

/**
 * Create a new comment for a movie or episode
 * @param content The text content of the comment
 * @param movieId The ID of the movie (required if episodeId is not provided)
 * @param episodeId The ID of the episode (required if movieId is not provided)
 * @returns The newly created comment
 */
export async function createComment(
  content: string,
  movieId?: string,
  episodeId?: string
): Promise<Comment | null> {
  try {
    if (!content.trim()) {
      throw new Error("Comment content cannot be empty");
    }
    
    if (!movieId && !episodeId) {
      throw new Error("Either movieId or episodeId must be provided");
    }
    
    const tokenResult = await getIdToken(true);
    
    if (!tokenResult.success || !tokenResult.data) {
      console.error("Failed to get ID token:", tokenResult.error?.message);
      return null;
    }
    
    const response = await axios.post(
      `${API_URL}/api/public/user-movie/comments`,
      {
        idToken: tokenResult.data,
        content,
        movieId,
        episodeId
      }
    );
    
    return response.data.comment;
  } catch (error) {
    console.error("Error creating comment:", error);
    return null;
  }
}

/**
 * Fetch comments for a movie or episode
 * @param options Options for fetching comments
 * @returns Comments and pagination data
 */
export async function getComments(options: {
  movieId?: string;
  episodeId?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Comment[]; pagination: any } | null> {
  try {
    if (!options.movieId && !options.episodeId) {
      throw new Error("Either movieId or episodeId must be provided");
    }
    
    const params = {
      movieId: options.movieId,
      episodeId: options.episodeId,
      page: options.page || 1,
      limit: options.limit || 15
    };
    
    const response = await axios.get(
      `${API_URL}/api/public/user-movie/comments`,
      { params }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return null;
  }
}

/**
 * Create a reply to a comment
 * @param content The text content of the reply
 * @param commentId The ID of the parent comment
 * @returns The newly created reply
 */
export async function createReply(
  content: string,
  commentId: string
): Promise<Reply | null> {
  try {
    if (!content.trim()) {
      throw new Error("Reply content cannot be empty");
    }
    
    if (!commentId) {
      throw new Error("Comment ID must be provided");
    }
    
    // Get authentication token
    const tokenResult = await getIdToken(true);
    
    if (!tokenResult.success || !tokenResult.data) {
      console.error("Failed to get ID token:", tokenResult.error?.message);
      return null;
    }
    
    const response = await axios.post(
      `${API_URL}/api/public/user-movie/replies`,
      {
        idToken: tokenResult.data,
        content,
        commentId
      }
    );
    
    return response.data.reply;
  } catch (error) {
    console.error("Error creating reply:", error);
    return null;
  }
}

/**
 * Fetch replies for a specific comment
 * @param commentId The ID of the parent comment
 * @param page Page number for pagination
 * @param limit Number of replies per page
 * @returns Replies and pagination data
 */
export async function getReplies(
  commentId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: Reply[]; pagination: any } | null> {
  try {
    if (!commentId) {
      throw new Error("Comment ID must be provided");
    }
    
    const params = {
      commentId,
      page,
      limit
    };
    
    const response = await axios.get(
      `${API_URL}/api/public/user-movie/replies`,
      { params }
    );
    
    return response.data;
  } catch (error) {
    console.error("Error fetching replies:", error);
    return null;
  }
}