import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { styles } from './add-care-modal.styles';

type Theme = {
  text: string;
  tint: string;
};

type Props = {
  visible: boolean;
  title: string;
  value: Date;
  mode: 'date' | 'time';
  onChange: (event: any, date?: Date) => void;
  onClose: () => void;
  isDark: boolean;
  theme: Theme;
};

export function DateTimePickerModal({
  visible,
  title,
  value,
  mode,
  onChange,
  onClose,
  isDark,
  theme,
}: Props) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <View
          style={[
            styles.datePickerContent,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              <Pressable onPress={onClose}>
                <Text style={[styles.closeButton, { color: theme.tint }]}>완료</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={value}
              mode={mode}
              display="spinner"
              onChange={onChange}
              locale="ko-KR"
              themeVariant={isDark ? 'dark' : 'light'}
            />
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
