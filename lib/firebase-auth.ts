import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { formatPhoneNumber, isEmail, isPhone } from "./validation";
import { getFirebaseErrorMessage } from "./error-handling";

export type FirebaseUser = FirebaseAuthTypes.User | null;

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthResult<T> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

export const onAuthStateChanged = (
  callback: (user: FirebaseUser) => void
) => {
  return auth().onAuthStateChanged(callback);
};

export const signUpWithEmailAndPassword = async (
  email: string,
  password: string,
  name: string,
): Promise<AuthResult<{user: FirebaseAuthTypes.User, name: string}>> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password
    );

    return { success: true, data: {user: userCredential.user, name} };
  } catch (error: any) {
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

export const signUpUser = async (
    emailOrPhone: string,
    password: string,
): Promise<AuthResult<FirebaseAuthTypes.User>> => {
    try {
        let userCredential;

        if (isEmail(emailOrPhone)) {
            userCredential = await auth().createUserWithEmailAndPassword(
                emailOrPhone,
                password
            );
        } else {
            return {
                success: false,
                error: {
                    code: "auth/phone-requires-verification",
                    message: "Đăng ký với số điện thoại cần thiết lập xác thực OTP"
                }
            };
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
        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            return {
                success: false,
                error: {
                    code: "auth/invalid-verification-code",
                    message: "Mã xác thực phải gồm 6 chữ số.",
                }
            };
        }

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
        if (!isPhone(phoneNumber)) {
            return {
                success: false,
                error: {
                    code: "auth/invalid-phone-number",
                    message: "Số điện thoại không đúng định dạng. Vui lòng kiểm tra lại.",
                }
            };
        }

        const formattedPhone = formatPhoneNumber(phoneNumber);

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

// Get ID Token for the current user
export const getIdToken = async (forceRefresh: boolean = false): Promise<AuthResult<string>> => {
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
            return {
                success: false,
                error: {
                    code: "auth/no-current-user",
                    message: "Không có người dùng nào đang đăng nhập để lấy ID token."
                }
            };
        }

        const idToken = await currentUser.getIdToken(forceRefresh);
        return { success: true, data: idToken };
    } catch (error: any) {
        console.error("Get ID Token error:", error.code, error.message);
        return {
            success: false,
            error: {
                code: error.code || "auth/get-id-token-failed",
                message: getFirebaseErrorMessage(error) || "Không thể lấy ID token."
            }
        };
    }
};