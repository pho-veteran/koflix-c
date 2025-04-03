import VerifyCodeForm from "@/components/auth/verify-code-form";
import { AuthLayout } from "@/components/layout/auth-layout";

const VerifyCodePage = () => {
    return (
        <AuthLayout>
            <VerifyCodeForm />
        </AuthLayout>
    );
}

export default VerifyCodePage;