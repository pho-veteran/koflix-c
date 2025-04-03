import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, EyeIcon, EyeOffIcon } from "lucide-react-native";
import { GoogleIcon } from "@/assets/auth/icons/google";
import { useState } from "react";

import { VStack } from "../ui/vstack";
import { HStack } from "../ui/hstack";
import { Link, useRouter } from "expo-router";
import { Heading } from "../ui/heading";
import { Text } from "../ui/text";
import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText, FormControlLabel, FormControlLabelText } from "../ui/form-control";
import { Input, InputField, InputSlot, InputIcon } from "../ui/input";
import { Button, ButtonText, ButtonIcon } from "../ui/button";

const formSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    emailOrPhone: z.string().email("Vui lòng nhập email hợp lệ!"),
    password: z
        .string()
        .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
        ),
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
    const [loading, setLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
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
        try {
            setLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setLoading(false);
            // Navigate to login
            router.push("/(auth)/login");
        } catch (error) {
            setLoading(false);
            console.error("Signup failed", error);
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
                        className="w-full" 
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                    >
                        {loading ? (
                            <ButtonText className="font-medium">Đang xử lý...</ButtonText>
                        ) : (
                            <ButtonText className="font-medium">Đăng ký</ButtonText>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        action="secondary"
                        className="w-full gap-1"
                        onPress={() => {}}
                    >
                        <ButtonText className="font-medium">
                            Đăng ký với Google
                        </ButtonText>
                        <ButtonIcon as={GoogleIcon} />
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