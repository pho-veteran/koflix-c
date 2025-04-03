import { z } from "zod";

// Email regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Regex số điện thoại quốc tế
// Chấp nhận các định dạng:
// +84123456789, 84123456789, 0123456789, +84 123 456 789, v.v.
const phoneRegex = /^(\+?[0-9]{1,4})?[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})$/;

// Kiểm tra email
export const isEmail = (value: string): boolean => {
  return emailRegex.test(value);
};

// Kiểm tra số điện thoại
export const isPhone = (value: string): boolean => {
  // Loại bỏ dấu cách để dễ kiểm tra
  const cleaned = value.trim();
  return phoneRegex.test(cleaned);
};

// Validator cho email hoặc số điện thoại
export const emailOrPhoneValidator = z.string().refine(
  (value) => {
    return isEmail(value) || isPhone(value);
  },
  {
    message: "Vui lòng nhập email hoặc số điện thoại hợp lệ",
  }
);

// Định dạng số điện thoại theo chuẩn E.164 (+xxxxxxxxxxxx)
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Loại bỏ tất cả ký tự không phải số
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Nếu bắt đầu bằng '0', giả định là số nội địa và thêm +84 (Việt Nam)
  if (digits.startsWith('0')) {
    return '+84' + digits.substring(1);
  }
  
  // Nếu đã có mã quốc gia 2-3 chữ số nhưng không có dấu +
  // Ví dụ: 84xxxx -> +84xxxx, 1xxxxx -> +1xxxxx
  if (digits.length >= 9 && !phoneNumber.startsWith('+')) {
    // Kiểm tra 2 chữ số đầu tiên - hầu hết mã quốc gia là 1-3 chữ số
    if (/^[1-9][0-9]/.test(digits)) {
      return '+' + digits;
    }
  }
  
  // Nếu đã có dấu + ở đầu, giữ nguyên
  if (phoneNumber.startsWith('+')) {
    return '+' + digits;
  }
  
  // Mặc định thêm +, có thể điều chỉnh logic này tùy vào ứng dụng
  return '+' + digits;
};

// Password strength validator
export const passwordStrengthValidator = z.string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
  );

// Email validator
export const emailValidator = z.string()
  .refine((value) => emailRegex.test(value), {
    message: "Địa chỉ email không hợp lệ",
  });

// Phone validator
export const phoneValidator = z.string()
  .refine((value) => isPhone(value), {
    message: "Số điện thoại không hợp lệ",
  });

// Lấy định dạng số điện thoại đẹp để hiển thị
export const getPrettyPhoneNumber = (phoneNumber: string): string => {
  // Nếu đã là định dạng E.164, định dạng lại để dễ đọc
  const formatted = formatPhoneNumber(phoneNumber);
  const digits = formatted.replace(/\D/g, '');
  
  // Nếu có mã quốc gia
  if (formatted.startsWith('+')) {
    // Lấy 1-3 ký tự đầu tiên làm mã quốc gia (tùy thuộc vào độ dài)
    const countryCode = digits.substring(0, Math.min(3, Math.max(1, digits.length - 9)));
    const restOfNumber = digits.substring(countryCode.length);
    
    // Định dạng như +xx xxx xxx xxx
    let result = '+' + countryCode;
    for (let i = 0; i < restOfNumber.length; i += 3) {
      result += ' ' + restOfNumber.substring(i, Math.min(i + 3, restOfNumber.length));
    }
    return result;
  }
  
  // Nếu không xác định được mã quốc gia, trả về định dạng xxx xxx xxx
  let result = '';
  for (let i = 0; i < digits.length; i += 3) {
    if (i > 0) result += ' ';
    result += digits.substring(i, Math.min(i + 3, digits.length));
  }
  return result;
};