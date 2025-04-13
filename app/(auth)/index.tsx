import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StatusBar, Dimensions, Animated, Image } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingModal from "@/components/modals/loading-modal";

const { width } = Dimensions.get("window");

export default function AuthIndexPage() {
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const slideUpAnim = React.useRef(new Animated.Value(50)).current;

  // Slide up and fade in animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <StatusBar barStyle="light-content" />
      
      {/* Simple Background */}
      <View className="absolute left-0 top-0 right-0 bottom-0 bg-secondary-100">
        {/* Static Red Gradient - Top */}
        <View
          style={{
            position: "absolute",
            width: "130%",
            height: 350,
            top: -80,
            left: -width * 0.15,
            backgroundColor: "rgba(229, 9, 20, 0.18)",
            borderRadius: 350,
          }}
        />
        
        {/* Static Red Gradient - Bottom */}
        <View
          style={{
            position: "absolute",
            width: "120%",
            height: 250,
            bottom: -50,
            left: -width * 0.1,
            backgroundColor: "rgba(229, 9, 20, 0.1)",
            borderRadius: 250,
          }}
        />
        
        {/* Netflix Style Content Grid - Static */}
        <View className="absolute inset-0 flex-1">
          <View className="flex-row flex-wrap opacity-15">
            {[...Array(24)].map((_, index) => (
              <View 
                key={index} 
                style={{
                  width: width / 4,
                  height: 75,
                  backgroundColor: index % 5 === 0 ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
                  borderWidth: 0.5,
                  borderColor: 'rgba(255, 255, 255, 0.03)',
                }}
              />
            ))}
          </View>
        </View>
      </View>
      
      {/* Content Layer */}
      <Animated.View 
        className="flex-1 px-6 py-8 justify-between"
        style={{ 
          opacity: opacityAnim,
          transform: [{ translateY: slideUpAnim }]
        }}
      >
        {/* Top Section with Logo */}
        <View className="w-full items-center mt-2">
          <Image 
            source={require("@/assets/images/koflix-logo-nobg.png")} 
            className="w-[220px] h-[90px] mt-4"
            resizeMode="contain"
          />
        </View>
        
        {/* Middle Section - UPDATED WITHOUT KOFLIX TEXT */}
        <View className="items-center">
          <Text className="text-typography-950 text-4xl font-bold text-center mb-4">
            Trải nghiệm giải trí mọi lúc, mọi nơi
          </Text>
          
          {/* Decorative line instead of text */}
          <View className="w-20 h-[2px] bg-primary-400 mb-6" />
          
          <Text className="text-typography-700 text-base text-center mb-3 max-w-[340px]">
            Kho phim đa dạng, chất lượng cao và cập nhật liên tục
          </Text>
          
          <Text className="text-typography-600 text-sm text-center italic mb-8 max-w-[320px]">
            "Biến mỗi khoảnh khắc thành trải nghiệm điện ảnh"
          </Text>
        </View>
        
        {/* Bottom Section with Auth Buttons */}
        <View className="w-full space-y-5 mb-8 gap-2">
          {/* Login Button */}
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity 
              className="w-full bg-primary-400 py-4 rounded-lg items-center shadow-md"
              activeOpacity={0.7}
            >
              <Text className="text-typography-950 font-bold text-lg">Đăng nhập</Text>
            </TouchableOpacity>
          </Link>
          
          {/* Sign Up Button */}
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity 
              className="w-full border border-outline-200 py-4 rounded-lg items-center bg-secondary-100"
              activeOpacity={0.6}
            >
              <Text className="text-typography-800 font-medium text-base">Tạo tài khoản mới</Text>
            </TouchableOpacity>
          </Link>
          
          {/* Forgot Password */}
          <View className="flex-row justify-center mt-3 pt-1">
            <Text className="text-typography-500 text-sm">Gặp sự cố khi đăng nhập? </Text>
            <Link href="/(auth)/forgot-password" asChild>
              <Text className="text-primary-400 text-sm font-medium">Quên mật khẩu</Text>
            </Link>
          </View>
        </View>
      </Animated.View>
      
      {/* Footer */}
      <View className="px-6 pb-6">
        <Text className="text-typography-500 text-xs text-center">
          Bằng cách tiếp tục, bạn đồng ý với{' '}
          <Text className="text-typography-600">Điều khoản dịch vụ</Text>
          {' '}và{' '}
          <Text className="text-typography-600">Chính sách quyền riêng tư</Text>
          {' '}của chúng tôi.
        </Text>
      </View>
    </SafeAreaView>
  );
}