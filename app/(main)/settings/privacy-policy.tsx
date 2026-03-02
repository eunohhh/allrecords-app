import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          개인정보 처리방침
        </ThemedText>
        <ThemedText style={[styles.meta, { color: theme.icon }]}>시행일: 2026-01-30</ThemedText>

        <ThemedText style={styles.paragraph}>
          allrecords 앱(이하 "서비스")은 가족 구성원 간의 일정과 정보를 공유하기 위한 비공개
          서비스입니다. 본 개인정보 처리방침은 서비스 이용과 관련하여 어떤 정보를 어떻게
          수집하고 사용하는지 안내합니다.
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          1. 수집하는 개인정보
        </ThemedText>
        <ThemedText style={styles.paragraph}>서비스 제공을 위해 아래 정보를 수집할 수 있습니다.</ThemedText>
        <ThemedText style={styles.list}>
          • 계정 정보: 이름, 이메일, 프로필 사진(선택){'\n'}
          • 가족 구성원 정보: 닉네임, 관계, 생년월일(선택){'\n'}
          • 이용 정보: 앱 사용 기록, 접속 로그, 오류 기록{'\n'}
          • 기기 정보: OS/버전, 기기 식별자(비식별), 푸시 알림 토큰
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          사용자가 직접 입력하거나 업로드하는 메모, 일정, 사진 등 콘텐츠도 서비스 제공을 위해
          저장됩니다.
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          2. 개인정보의 이용 목적
        </ThemedText>
        <ThemedText style={styles.list}>
          • 계정 생성 및 본인 확인{'\n'}
          • 가족 간 일정/메모 공유 기능 제공{'\n'}
          • 알림 발송 및 서비스 운영{'\n'}
          • 오류 분석 및 서비스 개선
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          3. 보관 및 파기
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          개인정보는 목적 달성 후 지체 없이 파기합니다. 다만 관련 법령에 따라 보관이 필요한 경우
          해당 기간 동안 보관 후 파기합니다.
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          4. 제3자 제공 및 처리 위탁
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          서비스는 원칙적으로 개인정보를 제3자에게 제공하지 않습니다. 서비스 운영을 위해 필요한
          경우 최소한의 범위에서 개인정보 처리를 위탁할 수 있으며, 이 경우 본 방침에 공개합니다.
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          5. 이용자 권리
        </ThemedText>
        <ThemedText style={styles.list}>
          • 개인정보 열람, 정정, 삭제 요청{'\n'}
          • 처리 정지 요청{'\n'}
          • 동의 철회
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          위 요청은 아래 문의처로 연락하시면 지체 없이 처리하겠습니다.
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          6. 보안
        </ThemedText>
        <ThemedText style={styles.paragraph}>
          서비스는 개인정보 보호를 위해 합리적인 기술적/관리적 보호조치를 시행합니다.
        </ThemedText>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          7. 문의처
        </ThemedText>
        <View style={[styles.contactBox, { borderColor: theme.icon }]}>
          <ThemedText style={styles.list}>
            • 운영자: 오은{'\n'}
            • 이메일: bdohhhhh@gmail.com
          </ThemedText>
        </View>

        <ThemedText style={[styles.paragraph, { color: theme.icon }]}>
          본 방침은 필요에 따라 업데이트될 수 있으며, 변경 시 앱 내 공지로 안내드립니다.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 8,
  },
  meta: {
    marginBottom: 16,
    fontSize: 12,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 12,
  },
  list: {
    marginBottom: 12,
  },
  contactBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
});
