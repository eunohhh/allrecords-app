import React from 'react';
import { Pressable, Text, View } from 'react-native';

import styles from '../../admin-styles';
import type { AdminTab, Theme } from '../../admin-types';

type AdminTabsProps = {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
  theme: Theme;
};

export default function AdminTabs({ activeTab, onChangeTab, theme }: AdminTabsProps) {
  return (
    <View style={styles.tabRow}>
      {(['clients', 'bookings', 'cares'] as AdminTab[]).map((tab) => (
        <Pressable
          key={tab}
          style={[styles.tabButton, activeTab === tab && { backgroundColor: theme.tint }]}
          onPress={() => onChangeTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === tab ? '#FFFFFF' : theme.text,
              },
            ]}
          >
            {tab === 'clients' ? '고객' : tab === 'bookings' ? '예약' : '케어'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};
