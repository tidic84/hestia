import { useState, useCallback } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { AlertButton } from '../components/CustomAlert';

type AlertConfig = {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  buttons?: AlertButton[];
};

export function useAlert() {
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((alertConfig: AlertConfig) => {
    setConfig(alertConfig);
  }, []);

  const dismiss = useCallback(() => {
    setConfig(null);
  }, []);

  return {
    alertProps: {
      visible: config !== null,
      title: config?.title ?? '',
      message: config?.message ?? '',
      icon: config?.icon,
      iconColor: config?.iconColor,
      buttons: config?.buttons,
      onDismiss: dismiss,
    },
    showAlert,
  };
}
