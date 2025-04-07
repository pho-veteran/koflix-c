// Create a new file for error handling

type FirebaseErrorMapping = {
  [key: string]: string;
};

// Map Firebase error codes to user-friendly messages
const firebaseErrorMessages: FirebaseErrorMapping = {
  // Authentication errors
  'auth/email-already-in-use': 'Email này đã được sử dụng bởi một tài khoản khác.',
  'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
  'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa.',
  'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
  'auth/wrong-password': 'Mật khẩu không chính xác.',
  'auth/invalid-credential': 'Thông tin đăng nhập không hợp lệ.',
  'auth/operation-not-allowed': 'Thao tác này không được cho phép.',
  'auth/weak-password': 'Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.',
  'auth/too-many-requests': 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  'auth/invalid-phone-number': 'Số điện thoại không hợp lệ.',
  'auth/invalid-verification-code': 'Mã xác thực không hợp lệ.',
  'auth/missing-phone-number': 'Thiếu số điện thoại.',
  'auth/quota-exceeded': 'Đã vượt quá giới hạn tin nhắn SMS.',
  'auth/captcha-check-failed': 'Kiểm tra captcha thất bại.',
  'auth/missing-verification-code': 'Thiếu mã xác thực.',
  'auth/invalid-verification-id': 'ID xác thực không hợp lệ.',
  'auth/code-expired': 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.',
  'auth/requires-recent-login': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để thực hiện thao tác này.',
  'auth/provider-already-linked': 'Tài khoản đã được liên kết với phương thức này.',
  'auth/credential-already-in-use': 'Thông tin đăng nhập đã được sử dụng bởi một tài khoản khác.',
  'auth/phone-number-already-exists': 'Số điện thoại này đã được sử dụng bởi một tài khoản khác.',
  'auth/invalid-continue-uri': 'URL tiếp tục không hợp lệ.',
  'auth/unauthorized-continue-uri': 'URL tiếp tục không được phép.',
  'auth/missing-continue-uri': 'Thiếu URL tiếp tục.',
  'auth/unsupported-first-factor': 'Phương thức đăng nhập không được hỗ trợ.',
  'auth/maximum-second-factor-count-exceeded': 'Số lượng phương thức xác thực vượt quá giới hạn.',
  'auth/second-factor-already-in-use': 'Phương thức xác thực đã được sử dụng.',
  'auth/verification-server-timeout': 'Hết thời gian phản hồi từ máy chủ xác thực.',
  'auth/phone-auth-required': 'Để đăng nhập bằng số điện thoại, bạn cần xác thực qua OTP. Vui lòng sử dụng nút "Quên mật khẩu".',
  'auth/phone-requires-verification': 'Đăng ký với số điện thoại cần thiết lập xác thực OTP.',
  'auth/no-current-user': 'Không có người dùng nào đang đăng nhập.',
  'auth/sign-out-error': 'Không thể đăng xuất. Vui lòng thử lại.',
  'auth/unknown-error': 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
  'auth/verification-error': 'Không thể gửi email xác thực.',
  
  // Network errors
  'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.',
  
  // Popup/redirect errors
  'auth/cancelled-popup-request': 'Yêu cầu popup đã bị hủy.',
  'auth/popup-blocked': 'Popup đã bị chặn bởi trình duyệt.',
  'auth/popup-closed-by-user': 'Popup đã bị đóng bởi người dùng.',
  'auth/unauthorized-domain': 'Tên miền không được ủy quyền.',
  
  // Action code errors
  'auth/invalid-action-code': 'Mã hành động không hợp lệ.',
  'auth/expired-action-code': 'Mã hành động đã hết hạn.',
  'auth/account-exists-with-different-credential': 'Tài khoản đã tồn tại với phương thức đăng nhập khác.',
};

// Get user-friendly message from Firebase error
export const getFirebaseErrorMessage = (error: any): string => {
  // If error is just a string, return it
  if (typeof error === 'string') {
    return error;
  }
  
  // Otherwise try to extract error code and message
  const errorCode = error.code;
  if (errorCode && firebaseErrorMessages[errorCode]) {
    return firebaseErrorMessages[errorCode];
  }
  
  // If no matching error code found, return the error message or a generic fallback
  return error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
};

// Create a formatted error object
export const createAuthError = (error: any): { code: string; message: string } => {
  return {
    code: error.code || 'auth/unknown-error',
    message: getFirebaseErrorMessage(error)
  };
};

// Helper function to handle auth errors in one line
export const handleAuthError = (error: any): { code: string; message: string } => {
  console.error('Auth error:', error);
  return createAuthError(error);
};