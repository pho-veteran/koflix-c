import auth from "@react-native-firebase/auth";
import { formatPhoneNumber, isEmail, isPhone } from "./validation";

// Add proper type for user
export type FirebaseUser = ReturnType<typeof auth>["currentUser"];

// Auth state listener
export const onAuthStateChanged = (callback: (user: any) => void) => {
    return auth().onAuthStateChanged(callback);
};

// Sign up with email and password (renamed for consistency)
export const signUpWithEmailAndPassword = async (
    email: string,
    password: string,
    displayName?: string
) => {
    try {
        const userCredential = await auth().createUserWithEmailAndPassword(
            email,
            password
        );

        // Update profile if display name is provided
        if (displayName && userCredential.user) {
            await userCredential.user.updateProfile({
                displayName,
            });
        }

        return userCredential.user;
    } catch (error: any) {
        throw error;
    }
};

// Enhanced sign up function that handles both email and phone
export const signUpUser = async (
    emailOrPhone: string,
    password: string,
    displayName?: string
) => {
    try {
        let userCredential;

        if (isEmail(emailOrPhone)) {
            // Email signup
            userCredential = await auth().createUserWithEmailAndPassword(
                emailOrPhone,
                password
            );
        } else {
            // This should be handled differently - phone signup requires a verification code flow
            throw new Error(
                "Đăng ký với số điện thoại cần thiết lập xác thực OTP"
            );
        }

        // Update profile if display name is provided
        if (displayName && userCredential.user) {
            await userCredential.user.updateProfile({
                displayName,
            });
        }

        return userCredential.user;
    } catch (error: any) {
        throw error;
    }
};

// Sửa hàm signInWithEmailAndPassword để xử lý cả email và số điện thoại

export const signInWithEmailAndPassword = async (
    emailOrPhone: string,
    password: string
) => {
    try {
        // Không nên log thông tin đăng nhập, nhất là mật khẩu!
        // console.log("Logging in with email:", email, password); <- XÓA DÒNG NÀY

        if (isEmail(emailOrPhone)) {
            // Đăng nhập bằng email
            const userCredential = await auth().signInWithEmailAndPassword(
                emailOrPhone,
                password
            );
            return userCredential.user;
        } else if (isPhone(emailOrPhone)) {
            // Đối với số điện thoại, Firebase yêu cầu luồng xác thực OTP
            throw {
                code: "auth/operation-not-allowed",
                message:
                    'Để đăng nhập bằng số điện thoại, bạn cần xác thực qua OTP. Vui lòng sử dụng nút "Quên mật khẩu".',
            };
        } else {
            throw {
                code: "auth/invalid-credential",
                message: "Email hoặc số điện thoại không hợp lệ.",
            };
        }
    } catch (error: any) {
        console.error("Login error:", error.code, error.message);
        throw error;
    }
};

// Sign out
export const signOut = async () => {
    try {
        await auth().signOut();
    } catch (error: any) {
        throw error;
    }
};

// Sửa hàm sendPasswordResetEmail để chỉ chấp nhận email

export const sendPasswordResetEmail = async (email: string) => {
    try {
        if (!isEmail(email)) {
            throw {
                code: "auth/invalid-email",
                message:
                    "Vui lòng nhập một địa chỉ email hợp lệ để đặt lại mật khẩu.",
            };
        }

        await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
        console.error("Reset password error:", error.code, error.message);
        throw error;
    }
};

// Send email verification
export const sendEmailVerification = async () => {
    try {
        const currentUser = auth().currentUser;
        if (currentUser) {
            await currentUser.sendEmailVerification();
        } else {
            throw new Error("Không có người dùng nào đang đăng nhập");
        }
    } catch (error: any) {
        throw error;
    }
};

// Get current user
export const getCurrentUser = () => {
    return auth().currentUser;
};

// Cải thiện xác thực OTP
export const verifyOTP = async (verificationId: string, code: string) => {
    try {
        // Kiểm tra mã OTP
        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            throw {
                code: "auth/invalid-verification-code",
                message: "Mã xác thực phải gồm 6 chữ số.",
            };
        }

        // Xác thực mã OTP
        const credential = auth.PhoneAuthProvider.credential(
            verificationId,
            code
        );
        return await auth().signInWithCredential(credential);
    } catch (error: any) {
        console.error("Lỗi xác thực OTP:", error.code, error.message);

        // Xử lý lỗi phù hợp
        if (error.code === "auth/invalid-verification-code") {
            throw {
                code: error.code,
                message:
                    "Mã xác thực không đúng. Vui lòng kiểm tra và thử lại.",
            };
        } else if (error.code === "auth/code-expired") {
            throw {
                code: error.code,
                message: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.",
            };
        }

        throw error;
    }
};

// Check if user is logged in
export const isUserLoggedIn = () => {
    return !!auth().currentUser;
};

// Hàm startPhoneAuth đã được cập nhật, chỉ cần kiểm tra

export const startPhoneAuth = async (phoneNumber: string) => {
    try {
        // Kiểm tra tính hợp lệ của số điện thoại
        if (!isPhone(phoneNumber)) {
            throw {
                code: "auth/invalid-phone-number",
                message:
                    "Số điện thoại không đúng định dạng. Vui lòng kiểm tra lại.",
            };
        }

        // Định dạng số điện thoại theo chuẩn E.164
        const formattedPhone = formatPhoneNumber(phoneNumber);

        // Log để debug - có thể xóa trong sản phẩm cuối cùng
        console.log(
            `Đang xác thực số điện thoại: ${phoneNumber} -> ${formattedPhone}`
        );

        // Gọi API Firebase để gửi mã xác thực
        const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
        return confirmation;
    } catch (error: any) {
        console.error("Lỗi xác thực số điện thoại:", error.code, error.message);

        // Xử lý các lỗi phổ biến liên quan đến số điện thoại
        if (error.code === "auth/invalid-phone-number") {
            throw {
                code: error.code,
                message: "Số điện thoại không đúng định dạng quốc tế.",
            };
        } else if (
            error.code === "auth/quota-exceeded" ||
            error.code === "auth/too-many-requests"
        ) {
            throw {
                code: error.code,
                message: "Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.",
            };
        }

        throw error;
    }
};

// Thêm hàm cập nhật mật khẩu

export const updateUserPassword = async (newPassword: string) => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            throw new Error("Không có người dùng nào đang đăng nhập");
        }

        await currentUser.updatePassword(newPassword);
    } catch (error: any) {
        console.error("Update password error:", error.code, error.message);
        throw error;
    }
};