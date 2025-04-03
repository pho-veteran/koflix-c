import SignupForm from "@/components/auth/signup-form";
import { AuthLayout } from "@/components/layout/auth-layout";

const SignupPage = () => {
    return (
        <AuthLayout>
            <SignupForm />
        </AuthLayout>
    );
}

export default SignupPage;