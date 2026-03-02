import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/providers/auth-provider';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: insets.top }}>
            {/* Header / Profile Section */}
            <View style={[styles.profileSection, { borderBottomColor: theme.icon }]}>
                <TouchableOpacity 
                style={styles.profileHeader} 
                onPress={() => setDropdownOpen(!dropdownOpen)}
                activeOpacity={0.7}
                >
                <Image
                    source={{ uri: user?.image || 'https://via.placeholder.com/150' }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={[styles.email, { color: theme.text }]} numberOfLines={1}>{user?.email || 'user@example.com'}</Text>
                    <IconSymbol 
                        name={dropdownOpen ? "chevron.up" : "chevron.down"} 
                        size={16} 
                        color={theme.icon} 
                    />
                </View>
                </TouchableOpacity>

                {/* Dropdown Content */}
                {dropdownOpen && (
                    <View style={styles.dropdown}>
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => {
                            setDropdownOpen(false);
                            router.push('/settings/my-info');
                        }}>
                            <Text style={[styles.dropdownText, { color: theme.text }]}>My Info</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                            <Text style={[styles.dropdownText, { color: 'red' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Navigation Items */}
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    profileSection: {
        padding: 16,
        borderBottomWidth: 0.2, // Subtle divider
        marginBottom: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    userInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    email: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    dropdown: {
        marginTop: 12,
        marginLeft: 52, // Align with text
    },
    dropdownItem: {
        paddingVertical: 10,
    },
    dropdownText: {
        fontSize: 15,
        fontWeight: '500',
    },
});
