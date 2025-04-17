import axios from "axios";
import { User } from "@/types/user";
import { getIdToken } from "@/lib/firebase-auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Get user details from the backend using Firebase ID token
 * @returns User data from the backend or null if not found/error
 */
export async function getUserDetail(): Promise<User | null> {
    try {
        // Get the Firebase ID token
        const tokenResult = await getIdToken(true);
        
        if (!tokenResult.success || !tokenResult.data) {
            console.error("Failed to get ID token:", tokenResult.error?.message);
            return null;
        }
        
        // Send the ID token to the backend
        const response = await axios.post(
            `${API_URL}/api/public/user/get-user`,
            {
                idToken: tokenResult.data
            }
        );

        if (response.data?.user) {
            return response.data.user;
        }
        return null;
    } catch (error) {
        console.error("Error fetching user details:", error);
        return null;
    }
}

/**
 * Create or update user in the backend
 * @param userData User data to update
 * @returns Updated user data
 */
export async function createOrUpdateUser(
    userData: { name?: string; emailOrPhone?: string }
): Promise<User | null> {
    try {
        const tokenResult = await getIdToken(true);
        
        if (!tokenResult.success || !tokenResult.data) {
            console.error("Failed to get ID token:", tokenResult.error?.message);
            return null;
        }
        
        const response = await axios.post(
            `${API_URL}/api/public/user/create-user`,
            {
                idToken: tokenResult.data,
                ...userData,
            }
        );

        if (response.data?.user) {
            return response.data.user;
        }
        return null;
    } catch (error) {
        console.error("Error updating user:", error);
        return null;
    }
}
