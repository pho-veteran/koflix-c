import React, { useState, useEffect } from 'react';
import { HStack } from '../hstack';
import { Text } from '../text';
import { Pressable } from 'react-native';

interface OTPTimerProps {
  initialSeconds: number;
  onResend: () => Promise<void>;
  resendText?: string;
  resendingText?: string;
  waitingText?: string;
  className?: string;
}

export const OTPTimer: React.FC<OTPTimerProps> = ({
  initialSeconds = 60,
  onResend,
  resendText = "Gửi lại mã",
  resendingText = "Đang gửi...",
  waitingText = "Gửi lại sau",
  className,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isResending, setIsResending] = useState(false);

  // Set up the countdown timer
  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle resend action
  const handleResend = async () => {
    if (seconds === 0 && !isResending) {
      setIsResending(true);
      try {
        await onResend();
        setSeconds(initialSeconds);
      } catch (error) {
        console.error("Error resending code:", error);
      } finally {
        setIsResending(false);
      }
    }
  };

  return (
    <HStack className={`justify-center ${className || ''}`} space="sm">
      <Text>Chưa nhận được mã? </Text>
      {seconds > 0 ? (
        <Text className="text-gray-500">
          {waitingText} {formatTime(seconds)}
        </Text>
      ) : (
        <Pressable onPress={handleResend} disabled={isResending}>
          <Text 
            className={`font-medium ${isResending ? 'text-gray-400' : 'text-primary-700'}`}
          >
            {isResending ? resendingText : resendText}
          </Text>
        </Pressable>
      )}
    </HStack>
  );
};