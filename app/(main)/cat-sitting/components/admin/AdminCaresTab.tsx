import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { SittingCare } from '@/lib/sitting-api';

import styles from '../../admin-styles';
import type { Theme } from '../../admin-types';

type CareRange = { from: Date; to: Date };

type AdminCaresTabProps = {
  cares: SittingCare[];
  filteredCares: SittingCare[];
  careQuery: string;
  careFilterFrom: Date | null;
  careFilterTo: Date | null;
  normalizedCareRange: CareRange | null;
  isLoadingCares: boolean;
  isDark: boolean;
  theme: Theme;
  formatMonthLabel: string;
  onChangeCareQuery: (value: string) => void;
  onOpenCareFilterDatePicker: (target: 'from' | 'to') => void;
  onClearCareFilters: () => void;
  onChangeCareMonth: (direction: 'prev' | 'next') => void;
  onEditCare: (care: SittingCare) => void;
  onDeleteCare: (care: SittingCare) => void;
  onOpenCareCreate: () => void;
  formatShortDate: (value: Date) => string;
  formatCareTime: (value: string) => string;
};

export default function AdminCaresTab({
  cares,
  filteredCares,
  careQuery,
  careFilterFrom,
  careFilterTo,
  normalizedCareRange,
  isLoadingCares,
  isDark,
  theme,
  formatMonthLabel,
  onChangeCareQuery,
  onOpenCareFilterDatePicker,
  onClearCareFilters,
  onChangeCareMonth,
  onEditCare,
  onDeleteCare,
  onOpenCareCreate,
  formatShortDate,
  formatCareTime,
}: AdminCaresTabProps)  {
  return (
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
          placeholder="케어 검색 (고객/주소)"
          placeholderTextColor={theme.icon}
          value={careQuery}
          onChangeText={onChangeCareQuery}
        />
        <View style={styles.filterRow}>
          <Pressable
            style={[
              styles.filterChip,
              careFilterFrom && { backgroundColor: theme.tint, borderColor: theme.tint },
            ]}
            onPress={() => onOpenCareFilterDatePicker('from')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: careFilterFrom ? '#FFFFFF' : theme.text },
              ]}
            >
              {careFilterFrom ? `시작 ${formatShortDate(careFilterFrom)}` : '시작일'}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterChip,
              careFilterTo && { backgroundColor: theme.tint, borderColor: theme.tint },
            ]}
            onPress={() => onOpenCareFilterDatePicker('to')}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: careFilterTo ? '#FFFFFF' : theme.text },
              ]}
            >
              {careFilterTo ? `종료 ${formatShortDate(careFilterTo)}` : '종료일'}
            </Text>
          </Pressable>
          {(careFilterFrom || careFilterTo) && (
            <Pressable style={styles.filterClearButton} onPress={onClearCareFilters}>
              <Text style={[styles.filterClearText, { color: theme.tint }]}>초기화</Text>
            </Pressable>
          )}
        </View>
      </View>
      {!normalizedCareRange && (
        <View style={styles.monthRow}>
          <Pressable onPress={() => onChangeCareMonth('prev')}>
            <Text style={[styles.monthArrow, { color: theme.tint }]}>◀</Text>
          </Pressable>
          <Text style={[styles.monthLabel, { color: theme.text }]}>{formatMonthLabel}</Text>
          <Pressable onPress={() => onChangeCareMonth('next')}>
            <Text style={[styles.monthArrow, { color: theme.tint }]}>▶</Text>
          </Pressable>
        </View>
      )}
      {isLoadingCares ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {filteredCares.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.icon }]}>
              {cares.length === 0 ? '등록된 케어가 없습니다.' : '검색 결과가 없습니다.'}
            </Text>
          ) : (
            filteredCares.map((care) => (
              <View
                key={care.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: isDark ? '#374151' : '#E5E7EB',
                  },
                ]}
              >
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {formatCareTime(care.careTime)}
                </Text>
                <Text style={[styles.cardSub, { color: theme.icon }]}>
                  {care.booking?.client?.clientName ?? '고객'} · {care.booking?.catName ?? '-'}
                </Text>
                <Text style={[styles.cardSub, { color: theme.icon }]}>
                  {care.booking?.addressSnapshot ?? '주소 없음'}
                </Text>
                <View style={styles.cardActions}>
                  <Pressable onPress={() => onEditCare(care)}>
                    <Text style={[styles.actionText, { color: theme.tint }]}>수정</Text>
                  </Pressable>
                  <Pressable onPress={() => onDeleteCare(care)}>
                    <Text style={[styles.actionText, { color: '#EF4444' }]}>삭제</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
      <Pressable
        style={[styles.primaryButton, { backgroundColor: theme.tint }]}
        onPress={onOpenCareCreate}
      >
        <Text style={styles.primaryButtonText}>케어 추가</Text>
      </Pressable>
    </>
  );
};
