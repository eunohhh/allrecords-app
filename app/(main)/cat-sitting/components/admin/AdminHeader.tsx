import React from 'react';
import { Pressable, Text, View } from 'react-native';

import styles from '../../admin-styles';
import type { Theme } from '../../admin-types';

type AdminHeaderProps = {
  theme: Theme;
  onOpenDrawer: () => void;
  onClose: () => void;
};

export default function AdminHeader({ theme, onOpenDrawer, onClose }: AdminHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.headerSide} onPress={onOpenDrawer}>
        <Text style={[styles.headerAction, { color: theme.tint }]}>메뉴</Text>
      </Pressable>
      <Text style={[styles.title, { color: theme.text }]}>관리자</Text>
      <Pressable style={styles.headerSide} onPress={onClose}>
        <Text style={[styles.headerAction, { color: theme.tint }]}>닫기</Text>
      </Pressable>
    </View>
  );
};
