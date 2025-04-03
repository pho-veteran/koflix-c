import LoginForm from "@/components/auth/login-form";
import { AuthLayout } from "@/components/layout/auth-layout";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity } from "react-native";

const LoginPage = () => {
    const router = useRouter();
    
    return (
        <AuthLayout>
            <LoginForm />
            {/* Navigate to verify-code page */}
            <TouchableOpacity 
                onPress={() => router.push('/verify-code')}
                style={{ 
                    marginTop: 20,
                    padding: 10,
                    backgroundColor: '#f0f0f0',
                    borderRadius: 5,
                    alignItems: 'center'
                }}
            >
                <Text style={{ color: '#333' }}>Debug: Go to Verify Code</Text>
            </TouchableOpacity>
        </AuthLayout>
    );
}

export default LoginPage;