// External libraries
import { AlertTriangle } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useLocalSearchParams } from "expo-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Application utils and services
import { handleAuthError } from '@/lib/error-handling';
import { sendEmailVerification, verifyOTP, startPhoneAuth } from "@/lib/firebase-auth";
import { getPrettyPhoneNumber } from "@/lib/validation";

// UI Components
import { Button, ButtonText } from "../ui/button";
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
        isLogin?: string
    }>();
    const [pinValue, setPinValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const {
        setValue,
        handleSubmit,
        formState: { errors, isValid },
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
        try {
            setLoading(true);
            setError(null);
            
            if (params.phone) {
                await startPhoneAuth(params.phone);
            } else if (params.email) {
                await sendEmailVerification();
            }
            
            setLoading(false);
            setPinValue("");
            setValue("otp", "");
            
            return Promise.resolve();
        } catch (error: any) {
            setLoading(false);
            const errorMessage = handleAuthError(error);
            setError(errorMessage);
            return Promise.reject(error);
        }
    };

    const onSubmit = async (data: VerifyCodeFormValues) => {
        try {
            setLoading(true);
            setError(null);
            
            if (params.verificationId && params.phone) {
                const result = await verifyOTP(params.verificationId, data.otp);
                
                if (params.resetPassword === "true") {
                    router.replace({
                        pathname: "/(auth)/reset-password",
                        params: { 
                            phoneNumber: params.phone,
                            uid: result.user.uid 
                        }
                    });
                } else if (params.isLogin === "true") {
                    router.replace("/(main)/home");
                }
            } else {
                throw new Error("Không tìm thấy thông tin xác thực");
            }
            
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            const errorMessage = handleAuthError(error);
            setError(errorMessage);
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
                    className="w-full" 
                    onPress={handleSubmit(onSubmit)}
                    isDisabled={!isValid || loading}
                >
                    <ButtonText className="font-medium">
                        {loading ? "Đang xử lý..." : "Xác nhận"}
                    </ButtonText>
                </Button>
            </VStack>
        </VStack>
    );
};

export default VerifyCodeForm;