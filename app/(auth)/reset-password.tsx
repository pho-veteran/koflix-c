import ResetPasswordForm from "@/components/auth/reset-password-form";
import { AuthLayout } from "@/components/layout/auth-layout";

const ResetPasswordPage = () => {
    return (
        <AuthLayout>
            <ResetPasswordForm />
        </AuthLayout>
    );
}

export default ResetPasswordPage;