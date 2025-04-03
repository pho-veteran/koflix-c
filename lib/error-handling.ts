// Create a new file for error handling

type FirebaseErrorMapping = {
  [key: string]: string;
};

// Map Firebase error codes to user-friendly messages
const firebaseErrorMessages: FirebaseErrorMapping = {
  // Existing error codes
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
  
  // Additional error codes
  'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.',
  'auth/requires-recent-login': 'Thao tác này cần đăng nhập lại. Vui lòng đăng xuất và đăng nhập lại.',
  'auth/account-exists-with-different-credential': 'Tài khoản đã tồn tại với phương thức đăng nhập khác.',
  'auth/cancelled-popup-request': 'Yêu cầu popup đã bị hủy.',
  'auth/popup-blocked': 'Popup đã bị chặn bởi trình duyệt.',
  'auth/popup-closed-by-user': 'Popup đã bị đóng bởi người dùng.',
  'auth/unauthorized-domain': 'Tên miền không được ủy quyền.',
  'auth/invalid-action-code': 'Mã hành động không hợp lệ.',
  'auth/expired-action-code': 'Mã hành động đã hết hạn.',
};

// Get user-friendly message from Firebase error
export const getFirebaseErrorMessage = (error: any): string => {
  const errorCode = error.code;
  if (errorCode && firebaseErrorMessages[errorCode]) {
    return firebaseErrorMessages[errorCode];
  }
  return error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
};

// Use this function in all try/catch blocks
export const handleAuthError = (error: any): string => {
  console.error(error);
  return getFirebaseErrorMessage(error);
};