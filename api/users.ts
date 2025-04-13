import axios from "axios";
import { User } from "@/types/user";

// API base URL - should be stored in environment variables in production
const API_URL = process.env.EXPO_PUBLIC_API_URL; // Replace with your actual backend URL

/**
 * Get user details from the backend
 * @param uid Firebase user ID
 * @returns User data from the backend
 */
export async function getUserDetail(uid: string): Promise<User | null> {
    console.log("Fetching user details for UID:", uid);
    try {
        const response = await axios.post(`${API_URL}/api/public/user/get-user`, {
            uid,
        });

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
 * @param uid Firebase user ID
 * @param userData User data to update
 * @returns Updated user data
 */
export async function createOrUpdateUser(
    uid: string,
    userData: { name?: string; emailOrPhone?: string }
): Promise<User | null> {
    try {
        const response = await axios.post(
            `${API_URL}/api/public/user/create-user`,
            {
                uid,
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
