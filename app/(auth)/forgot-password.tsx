import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { AuthLayout } from "@/components/layout/auth-layout";

const ForgotPasswordPage = () => {
    return (
        <AuthLayout>
            <ForgotPasswordForm />
        </AuthLayout>
    );
}

export default ForgotPasswordPage;