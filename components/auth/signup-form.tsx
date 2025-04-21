import { AlertTriangle, EyeIcon, EyeOffIcon } from "lucide-react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoading } from '@/hooks/use-loading';
import { TouchableOpacity } from "react-native";

import { signUpWithEmailAndPassword, startPhoneAuth, signOut } from "@/lib/firebase-auth";
import { emailValidator, phoneValidator, passwordStrengthValidator } from "@/lib/validation";

import { Button, ButtonText, ButtonSpinner } from "../ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText
} from "../ui/form-control";
import { Heading } from "../ui/heading";
import { HStack } from "../ui/hstack";
import { Input, InputField, InputSlot, InputIcon } from "../ui/input";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { createOrUpdateUser } from "@/api/users";

// Email signup schema
const emailSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: emailValidator,
  password: passwordStrengthValidator,
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

// Phone signup schema (no password)
const phoneSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: phoneValidator
});

// Types for form submissions
type EmailFormData = z.infer<typeof emailSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;

// Types for form component props
interface EmailFormProps {
  onSubmit: (data: EmailFormData) => Promise<void>;
}

interface PhoneFormProps {
  onSubmit: (data: PhoneFormData) => Promise<void>;
}

// Email Form Component with proper typing
const EmailSignupForm = ({ onSubmit }: EmailFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const handleSubmit = async (data: EmailFormData) => {
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "An unexpected error occurred");
    }
  };

  return (
    <VStack className="w-full">
      {error && (
        <FormControl isInvalid={true} className="mb-2">
          <FormControlError className="justify-center">
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>{error}</FormControlErrorText>
          </FormControlError>
        </FormControl>
      )}

      <VStack space="xl" className="w-full">
        <FormControl
          isInvalid={!!emailForm.formState.errors.name}
          className="w-full"
        >
          <FormControlLabel>
            <FormControlLabelText>Tên của bạn</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="name"
            control={emailForm.control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  placeholder="Nhập tên của bạn..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>
              {emailForm.formState.errors.name?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl
          isInvalid={!!emailForm.formState.errors.email}
          className="w-full"
        >
          <FormControlLabel>
            <FormControlLabelText>Email</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="email"
            control={emailForm.control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  placeholder="Nhập email của bạn..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>
              {emailForm.formState.errors.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl
          isInvalid={!!emailForm.formState.errors.password}
          className="w-full"
        >
          <FormControlLabel>
            <FormControlLabelText>Mật khẩu</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="password"
            control={emailForm.control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                <InputSlot onPress={handleTogglePassword} className="pr-3">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>
              {emailForm.formState.errors.password?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl
          isInvalid={!!emailForm.formState.errors.confirmPassword}
          className="w-full"
        >
          <FormControlLabel>
            <FormControlLabelText>Xác nhận mật khẩu</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="confirmPassword"
            control={emailForm.control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                <InputSlot onPress={handleToggleConfirmPassword} className="pr-3">
                  <InputIcon as={showConfirmPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>
              {emailForm.formState.errors.confirmPassword?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>

      <Button
        variant="solid"
        size="lg"
        isDisabled={emailForm.formState.isSubmitting}
        onPress={emailForm.handleSubmit(handleSubmit)}
        className="w-full mt-8 bg-primary-400"
      >
        {emailForm.formState.isSubmitting ? (
          <ButtonSpinner color="white" />
        ) : (
          <ButtonText className="text-typography-950">Đăng ký</ButtonText>
        )}
      </Button>
    </VStack>
  );
};

// Phone Form Component with proper typing
const PhoneSignupForm = ({ onSubmit }: PhoneFormProps) => {
  const [error, setError] = useState<string | null>(null);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      name: "",
      phone: ""
    }
  });

  const handleSubmit = async (data: PhoneFormData) => {
    setError(null);
    try {
      await onSubmit(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "An unexpected error occurred");
    }
  };

  return (
    <VStack className="w-full">
      {error && (
        <FormControl isInvalid={true} className="mb-2">
          <FormControlError className="justify-center">
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>{error}</FormControlErrorText>
          </FormControlError>
        </FormControl>
      )}

      <VStack space="xl" className="w-full">
        <FormControl
          isInvalid={!!phoneForm.formState.errors.name}
          className="w-full"
        >
          <FormControlLabel>
            <FormControlLabelText>Tên của bạn</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="name"
            control={phoneForm.control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  placeholder="Nhập tên của bạn..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>
              {phoneForm.formState.errors.name?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl
          isInvalid={!!phoneForm.formState.errors.phone}
          className="w-full"
        >
          <FormControlLabel>
            <FormControlLabelText>Số điện thoại</FormControlLabelText>
          </FormControlLabel>
          <Controller
            name="phone"
            control={phoneForm.control}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  placeholder="Nhập số điện thoại..."
                  value={value}
                  onChangeText={(text) => {
                    // Allow only numeric input
                    const numericText = text.replace(/[^0-9]/g, '');
                    onChange(numericText);
                  }}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>
              {phoneForm.formState.errors.phone?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>

      <Button
        variant="solid"
        size="lg"
        isDisabled={phoneForm.formState.isSubmitting}
        onPress={phoneForm.handleSubmit(handleSubmit)}
        className="w-full mt-8 bg-primary-400"
      >
        {phoneForm.formState.isSubmitting ? (
          <ButtonSpinner color="white" />
        ) : (
          <ButtonText className="text-typography-950">Đăng ký</ButtonText>
        )}
      </Button>
    </VStack>
  );
};

// Main Component
const SignupForm = () => {
  const router = useRouter();
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const { setIsLoading, setMessage } = useLoading();

  const handleEmailSignup = async (data: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    setMessage("Đang tạo tài khoản...");

    try {
      const signupResult = await signUpWithEmailAndPassword(
        data.email,
        data.password,
        data.name
      );

      if (!signupResult.success) {
        throw new Error(signupResult.error?.message || "Đăng ký không thành công");
      }

      if (!signupResult.data) {
        throw new Error("Không nhận được thông tin người dùng sau khi đăng ký");
      }

      setMessage("Đang cập nhật thông tin người dùng...");
      await createOrUpdateUser({
        name: data.name,
        emailOrPhone: data.email
      });

      // Log the user out after signup
      setMessage("Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập..."); 
      await signOut();

      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSignup = async (data: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    setMessage("Đang gửi mã xác thực đến điện thoại...");

    try {
      const phoneAuthResult = await startPhoneAuth(data.phone);

      if (!phoneAuthResult.success) {
        throw new Error(phoneAuthResult.error?.message || "Không thể gửi mã xác thực đến số điện thoại này");
      }

      router.push({
        pathname: "/(auth)/verify-code",
        params: {
          phone: data.phone,
          verificationId: phoneAuthResult.data?.verificationId,
          userName: data.name
        }
      });
    } catch (error) {
      console.error("Phone signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
      setMessage("");
    }
  };

  return (
    <VStack className="max-w-[440px] w-full" space="md">
      <VStack className="md:items-center" space="md">
        <VStack space="sm" className="my-4">
          <Heading className="md:text-center" size="2xl">
            Tạo tài khoản mới
          </Heading>
          <Text className="md:text-center">
            Đăng ký để tận hưởng các bộ phim bạn yêu thích!
          </Text>
        </VStack>
      </VStack>

      {/* Signup Method Toggle */}
      <HStack className="bg-secondary-300/20 p-1 rounded-xl mb-4">
        <TouchableOpacity
          className={`flex-1 p-3 rounded-lg ${signupMethod === 'email' ? 'bg-primary-400' : 'bg-transparent'}`}
          onPress={() => setSignupMethod('email')}
        >
          <Text className={`text-center font-medium ${signupMethod === 'email' ? 'text-typography-950' : 'text-typography-700'}`}>
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 p-3 rounded-lg ${signupMethod === 'phone' ? 'bg-primary-400' : 'bg-transparent'}`}
          onPress={() => setSignupMethod('phone')}
        >
          <Text className={`text-center font-medium ${signupMethod === 'phone' ? 'text-typography-950' : 'text-typography-700'}`}>
            Số điện thoại
          </Text>
        </TouchableOpacity>
      </HStack>

      {signupMethod === 'email' ? (
        <EmailSignupForm onSubmit={handleEmailSignup} />
      ) : (
        <PhoneSignupForm onSubmit={handlePhoneSignup} />
      )}

      <HStack className="self-center" space="sm">
        <Text size="md">Đã có tài khoản?</Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
          <Text
            className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
            size="md"
          >
            Đăng nhập
          </Text>
        </TouchableOpacity>
      </HStack>
    </VStack>
  );
};

export default SignupForm;