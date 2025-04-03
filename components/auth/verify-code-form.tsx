import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Platform } from 'react-native';

import { AlertTriangle } from "lucide-react-native";
import { VStack } from "../ui/vstack";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { Button, ButtonText } from "../ui/button";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText } from "../ui/form-control";
import { PinInput, PinInputField } from "../ui/pin-input";
import { OTPTimer } from "../ui/otp-timer";

const formSchema = z.object({
    otp: z.string().length(6, "Hãy nhập đầy đủ mã OTP").regex(/^\d+$/, "Mã OTP chỉ được chứa số")
});

type VerifyCodeFormValues = z.infer<typeof formSchema>;

const VerifyCodeForm = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ phone?: string, email?: string }>();
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

    // Update form value when PIN changes
    useEffect(() => {
        setValue("otp", pinValue, { shouldValidate: true });
    }, [pinValue, setValue]);

    const handleResendCode = async () => {
        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading(false);
            
            // Clear the OTP fields
            setPinValue("");
            setValue("otp", "");
            
            return Promise.resolve();
        } catch (error) {
            setLoading(false);
            return Promise.reject(error);
        }
    };

    const onSubmit = async (data: VerifyCodeFormValues) => {
        try {
            setLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            setLoading(false);
            
            // If successful, navigate to home or appropriate screen
            router.push("/(main)/home");
        } catch (error) {
            setLoading(false);
            setError("Verification failed");
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
                        Mã xác thực đã được gửi đến {params.phone || params.email || "your device"}. Vui lòng kiểm tra và nhập mã để xác thực.
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