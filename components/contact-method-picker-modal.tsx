import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { styles } from './add-care-modal.styles';

type Theme = {
  text: string;
  icon: string;
  tint: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  theme: Theme;
  isDark: boolean;
};

export function ContactMethodPickerModal({
  visible,
  onClose,
  options,
  selected,
  onSelect,
  theme,
  isDark,
}: Props) {
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
            styles.pickerContent,
            { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>문의 경로</Text>
              <Pressable onPress={onClose}>
                <Text style={[styles.closeButton, { color: theme.tint }]}>완료</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.bookingList}>
              {options.map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.bookingItem,
                    {
                      backgroundColor:
                        selected === option ? theme.tint + '20' : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <Text style={[styles.bookingName, { color: theme.text }]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
