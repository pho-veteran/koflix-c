// External libraries
import { AlertTriangle } from "lucide-react-native";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useRouter } from "expo-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Application utils and services
import { sendPasswordResetEmail, startPhoneAuth } from "@/lib/firebase-auth";
import { emailOrPhoneValidator, isEmail, isPhone } from "@/lib/validation";

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
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            emailOrPhone: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setError(null);
        setValidated({ emailValid: true });

        if (isEmail(data.emailOrPhone)) {
            const resetResult = await sendPasswordResetEmail(data.emailOrPhone);
            
            if (!resetResult.success) {
                setError(resetResult.error?.message || "Không thể gửi email đặt lại mật khẩu");
                setValidated({ emailValid: false });
                return;
            }
            
            setSuccess(true);
            setTimeout(() => {
                router.back();
            }, 3000);
        } else if (isPhone(data.emailOrPhone)) {
            const phoneAuthResult = await startPhoneAuth(data.emailOrPhone);
            
            if (!phoneAuthResult.success) {
                setError(phoneAuthResult.error?.message || "Không thể gửi mã xác thực đến số điện thoại này");
                setValidated({ emailValid: false });
                return;
            }

            router.push({
                pathname: "/(auth)/verify-code",
                params: { 
                    phone: data.emailOrPhone,
                    verificationId: phoneAuthResult.data?.verificationId,
                    resetPassword: "true"
                }
            });
        } else {
            setError('Vui lòng nhập email hoặc số điện thoại hợp lệ');
            setValidated({ emailValid: false });
            return;
        }
    };

    return (
        <VStack className="max-w-[440px] w-full" space="md">
            <VStack className="md:items-center" space="md">
                <VStack space="sm" className="mt-4">
                    <Heading className="md:text-center" size="2xl">
                        Quên mật khẩu
                    </Heading>
                    <Text className="md:text-center">
                        Vui lòng nhập email hoặc số điện thoại của bạn. Chúng tôi sẽ gửi một liên kết đặt lại mật khẩu hoặc mã xác thực để giúp bạn khôi phục tài khoản.
                    </Text>
                </VStack>
            </VStack>

            {success && (
                <Text className="text-green-600 text-center">
                    Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.
                </Text>
            )}

            <VStack className="w-full mt-2">
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
                                {errors.emailOrPhone?.message || error || "Email hoặc số điện thoại không hợp lệ"}
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
                        className="w-full mt-4 bg-primary-400" // Updated color
                    >
                        {isSubmitting ? (
                            <ButtonSpinner color="white" />
                        ) : (
                            <ButtonText className="text-typography-950">Tiếp tục</ButtonText>
                        )}
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