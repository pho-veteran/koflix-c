// External libraries
import { AlertTriangle } from "lucide-react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useRouter } from "expo-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Application utils and services
import { handleAuthError } from '@/lib/error-handling';
import { sendPasswordResetEmail, startPhoneAuth } from "@/lib/firebase-auth";
import { emailOrPhoneValidator, formatPhoneNumber, isEmail, isPhone } from "@/lib/validation";

// UI Components
import { Button, ButtonText } from "../ui/button";
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
import { Input, InputField } from "../ui/input";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

// Form schema
const formSchema = z.object({
    emailOrPhone: emailOrPhoneValidator
});

type ForgotPasswordFormValues = z.infer<typeof formSchema>;

const ForgotPasswordForm = () => {
    const router = useRouter();
    const [validated, setValidated] = useState({
        emailValid: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            emailOrPhone: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        try {
            setLoading(true);
            setError(null);
            setValidated({ emailValid: true });

            if (isEmail(data.emailOrPhone)) {
                await sendPasswordResetEmail(data.emailOrPhone);
                
                setSuccess(true);
                setTimeout(() => {
                    router.push("/(auth)/login");
                }, 3000);
            } else if (isPhone(data.emailOrPhone)) {
                const formattedPhone = formatPhoneNumber(data.emailOrPhone);
                const confirmation = await startPhoneAuth(formattedPhone);
                
                router.push({
                    pathname: "/(auth)/verify-code",
                    params: { 
                        phone: data.emailOrPhone,
                        verificationId: confirmation.verificationId,
                        resetPassword: "true"
                    }
                });
            } else {
                throw {
                    code: 'auth/invalid-credential',
                    message: 'Vui lòng nhập email hoặc số điện thoại hợp lệ'
                };
            }

            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            const errorMessage = handleAuthError(error);
            setError(errorMessage);
            setValidated({
                emailValid: false
            });
        }
    };

    return (
        <VStack className="max-w-[440px] w-full" space="md">
            <VStack className="md:items-center" space="md">
                <VStack space="sm" className="my-4">
                    <Heading className="md:text-center" size="2xl">
                        Quên mật khẩu
                    </Heading>
                    <Text className="md:text-center">
                        Vui lòng nhập email hoặc số điện thoại của bạn. Chúng tôi sẽ gửi một liên kết đặt lại mật khẩu hoặc mã xác thực để giúp bạn khôi phục tài khoản.
                    </Text>
                </VStack>
            </VStack>

            {error && (
                <FormControlError className="justify-center mb-2">
                    <FormControlErrorIcon as={AlertTriangle} />
                    <FormControlErrorText>{error}</FormControlErrorText>
                </FormControlError>
            )}

            {success && (
                <Text className="text-green-600 text-center mb-2">
                    Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.
                </Text>
            )}

            <VStack className="w-full">
                <VStack space="xl" className="w-full">
                    <FormControl
                        isInvalid={!!errors.emailOrPhone || !validated.emailValid}
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
                                {errors.emailOrPhone?.message || "Email hoặc số điện thoại không hợp lệ"}
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                </VStack>

                <VStack className="w-full my-7" space="lg">
                    <Button
                        className="w-full"
                        onPress={handleSubmit(onSubmit)}
                        isDisabled={loading}
                    >
                        <ButtonText className="font-medium">
                            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                        </ButtonText>
                    </Button>

                    <HStack className="self-center" space="sm">
                        <Text size="md">Đã nhớ ra mật khẩu?</Text>
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
        </VStack>
    );
};

export default ForgotPasswordForm;