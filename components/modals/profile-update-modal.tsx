import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter
} from '@/components/ui/alert-dialog';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';

interface ProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  avatarUrl?: string;
  isLoading: boolean;
  onPickImage: () => void;
  onSave: (name: string) => void;
  image: { uri: string } | null;
}

const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({
  isOpen,
  onClose,
  initialName,
  avatarUrl,
  isLoading,
  onPickImage,
  onSave,
  image
}) => {
  const [name, setName] = useState(initialName);
  const displayImageUri = image?.uri || avatarUrl;

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  return (
    <AlertDialog isOpen={isOpen}>
      <AlertDialogBackdrop onPress={onClose} className="bg-black/70" />
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader className="pb-1">
          <View className="w-full items-center">
            <Text className="text-lg font-bold text-typography-900">Cập nhật thông tin</Text>
          </View>
        </AlertDialogHeader>

        <AlertDialogBody className="py-4">
          <VStack space="md" className="items-center">
            {/* Avatar upload section */}
            <TouchableOpacity
              onPress={onPickImage}
              className="relative mb-4"
            >
              <View className="w-24 h-24 rounded-full overflow-hidden border border-outline-200/30">
                {displayImageUri ? (
                  <Image
                    source={{ uri: displayImageUri }}
                    className="w-full h-full rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full bg-primary-400/30 items-center justify-center">
                    <Text className="text-typography-800 text-3xl font-bold">
                      {name?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  </View>
                )}
              </View>
              {/* Edit avatar icon */}
              <View className="absolute bottom-0 right-0 bg-primary-400 rounded-full p-2 border-2 border-secondary-200">
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Name input field */}
            <FormControl className="w-full">
              <FormControlLabel>
                <FormControlLabelText>Tên hiển thị</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="Nhập tên của bạn"
                  value={name}
                  onChangeText={setName}
                  keyboardType='default'
                />
              </Input>
            </FormControl>
          </VStack>
        </AlertDialogBody>

        <AlertDialogFooter className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onPress={onClose}
            disabled={isLoading}
            className="flex-1 mr-2"
          >
            <Text>Hủy</Text>
          </Button>

          <Button
            variant="solid"
            size="sm"
            onPress={() => onSave(name)}
            disabled={isLoading}
            className="flex-1 bg-primary-500 active:bg-primary-600"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white">Lưu thay đổi</Text>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ProfileUpdateModal;