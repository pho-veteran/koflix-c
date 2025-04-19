import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogBackdrop, 
  AlertDialogContent, 
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter
} from '@/components/ui/alert-dialog';

// Supported button variants
type ButtonVariant = 'link' | 'outline' | 'solid';

export type ConfirmationType = 
  // Download related
  | 'download' | 'cancel' | 'delete' | 'retry' 
  // Auth related
  | 'logout' | 'delete-account'
  // General actions
  | 'confirm' | 'destructive' | 'info' | 'warning' | 'success';

// Use semantic colors for config
type SemanticColor = 'primary' | 'error' | 'warning' | 'success' | 'info';

export interface ConfirmationConfig {
  icon: string;
  title: string;
  message: string;
  confirmText: string;
  confirmColor: SemanticColor;
  iconColor: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmationType: ConfirmationType;
  title?: string;
  message?: string;
  confirmText?: string;
  isLoading?: boolean;
  customConfig?: Partial<ConfirmationConfig>;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  confirmationType,
  title = '',
  message = '',
  confirmText,
  isLoading = false,
  customConfig = {}
}) => {
  // Map semantic colors to button variants
  const getButtonVariant = (color: SemanticColor): ButtonVariant => {
    return 'solid';
  }
  
  // Map semantic colors to actual theme colors for className
  const getButtonColorClass = (color: SemanticColor): string => {
    switch (color) {
      case 'primary': return 'bg-primary-500 active:bg-primary-600';
      case 'error': return 'bg-error-500 active:bg-error-600';
      case 'warning': return 'bg-warning-500 active:bg-warning-600';
      case 'success': return 'bg-success-500 active:bg-success-600';
      case 'info': return 'bg-info-500 active:bg-info-600';
      default: return 'bg-primary-500 active:bg-primary-600';
    }
  }

  const getModalConfig = (): ConfirmationConfig => {
    // Default configurations based on type
    const defaultConfigs: Record<ConfirmationType, ConfirmationConfig> = {
      // Download related
      download: {
        icon: 'download-outline',
        title: 'Xác nhận tải xuống',
        message: `Bạn có muốn tải xuống "${title}" không?`,
        confirmText: 'Tải xuống',
        confirmColor: 'primary',
        iconColor: '#38ef7d'
      },
      cancel: {
        icon: 'close-circle-outline',
        title: 'Hủy',
        message: `Bạn có chắc chắn muốn hủy tải xuống "${title}" không?`,
        confirmText: 'Hủy',
        confirmColor: 'error',
        iconColor: '#ff6b6b'
      },
      delete: {
        icon: 'trash-outline',
        title: 'Xóa',
        message: `Bạn có chắc chắn muốn xóa "${title}" không?`,
        confirmText: 'Xóa',
        confirmColor: 'error',
        iconColor: '#ff6b6b'
      },
      retry: {
        icon: 'refresh-outline',
        title: 'Thử lại',
        message: `Thao tác đã thất bại. Bạn có muốn thử lại không?`,
        confirmText: 'Thử lại',
        confirmColor: 'primary',
        iconColor: '#3F5EFB'
      },
      
      // Auth related
      logout: {
        icon: 'log-out-outline',
        title: 'Đăng xuất',
        message: 'Bạn có chắc chắn muốn đăng xuất không?',
        confirmText: 'Đăng xuất',
        confirmColor: 'error',
        iconColor: '#F43F5E'
      },
      'delete-account': {
        icon: 'person-remove-outline',
        title: 'Xóa tài khoản',
        message: 'Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể khôi phục.',
        confirmText: 'Xóa tài khoản',
        confirmColor: 'error',
        iconColor: '#F43F5E'
      },
      
      // General actions
      confirm: {
        icon: 'checkmark-circle-outline',
        title: 'Xác nhận',
        message: 'Bạn có chắc chắn muốn thực hiện hành động này không?',
        confirmText: 'Đồng ý',
        confirmColor: 'primary',
        iconColor: '#3F5EFB'
      },
      destructive: {
        icon: 'alert-circle-outline',
        title: 'Cảnh báo',
        message: 'Hành động này có thể không khôi phục được. Bạn có chắc chắn muốn tiếp tục không?',
        confirmText: 'Tiếp tục',
        confirmColor: 'error',
        iconColor: '#F43F5E'
      },
      info: {
        icon: 'information-circle-outline',
        title: 'Thông tin',
        message: 'Bạn muốn tiếp tục thực hiện hành động này?',
        confirmText: 'Tiếp tục',
        confirmColor: 'info',
        iconColor: '#3B82F6'
      },
      warning: {
        icon: 'warning-outline',
        title: 'Cảnh báo',
        message: 'Bạn nên cân nhắc trước khi tiếp tục. Bạn có muốn tiếp tục không?',
        confirmText: 'Tiếp tục',
        confirmColor: 'warning',
        iconColor: '#FBBF24'
      },
      success: {
        icon: 'checkmark-circle-outline',
        title: 'Thành công',
        message: 'Hành động đã thành công. Bạn có muốn tiếp tục không?',
        confirmText: 'Tiếp tục',
        confirmColor: 'success',
        iconColor: '#10B981'
      }
    };

    // Get the default config for this type
    const defaultConfig = defaultConfigs[confirmationType];
    
    // Override attributes
    if (message) {
      defaultConfig.message = message;
    }
    
    if (title && (confirmationType === 'download' || confirmationType === 'cancel' || 
                  confirmationType === 'delete' || confirmationType === 'retry')) {
      defaultConfig.message = defaultConfig.message.replace('"${title}"', `"${title}"`);
    }

    if (confirmText) {
      defaultConfig.confirmText = confirmText;
    }

    // Merge with any custom config overrides
    return {
      ...defaultConfig,
      ...customConfig
    };
  };

  const config = getModalConfig();
  const buttonColorClass = getButtonColorClass(config.confirmColor);

  return (
    <AlertDialog isOpen={isOpen}>
      <AlertDialogBackdrop onPress={onClose} />
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader className="pb-1">
          <View className="w-full items-center flex-row">
            <View className="mr-3 p-2 rounded-full bg-background-200">
              <Ionicons name={config.icon as any} size={24} color={config.iconColor} />
            </View>
            <Text className="text-lg font-bold text-typography-900">{config.title}</Text>
          </View>
        </AlertDialogHeader>
        
        <AlertDialogBody className="py-4">
          <Text className="text-typography-700">{config.message}</Text>
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
            onPress={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${buttonColorClass}`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white">{config.confirmText}</Text>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationModal;