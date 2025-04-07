import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { formatPhoneNumber, isEmail, isPhone } from "./validation";
import { getFirebaseErrorMessage } from "./error-handling";

// Proper type for user
export type FirebaseUser = FirebaseAuthTypes.User | null;

// Common error and result response format
export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

// Auth state listener with better typing
export const onAuthStateChanged = (
  callback: (user: FirebaseUser) => void
) => {
  return auth().onAuthStateChanged(callback);
};

// Sign up with email and password
export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult<FirebaseAuthTypes.User>> => {
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

    return { success: true, data: userCredential.user };
  } catch (error: any) {
    // Format error for consistency
    console.error("Email signup error:", error.code, error.message);
    return {
      success: false,
      error: {
        code: error.code || "auth/unknown-error",
        message: getFirebaseErrorMessage(error)
      }
    };
  }
};

// Enhanced sign up function that handles both email and phone
export const signUpUser = async (
    emailOrPhone: string,
    password: string,
    displayName?: string
): Promise<AuthResult<FirebaseAuthTypes.User>> => {
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
            return {
                success: false,
                error: {
                    code: "auth/phone-requires-verification",
                    message: "Đăng ký với số điện thoại cần thiết lập xác thực OTP"
                }
            };
        }

        // Update profile if display name is provided
        if (displayName && userCredential.user) {
            await userCredential.user.updateProfile({
                displayName,
            });
        }

        return { success: true, data: userCredential.user };
    } catch (error: any) {
        return { 
            success: false, 
            error: { 
                code: error.code || "auth/unknown-error", 
                message: getFirebaseErrorMessage(error)
            } 
        };
    }
};

// Sign in with email and password
export const signInWithEmailAndPassword = async (
  emailOrPhone: string,
  password: string
): Promise<AuthResult<FirebaseAuthTypes.User>> => {
  try {
    if (isEmail(emailOrPhone)) {
      // Đăng nhập bằng email
      const userCredential = await auth().signInWithEmailAndPassword(
        emailOrPhone,
        password
      );
      return { success: true, data: userCredential.user };
    } else if (isPhone(emailOrPhone)) {
      // Đối với số điện thoại, Firebase yêu cầu luồng xác thực OTP
      return {
        success: false,
        error: {
          code: "auth/phone-auth-required",
          message: 'Để đăng nhập bằng số điện thoại, bạn cần xác thực qua OTP. Vui lòng sử dụng nút "Quên mật khẩu".',
        }
      };
    } else {
      return {
        success: false,
        error: {
          code: "auth/invalid-credential",
          message: "Email hoặc số điện thoại không hợp lệ.",
        }
      };
    }
  } catch (error: any) {
    console.error("Login error:", error.code, error.message);
    return { 
      success: false, 
      error: { 
        code: error.code || "auth/unknown-error", 
        message: getFirebaseErrorMessage(error)
      } 
    };
  }
};

// Sign out
export const signOut = async (): Promise<AuthResult<void>> => {
    try {
        await auth().signOut();
        return { success: true };
    } catch (error: any) {
        return { 
            success: false, 
            error: { 
                code: error.code || "auth/sign-out-error", 
                message: getFirebaseErrorMessage(error)
            } 
        };
    }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string): Promise<AuthResult<void>> => {
  try {
    if (!isEmail(email)) {
      return {
        success: false,
        error: {
          code: "auth/invalid-email",
          message: "Vui lòng nhập một địa chỉ email hợp lệ để đặt lại mật khẩu.",
        }
      };
    }

    await auth().sendPasswordResetEmail(email);
    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error.code, error.message);
    return { 
      success: false, 
      error: { 
        code: error.code || "auth/unknown-error", 
        message: getFirebaseErrorMessage(error)
      } 
    };
  }
};

// Send email verification
export const sendEmailVerification = async (): Promise<AuthResult<void>> => {
    try {
        const currentUser = auth().currentUser;
        if (currentUser) {
            await currentUser.sendEmailVerification();
            return { success: true };
        } else {
            return { 
                success: false, 
                error: { 
                    code: "auth/no-current-user", 
                    message: "Không có người dùng nào đang đăng nhập" 
                } 
            };
        }
    } catch (error: any) {
        return { 
            success: false, 
            error: { 
                code: error.code || "auth/verification-error", 
                message: getFirebaseErrorMessage(error)
            } 
        };
    }
};

// Get current user
export const getCurrentUser = () => {
    return auth().currentUser;
};

// Cải thiện xác thực OTP
export const verifyOTP = async (verificationId: string, code: string): Promise<AuthResult<FirebaseAuthTypes.UserCredential>> => {
    try {
        // Kiểm tra mã OTP
        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            return {
                success: false,
                error: {
                    code: "auth/invalid-verification-code",
                    message: "Mã xác thực phải gồm 6 chữ số.",
                }
            };
        }

        // Xác thực mã OTP
        const credential = auth.PhoneAuthProvider.credential(
            verificationId,
            code
        );
        const result = await auth().signInWithCredential(credential);
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Lỗi xác thực OTP:", error.code, error.message);
        return { 
            success: false, 
            error: { 
                code: error.code || "auth/verification-error", 
                message: getFirebaseErrorMessage(error)
            } 
        };
    }
};

// Check if user is logged in
export const isUserLoggedIn = () => {
    return !!auth().currentUser;
};

// Phone authentication
export const startPhoneAuth = async (phoneNumber: string): Promise<AuthResult<FirebaseAuthTypes.ConfirmationResult>> => {
    try {
        // Kiểm tra tính hợp lệ của số điện thoại
        if (!isPhone(phoneNumber)) {
            return {
                success: false,
                error: {
                    code: "auth/invalid-phone-number",
                    message: "Số điện thoại không đúng định dạng. Vui lòng kiểm tra lại.",
                }
            };
        }

        // Định dạng số điện thoại theo chuẩn E.164
        const formattedPhone = formatPhoneNumber(phoneNumber);

        // Log để debug - có thể xóa trong sản phẩm cuối cùng
        console.log(`Đang xác thực số điện thoại: ${phoneNumber} -> ${formattedPhone}`);

        // Gọi API Firebase để gửi mã xác thực
        const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
        return { success: true, data: confirmation };
    } catch (error: any) {
        console.error("Lỗi xác thực số điện thoại:", error.code, error.message);
        return {
            success: false,
            error: { 
                code: error.code || "auth/unknown-error", 
                message: getFirebaseErrorMessage(error)
            }
        };
    }
};

// Update user password
export const updateUserPassword = async (newPassword: string): Promise<AuthResult<void>> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            return {
                success: false,
                error: {
                    code: "auth/no-current-user",
                    message: "Không có người dùng nào đang đăng nhập"
                }
            };
        }

        await currentUser.updatePassword(newPassword);
        return { success: true };
    } catch (error: any) {
        console.error("Update password error:", error.code, error.message);
        return {
            success: false,
            error: { 
                code: error.code || "auth/unknown-error", 
                message: getFirebaseErrorMessage(error)
            }
        };
    }
};