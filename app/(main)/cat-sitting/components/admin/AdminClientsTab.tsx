import React from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { SittingClient } from '@/lib/sitting-api';

import styles from '../../admin-styles';
import type { Theme } from '../../admin-types';

type AdminClientsTabProps = {
  clients: SittingClient[];
  filteredClients: SittingClient[];
  clientQuery: string;
  isLoadingClients: boolean;
  isDark: boolean;
  theme: Theme;
  onChangeClientQuery: (value: string) => void;
  onEditClient: (client: SittingClient) => void;
  onDeleteClient: (client: SittingClient) => void;
  onOpenClientCreate: () => void;
};

export default function AdminClientsTab({
  clients,
  filteredClients,
  clientQuery,
  isLoadingClients,
  isDark,
  theme,
  onChangeClientQuery,
  onEditClient,
  onDeleteClient,
  onOpenClientCreate,
}: AdminClientsTabProps)  {
  const openNaverMap = async (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const naverMapUrl = `nmap://search?query=${encodedAddress}&appname=com.eunsun.allrecords`;
    const webUrl = `https://map.naver.com/v5/search/${encodedAddress}`;

    try {
      await Linking.openURL(naverMapUrl);
    } catch {
      await Linking.openURL(webUrl);
    }
  };

  return (
    <>
      {isLoadingClients ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : (
        <>
          <View style={styles.filterSection}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: isDark ? '#111827' : '#FFFFFF',
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                  color: theme.text,
                },
              ]}
              placeholder="고객 검색 (이름/고양이/주소)"
              placeholderTextColor={theme.icon}
              value={clientQuery}
              onChangeText={onChangeClientQuery}
            />
          </View>
          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
            {filteredClients.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.icon }]}>
                {clients.length === 0 ? '등록된 고객이 없습니다.' : '검색 결과가 없습니다.'}
              </Text>
            ) : (
              filteredClients.map((client) => (
                <View
                  key={client.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isDark ? '#374151' : '#E5E7EB',
                    },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {client.clientName} · {client.catName}
                  </Text>
                  <Text style={[styles.cardSub, { color: theme.icon }]}>{client.address}</Text>
                  {!!client.entryNote && (
                    <Text style={[styles.cardSub, { color: theme.icon }]}>
                      {client.entryNote}
                    </Text>
                  )}
                  <View style={styles.cardActions}>
                    <Pressable onPress={() => onEditClient(client)}>
                      <Text style={[styles.actionText, { color: theme.tint }]}>수정</Text>
                    </Pressable>
                    <Pressable onPress={() => onDeleteClient(client)}>
                      <Text style={[styles.actionText, { color: '#EF4444' }]}>삭제</Text>
                    </Pressable>
                    <Pressable onPress={() => openNaverMap(client.address)}>
                      <Text style={[styles.actionText, { color: '#2DB400' }]}>네이버지도</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
      <Pressable
        style={[styles.primaryButton, { backgroundColor: theme.tint }]}
        onPress={onOpenClientCreate}
      >
        <Text style={styles.primaryButtonText}>고객 추가</Text>
      </Pressable>
    </>
  );
};
