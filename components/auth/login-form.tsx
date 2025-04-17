import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { useState } from "react";
import { signInWithEmailAndPassword, startPhoneAuth } from "@/lib/firebase-auth";
import { emailValidator, phoneValidator } from "@/lib/validation";
import { View, TouchableOpacity } from "react-native";

import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { useRouter } from "expo-router";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "../ui/form-control";
import { Input, InputField } from "../ui/input";
import { Button, ButtonText, ButtonSpinner } from "../ui/button";

// Email login schema
const emailSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, "Mật khẩu không được để trống")
});

// Phone login schema (no password)
const phoneSchema = z.object({
  phone: phoneValidator
});

const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  // Email form
  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Phone form
  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: ""
    }
  });

  const handleEmailLogin = async (data: z.infer<typeof emailSchema>) => {
    setLoading(true);
    setError(null);

    try {
      const loginResult = await signInWithEmailAndPassword(data.email, data.password);
      
      if (!loginResult.success) {
        setError(loginResult.error?.message || "Đăng nhập không thành công");
        return;
      }
      
      // Success - will be redirected by auth context
    } catch (error) {
      setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (data: z.infer<typeof phoneSchema>) => {
    setLoading(true);
    setError(null);

    try {
      const phoneAuthResult = await startPhoneAuth(data.phone);

      if (!phoneAuthResult.success) {
        setError(phoneAuthResult.error?.message || "Không thể gửi mã xác thực đến số điện thoại này");
        return;
      }

      // Navigate to OTP verification screen
      router.push({
        pathname: "/(auth)/verify-code",
        params: {
          phone: data.phone,
          verificationId: phoneAuthResult.data?.verificationId,
          isLogin: "true"
        }
      });
    } catch (error) {
      setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack className="max-w-[440px] w-full" space="md">
      <VStack className="md:items-center" space="md">
        <VStack space="sm" className="my-4">
          <Heading className="md:text-center" size="2xl">
            Đăng nhập
          </Heading>
          <Text className="md:text-center">
            Đăng nhập để tận hưởng các bộ phim bạn yêu thích!
          </Text>
        </VStack>
      </VStack>

      {/* Login Method Toggle */}
      <HStack className="bg-secondary-300/20 p-1 rounded-xl mb-4">
        <TouchableOpacity 
          className={`flex-1 p-3 rounded-lg ${loginMethod === 'email' ? 'bg-primary-400' : 'bg-transparent'}`} 
          onPress={() => setLoginMethod('email')}
        >
          <Text className={`text-center font-medium ${loginMethod === 'email' ? 'text-typography-950' : 'text-typography-700'}`}>
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 p-3 rounded-lg ${loginMethod === 'phone' ? 'bg-primary-400' : 'bg-transparent'}`} 
          onPress={() => setLoginMethod('phone')}
        >
          <Text className={`text-center font-medium ${loginMethod === 'phone' ? 'text-typography-950' : 'text-typography-700'}`}>
            Số điện thoại
          </Text>
        </TouchableOpacity>
      </HStack>

      {error && (
        <FormControl isInvalid={true} className="mb-2">
          <FormControlError className="justify-center">
            <FormControlErrorIcon as={AlertTriangle} />
            <FormControlErrorText>{error}</FormControlErrorText>
          </FormControlError>
        </FormControl>
      )}

      {loginMethod === 'email' ? (
        <VStack className="w-full">
          <VStack space="xl" className="w-full">
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
                      type="password"
                      placeholder="Nhập mật khẩu..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry
                    />
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

            <HStack className="justify-end">
              <TouchableOpacity onPress={() => router.replace("/(auth)/forgot-password")}>
                <Text
                  className="font-medium text-primary-700"
                  size="sm"
                >
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>
            </HStack>
          </VStack>

          <Button
            variant="solid"
            size="lg"
            isDisabled={loading}
            onPress={emailForm.handleSubmit(handleEmailLogin)}
            className="w-full mt-8 bg-primary-400"
          >
            {loading ? (
              <ButtonSpinner color="white" />
            ) : (
              <ButtonText className="text-typography-950">Đăng nhập</ButtonText>
            )}
          </Button>
        </VStack>
      ) : (
        <VStack className="w-full">
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
                    onChangeText={onChange}
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

          <Text className="text-typography-600 text-sm mt-2">
            Chúng tôi sẽ gửi mã xác thực OTP đến số điện thoại của bạn.
          </Text>

          <Button
            variant="solid"
            size="lg"
            isDisabled={loading}
            onPress={phoneForm.handleSubmit(handlePhoneLogin)}
            className="w-full mt-8 bg-primary-400"
          >
            {loading ? (
              <ButtonSpinner color="white" />
            ) : (
              <ButtonText className="text-typography-950">Nhận mã xác thực</ButtonText>
            )}
          </Button>
        </VStack>
      )}

      <HStack className="self-center mt-8" space="sm">
        <Text size="md">Chưa có tài khoản?</Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/signup")}>
          <Text
            className="font-medium text-primary-700"
            size="md"
          >
            Đăng ký
          </Text>
        </TouchableOpacity>
      </HStack>
    </VStack>
  );
};

export default LoginForm;