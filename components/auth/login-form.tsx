import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react-native";
import { GoogleIcon } from "@/assets/auth/icons/google";
import { useState } from "react";

import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Link, useRouter } from "expo-router";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "../ui/form-control";
import { Input, InputField } from "../ui/input";
import { Button, ButtonText, ButtonIcon } from "../ui/button";

const formSchema = z.object({
    emailOrPhone: z.string().min(1, "Email không được để trống").email("Vui lòng nhập email hợp lệ"),
    password: z.string().min(1, "Mật khẩu không được để trống"),
});

type LoginFormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState({
        emailValid: true,
        passwordValid: true
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            emailOrPhone: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            setLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setLoading(false);
            
            console.log("Login data:", data);
        } catch (error) {
            setLoading(false);
            setValidated({
                emailValid: false,
                passwordValid: false
            });
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

                    <FormControl
                        isInvalid={!!errors.password || !validated.passwordValid}
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
                                        type="password"
                                        placeholder="Nhập mật khẩu..."
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
                                {errors.password?.message || "Mật khẩu không chính xác"}
                            </FormControlErrorText>
                        </FormControlError>
                    </FormControl>

                    <HStack className="justify-end">
                        <Link href="/(auth)/forgot-password">
                            <Text
                                className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
                                size="sm"
                            >
                                Quên mật khẩu?
                            </Text>
                        </Link>
                    </HStack>
                </VStack>

                <VStack className="w-full my-7" space="lg">
                    <Button 
                        className="w-full" 
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        <ButtonText className="font-medium">
                            {loading ? "Đang xử lý..." : "Đăng nhập"}
                        </ButtonText>
                    </Button>
                    <Button
                        variant="outline"
                        action="secondary"
                        className="w-full gap-1"
                        onPress={() => router.push("/(main)/home")}
                    >
                        <ButtonText className="font-medium">
                            Đăng nhập với Google
                        </ButtonText>
                        <ButtonIcon as={GoogleIcon} />
                    </Button>
                </VStack>

                <HStack className="self-center" space="sm">
                    <Text size="md">Chưa có tài khoản?</Text>
                    <Link href="/(auth)/signup">
                        <Text
                            className="font-medium text-primary-700 group-hover/link:text-primary-600 group-hover/pressed:text-primary-700"
                            size="md"
                        >
                            Đăng ký
                        </Text>
                    </Link>
                </HStack>
            </VStack>
        </VStack>
    );
};

export default LoginForm;