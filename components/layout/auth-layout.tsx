import React from "react";
import { View, StatusBar, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VStack } from "@/components/ui/vstack";

type AuthLayoutProps = {
  children: React.ReactNode;
};

const { width, height } = Dimensions.get("window");

export const AuthLayout = (props: AuthLayoutProps) => {
  return (
    <SafeAreaView className="flex-1 bg-secondary-0" edges={["top"]}>
      <StatusBar barStyle="light-content" />
      
      {/* Background layer with Netflix-style design */}
      <View className="absolute inset-0 bg-secondary-100">
        {/* Top accent circle - Netflix red */}
        <View
          className="absolute rounded-full bg-primary-400/10"
          style={{
            width: width * 1.4,
            height: width * 1.4,
            top: -width * 0.7,
            left: -width * 0.2,
          }}
        />
        
        {/* Bottom accent - subtle gradient */}
        <View 
          className="absolute bg-primary-400/5"
          style={{
            width: width,
            height: height * 0.4,
            bottom: -20,
            borderTopLeftRadius: 300,
            borderTopRightRadius: 300,
          }}
        />
        
        {/* Subtle grid overlay */}
        <View className="absolute inset-0">
          {/* Vertical lines */}
          <View className="flex-row justify-between absolute inset-0">
            {[...Array(8)].map((_, i) => (
              <View key={`v-${i}`} className="w-px h-full bg-outline-200/5" />
            ))}
          </View>
          
          {/* Horizontal lines */}
          <View className="flex-col justify-between absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <View key={`h-${i}`} className="w-full h-px bg-outline-200/5" />
            ))}
          </View>
        </View>
      </View>
      
      {/* Content container */}
      <View className="flex-1 px-5">
        {/* Logo header */}
        <View className="w-full items-center pt-6 pb-4">
          <Image 
            source={require("@/assets/images/koflix-logo-nobg.png")} 
            className="w-[120px] h-[48px]"
            resizeMode="contain"
          />
        </View>
        
        {/* Main content area */}
        <View className="flex-1 bg-secondary-200/50 rounded-2xl overflow-hidden border border-outline-200/10">
          {/* Glass card effect */}
          <View className="absolute inset-0 bg-secondary-0/5" />
          
          {/* Content with proper padding */}
          <View className="flex-1 p-6">
            <VStack space="lg" className="flex-1 justify-center">
              {props.children}
            </VStack>
          </View>
          
          {/* Bottom highlight */}
          <View className="absolute bottom-0 left-5 right-5 h-0.5 bg-primary-400/20 rounded-full" />
        </View>
        
        {/* Bottom space */}
        <View className="h-6" />
      </View>
    </SafeAreaView>
  );
};
