// External libraries
import { AlertTriangle } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useLocalSearchParams } from "expo-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoading } from '@/hooks/use-loading';

// Application utils and services
import { sendEmailVerification, verifyOTP, startPhoneAuth } from "@/lib/firebase-auth";
import { getPrettyPhoneNumber } from "@/lib/validation";

// UI Components
import { Button, ButtonText, ButtonSpinner } from "../ui/button";
import { 
    FormControl, 
    FormControlError, 
    FormControlErrorIcon, 
    FormControlErrorText 
} from "../ui/form-control";
import { Heading } from "../ui/heading";
import { OTPTimer } from "../ui/otp-timer";
import { PinInput, PinInputField } from "../ui/pin-input";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { createOrUpdateUser } from "@/api/users";

const formSchema = z.object({
    otp: z.string().length(6, "Hãy nhập đầy đủ mã OTP").regex(/^\d+$/, "Mã OTP chỉ được chứa số")
});

type VerifyCodeFormValues = z.infer<typeof formSchema>;

const VerifyCodeForm = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ 
        phone?: string, 
        email?: string, 
        verificationId?: string,
        resetPassword?: string,
        isLogin?: string,
        userName?: string
    }>();
    const [pinValue, setPinValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { setIsLoading, setMessage } = useLoading();
    
    const {
        setValue,
        handleSubmit,
        formState: { errors, isValid, isSubmitting },
    } = useForm<VerifyCodeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            otp: "",
        },
        mode: "onChange",
    });

    useEffect(() => {
        setValue("otp", pinValue, { shouldValidate: true });
    }, [pinValue, setValue]);

    const handleResendCode = async () => {
        setError(null);
        setIsLoading(true); // Start loading
        setMessage("Đang gửi lại mã xác thực..."); // Set loading message
        
        try {
            if (params.phone) {
                const phoneAuthResult = await startPhoneAuth(params.phone);
                
                if (!phoneAuthResult.success) {
                    setError(phoneAuthResult.error?.message || "Không thể gửi mã xác thực đến số điện thoại này");
                    return Promise.reject(phoneAuthResult.error);
                }
            } else if (params.email) {
                const verifyResult = await sendEmailVerification();
                
                if (!verifyResult.success) {
                    setError(verifyResult.error?.message || "Không thể gửi email xác thực");
                    return Promise.reject(verifyResult.error);
                }
            } else {
                setError("Không tìm thấy thông tin liên hệ để gửi mã xác thực");
                return Promise.reject(new Error("Missing contact information"));
            }
            
            setPinValue("");
            setValue("otp", "");
            setMessage("Đã gửi lại mã xác thực!"); // Success message
            
            // Show success message for 2 seconds
            setTimeout(() => {
                setMessage("");
            }, 2000);
            
            return Promise.resolve();
        } finally {
            setIsLoading(false); // Always stop loading
        }
    };

    const onSubmit = async (data: VerifyCodeFormValues) => {
        setError(null);
        setIsLoading(true); // Start loading
        setMessage("Đang xác thực mã OTP..."); // Set initial loading message
        
        try {
            if (params.verificationId && params.phone) {
                const verifyResult = await verifyOTP(params.verificationId, data.otp);
                
                if (!verifyResult.success) {
                    setError(verifyResult.error?.message || "Mã xác thực không đúng");
                    setIsLoading(false); // Stop loading on error
                    setMessage(""); // Clear message
                    return;
                }
                
                // Check if verifyResult.data exists before accessing
                if (!verifyResult.data) {
                    setError("Xác thực thành công nhưng không nhận được thông tin người dùng");
                    setIsLoading(false); // Stop loading on error
                    setMessage(""); // Clear message
                    return;
                }
                
                // If this is a signup flow (not reset password or login)
                if (!params.resetPassword && !params.isLogin && params.userName) {
                    try {
                        setMessage("Đang cập nhật thông tin người dùng..."); // Update message for user creation
                        // Create or update user with the name from params
                        await createOrUpdateUser(verifyResult.data.user.uid, {
                            name: params.userName, // Use the name passed from signup
                            emailOrPhone: params.phone
                        });
                        
                        setMessage("Đăng ký thành công!"); // Success message
                        // Navigate to home page
                        router.replace("/(main)/home");
                    } catch (error) {
                        setError("Xác thực thành công nhưng không thể cập nhật thông tin người dùng.");
                        setIsLoading(false); // Stop loading on error
                        setMessage(""); // Clear message
                    }
                    return;
                }
                
                // Handle other flows (reset password, login)
                if (params.resetPassword === "true") {
                    setMessage("Xác thực thành công! Đang chuyển hướng..."); // Success message for reset flow
                    router.replace({
                        pathname: "/(auth)/reset-password",
                        params: { 
                            phoneNumber: params.phone,
                            uid: verifyResult.data.user.uid 
                        }
                    });
                }
            } else {
                setError("Không tìm thấy thông tin xác thực");
                setIsLoading(false); // Stop loading on error
                setMessage(""); // Clear message
            }
        } catch (error: any) {
            console.error("Verification error:", error);
            setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
            setIsLoading(false); // Stop loading on unexpected error
            setMessage(""); // Clear message
        } finally {
            // Ensure loading state is cleared if not already done in successful navigation case
            setTimeout(() => {
                setIsLoading(false);
                setMessage("");
            }, 1000); // Small delay to ensure loading state is visible before navigation
        }
    };

    return (
        <VStack className="max-w-[440px] w-full" space="md">
            <VStack className="md:items-center" space="md">
                <VStack space="sm" className="mb-4">
                    <Heading className="md:text-center" size="2xl">
                        Nhập mã xác thực
                    </Heading>
                    <Text className="md:text-center">
                        Mã xác thực đã được gửi đến {params.phone ? getPrettyPhoneNumber(params.phone) : params.email || "thiết bị của bạn"}. 
                        Vui lòng kiểm tra và nhập mã để xác thực.
                    </Text>
                </VStack>
            </VStack>
            
            <VStack className="w-full" space="xl">
                <FormControl isInvalid={!!errors.otp} className="gap-4">
                    <PinInput 
                        value={pinValue} 
                        onChange={setPinValue}
                        size="xl"
                        noOfFields={6}
                    >
                        {Array.from({ length: 6 }).map((_, index) => (
                            <PinInputField key={index} index={index} />
                        ))}
                    </PinInput>
                    
                    {errors.otp && (
                        <FormControlError className="justify-center">
                            <FormControlErrorIcon as={AlertTriangle} />
                            <FormControlErrorText>
                                {errors.otp.message}
                            </FormControlErrorText>
                        </FormControlError>
                    )}
                    
                    {error && (
                        <FormControlError className="justify-center">
                            <FormControlErrorIcon as={AlertTriangle} />
                            <FormControlErrorText>
                                {error}
                            </FormControlErrorText>
                        </FormControlError>
                    )}
                </FormControl>
                
                <OTPTimer 
                    initialSeconds={60}
                    onResend={handleResendCode}
                />
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
                        <ButtonText className="text-typography-950">Xác nhận</ButtonText>
                    )}
                </Button>
            </VStack>
        </VStack>
    );
};

export default VerifyCodeForm;