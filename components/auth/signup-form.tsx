// External libraries
import { AlertTriangle, EyeIcon, EyeOffIcon } from "lucide-react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useRouter } from "expo-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoading } from '@/hooks/use-loading';

import { signUpWithEmailAndPassword, startPhoneAuth } from "@/lib/firebase-auth";
import { emailOrPhoneValidator, isEmail, isPhone, passwordStrengthValidator } from "@/lib/validation";

// UI Components
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

// Form schema
const formSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    emailOrPhone: emailOrPhoneValidator,
    password: passwordStrengthValidator,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof formSchema>;

const SignupForm = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setIsLoading, setMessage } = useLoading();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            emailOrPhone: "",
            password: "",
            confirmPassword: "",
        },
    });

    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const handleToggleConfirmPassword = () => {
        setShowConfirmPassword(prev => !prev);
    };

    const onSubmit = async (data: SignupFormValues) => {
        setError(null);
        setIsLoading(true); // Start loading
        setMessage("Đang tạo tài khoản..."); // Set initial loading message

        try {
            if (isEmail(data.emailOrPhone)) {
                setMessage("Đang đăng ký với email..."); // Update message for email flow
                const signupResult = await signUpWithEmailAndPassword(
                    data.emailOrPhone,
                    data.password,
                    data.name
                );
                
                if (!signupResult.success) {
                    setError(signupResult.error?.message || "Đăng ký không thành công");
                    setIsLoading(false); // Stop loading on error
                    setMessage(""); // Clear message
                    return;
                }
                
                // After successful signup, create/update user in your backend
                try {
                    // Check if signupResult.data exists before accessing its properties
                    if (!signupResult.data) {
                        throw new Error("Không nhận được thông tin người dùng sau khi đăng ký");
                    }
                    
                    setMessage("Đang cập nhật thông tin người dùng..."); // Update message for backend call
                    // Now TypeScript knows signupResult.data is defined
                    await createOrUpdateUser(signupResult.data.user.uid, {
                        name: data.name,
                        emailOrPhone: data.emailOrPhone
                    });
                    
                    // Navigate to home or whatever page comes after signup
                    setMessage("Đăng ký thành công!"); // Success message
                    router.replace("/(main)/home");
                } catch (error: any) {
                    setError("Đã đăng ký thành công nhưng không thể cập nhật thông tin người dùng.");
                    setIsLoading(false); // Stop loading on error
                    setMessage(""); // Clear message
                }
            } else if (isPhone(data.emailOrPhone)) {
                // Store the name for later use with phone verification
                setMessage("Đang gửi mã xác thực đến điện thoại..."); // Update message for phone flow
                const phoneAuthResult = await startPhoneAuth(data.emailOrPhone);
                
                if (!phoneAuthResult.success) {
                    setError(phoneAuthResult.error?.message || "Không thể gửi mã xác thực đến số điện thoại này");
                    setIsLoading(false); // Stop loading on error
                    setMessage(""); // Clear message
                    return;
                }

                setMessage(""); // Clear message before navigation
                setIsLoading(false); // Stop loading before navigation
                router.push({
                    pathname: "/(auth)/verify-code",
                    params: {
                        phone: data.emailOrPhone,
                        verificationId: phoneAuthResult.data?.verificationId,
                        userName: data.name // Pass the user's name as a URL parameter
                    }
                });
            } else {
                setError("Email hoặc số điện thoại không hợp lệ.");
                setIsLoading(false); // Stop loading on error
                setMessage(""); // Clear message
            }
        } catch (error: any) {
            console.error("Signup error:", error);
            setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
            setIsLoading(false); // Stop loading on unexpected error
            setMessage(""); // Clear message
        } finally {
            // Ensure loading state is cleared if not already done
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

            {error && (
                <FormControl isInvalid={true} className="mb-2 w-3/4 justify-center flex">
                    <FormControlError className="gap-4">
                        <FormControlErrorIcon as={AlertTriangle} />
                        <FormControlErrorText>{error}</FormControlErrorText>
                    </FormControlError>
                </FormControl>
            )}

            <VStack className="w-full">
                <VStack space="xl" className="w-full">
                    <FormControl
                        isInvalid={!!errors.name}
                        className="w-full"
                    >
                        <FormControlLabel>
                            <FormControlLabelText>Tên của bạn</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            name="name"
                            control={control}
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
                                {errors.name?.message}
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <FormControl
                        isInvalid={!!errors.emailOrPhone}
                        className="w-full"
                    >
                        <FormControlLabel>
                            <FormControlLabelText>Email/Số điện thoại</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            name="emailOrPhone"
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input>
                                    <InputField
                                        placeholder="Nhập email hoặc số điện thoại..."
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
                                {errors.emailOrPhone?.message}
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <FormControl
                        isInvalid={!!errors.password}
                        className="w-full"
                    >
                        <FormControlLabel>
                            <FormControlLabelText>Mật khẩu</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            name="password"
                            control={control}
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
                                {errors.password?.message}
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <FormControl
                        isInvalid={!!errors.confirmPassword}
                        className="w-full"
                    >
                        <FormControlLabel>
                            <FormControlLabelText>Xác nhận mật khẩu</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            name="confirmPassword"
                            control={control}
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
                                {errors.confirmPassword?.message}
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                </VStack>

                <VStack className="w-full my-7" space="lg">
                    <Button
                        variant="solid"
                        size="lg"
                        isDisabled={isSubmitting}
                        onPress={handleSubmit(onSubmit)}
                        className="w-full mt-4 bg-primary-400"
                    >
                        {isSubmitting ? (
                            <ButtonSpinner color="white" />
                        ) : (
                            <ButtonText className="text-typography-950">Đăng ký</ButtonText>
                        )}
                    </Button>
                </VStack>

                <HStack className="self-center" space="sm">
                    <Text size="md">Đã có tài khoản?</Text>
                    <Link href="/(auth)/login">
                        <Text
                            className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
                            size="md"
                        >
                            Đăng nhập
                        </Text>
                    </Link>
                </HStack>
            </VStack>
        </VStack>
    );
};

export default SignupForm;