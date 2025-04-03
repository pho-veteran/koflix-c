import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { useState } from "react";

import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Link, useRouter } from "expo-router";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "../ui/form-control";
import { Input, InputField } from "../ui/input";
import { Button, ButtonText } from "../ui/button";

const formSchema = z.object({
    emailOrPhone: z.string().email("Vui lòng nhập email hợp lệ!"),
});

type ForgotPasswordFormValues = z.infer<typeof formSchema>;

const ForgotPasswordForm = () => {
    const router = useRouter();
    const [validated, setValidated] = useState({
        emailValid: true
    });
    const [loading, setLoading] = useState(false);

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
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setLoading(false);
            // Navigate to login
            router.push("/(auth)/login");
        } catch (error) {
            setLoading(false);
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
                        Vui lòng nhập địa chỉ email của bạn. Chúng tôi sẽ gửi một liên kết đặt lại mật khẩu đến email của bạn.
                    </Text>
                </VStack>
            </VStack>
            <VStack className="w-full">
                <VStack space="xl" className="w-full">
                    <FormControl
                        isInvalid={!!errors.emailOrPhone || !validated.emailValid}
                        className="w-full"
                    >
                        <FormControlLabel>
                            <FormControlLabelText>Email</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            name="emailOrPhone"
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input>
                                    <InputField
                                        placeholder="Nhập email..."
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
                                {errors.emailOrPhone?.message || "Email không hợp lệ"}
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
                            {loading ? "Đang xử lý..." : "Gửi link đặt lại mật khẩu"}
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