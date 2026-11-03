import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useAppStore } from '../store/useAppStore';

interface StatCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  type?: 'lent' | 'borrowed' | 'sadaqah';
}

export const StatCard: React.FC<StatCardProps> = ({ title, amount, subtitle, type = 'lent' }) => {
  const isPrivacyMode = useAppStore((state) => state.isPrivacyMode);

  const getTheme = () => {
    switch (type) {
      case 'borrowed':
        return {
          bg: Colors.accent.surface,
          border: Colors.accent.border,
          accent: Colors.accent.gold,
        };
      case 'sadaqah':
        return {
          bg: '#F5F3FF',
          border: '#DDD6FE',
          accent: '#7C3AED',
        };
      default:
        return {
          bg: Colors.primary.surface,
          border: Colors.primary.border,
          accent: Colors.primary.main,
        };
    }
  };

  const theme = getTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.bg, borderColor: theme.border }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.amount, { color: theme.accent }]}>
        {isPrivacyMode ? '৳ ••••••' : `৳ ${amount.toLocaleString('en-IN')}`}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate.muted,
    marginBottom: 6,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.slate.medium,
  },
});
