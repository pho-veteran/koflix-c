import axios from "axios";
import { User } from "@/types/user-type";
import { getIdToken } from "@/lib/firebase-auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Get user details from the backend using Firebase ID token
 * @returns User data from the backend or null if not found/error
 */
export async function getUserDetail(): Promise<User | null> {
    try {
        const tokenResult = await getIdToken(true);

        if (!tokenResult.success || !tokenResult.data) {
            console.error(
                "Failed to get ID token:",
                tokenResult.error?.message
            );
            return null;
        }

        const response = await axios.post(
            `${API_URL}/api/public/user/get-user`,
            {
                idToken: tokenResult.data,
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
export async function createOrUpdateUser(userData: {
    name?: string;
    emailOrPhone?: string;
}): Promise<User | null> {
    try {
        const tokenResult = await getIdToken(true);

        if (!tokenResult.success || !tokenResult.data) {
            console.error(
                "Failed to get ID token:",
                tokenResult.error?.message
            );
            return null;
        }

        // Ensure name is not empty
        if (!userData.name) {
            console.warn("No name provided for user creation/update");

            userData.name = "User";
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

/**
 * Update user profile (name and/or avatar)
 * @param params { name?: string; image?: any }
 * @returns Updated user data or null on error
 */
export async function updateUserProfile(params: {
    name?: string;
    image?: any;
}): Promise<User | null> {
    try {
        const tokenResult = await getIdToken(true);
        if (!tokenResult.success || !tokenResult.data) {
            console.error(
                "Failed to get ID token:",
                tokenResult.error?.message
            );
            return null;
        }

        const formData = new FormData();
        formData.append("idToken", tokenResult.data);

        if (params.name) {
            formData.append("name", params.name);
        }
        if (params.image) {
            formData.append("image", {
                uri: params.image.uri,
                name: params.image.name || "avatar.jpg",
                type: params.image.type || "image/jpeg",
            } as any);
        }

        const response = await axios.post(
            `${API_URL}/api/public/user/profile`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Accept: "application/json",
                },
                transformRequest: (data) => data,
            }
        );

        if (response.data?.success && response.data.user) {
            return response.data.user;
        }
        return null;
    } catch (error) {
        console.error("Error updating user profile:", error);
        if (axios.isAxiosError(error)) {
            console.error("Response data:", error.response?.data);
            console.error("Response status:", error.response?.status);
        }
        return null;
    }
}
