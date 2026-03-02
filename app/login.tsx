import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const { startGoogleLogin, startAppleLogin, startReviewLogin, user, status } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [showReviewLogin, setShowReviewLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const isLoading = status.tone === 'neutral' && status.label !== 'idle';

  const handleReviewLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    await startReviewLogin(email.trim(), password.trim());
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>allrecords</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>Sign in to manage your clients, schedule, and visit logs.</Text>
      </View>

      <View style={styles.footer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.tint} />
        ) : showReviewLogin ? (
          <View style={styles.reviewForm}>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
              placeholder="Email"
              placeholderTextColor={theme.icon}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.icon }]}
              placeholder="Password"
              placeholderTextColor={theme.icon}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, (!email.trim() || !password.trim()) && styles.buttonDisabled]}
              onPress={handleReviewLogin}
              activeOpacity={0.8}
              disabled={!email.trim() || !password.trim()}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => setShowReviewLogin(false)}>
              <Text style={[styles.linkText, { color: theme.icon }]}>Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.button, styles.appleButton]}
                onPress={startAppleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Continue with Apple</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={startGoogleLogin}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.googleButtonText]}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.emailButton]} onPress={() => setShowReviewLogin(true)}>
              <Text style={[styles.buttonText, styles.emailButtonText]}>Sign in with Email</Text>
            </TouchableOpacity>
          </View>
        )}

        {status.tone === 'error' && status.detail && (
          <Text style={styles.errorText}>{status.detail}</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  appleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  googleButton: {
    backgroundColor: '#000000',
  },
  emailButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  googleButtonText: {
    color: '#ffffff',
  },
  emailButtonText: {
    color: '#000000',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
  },
  reviewForm: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
