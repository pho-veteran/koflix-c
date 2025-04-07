// External libraries
import { AlertTriangle, EyeIcon, EyeOffIcon } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Application utils and services
import { updateUserPassword } from "@/lib/firebase-auth";
import { passwordStrengthValidator } from "@/lib/validation";

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
import { Input, InputField, InputIcon, InputSlot } from "../ui/input";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";
import { Box } from "../ui/box";

const formSchema = z.object({
    password: passwordStrengthValidator,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof formSchema>;

const ResetPasswordForm = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ 
        phoneNumber?: string,
        uid?: string 
    }>();
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
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

    const onSubmit = async (data: ResetPasswordFormValues) => {
        setLoading(true);
        setError(null);

        const updateResult = await updateUserPassword(data.password);
        
        if (!updateResult.success) {
            setLoading(false);
            setError(updateResult.error?.message || "Không thể cập nhật mật khẩu");
            return;
        }

        setSuccess(true);
        setLoading(false);

        setTimeout(() => {
            router.replace("/(auth)/login");
        }, 3000);
    };

    return (
        <VStack className="max-w-[440px] w-full" space="md">
            <VStack className="md:items-center" space="md">
                <VStack space="sm" className="my-4">
                    <Heading className="md:text-center" size="2xl">
                        Đặt lại mật khẩu
                    </Heading>
                    <Text className="md:text-center">
                        Vui lòng nhập mật khẩu mới của bạn.
                    </Text>
                </VStack>
            </VStack>

            {error && (
                <FormControl isInvalid={true} className="mb-2">
                    <FormControlError className="justify-center">
                        <FormControlErrorIcon as={AlertTriangle} />
                        <FormControlErrorText>{error}</FormControlErrorText>
                    </FormControlError>
                </FormControl>
            )}

            {success && (
                <Box className="mb-2">
                    <Text className="text-green-600 text-center">
                        Mật khẩu đã được cập nhật thành công! Đang chuyển hướng về trang chủ...
                    </Text>
                </Box>
            )}

            <VStack className="w-full">
                <VStack space="xl" className="w-full">
                    <FormControl
                        isInvalid={!!errors.password}
                        className="w-full"
                    >
                        <FormControlLabel>
                            <FormControlLabelText>Mật khẩu mới</FormControlLabelText>
                        </FormControlLabel>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input>
                                    <InputField
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu mới..."
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
                        isDisabled={loading || success}
                    >
                        <ButtonText className="font-medium">
                            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                        </ButtonText>
                    </Button>
                </VStack>
            </VStack>
        </VStack>
    );
};

export default ResetPasswordForm;