import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { theme } from '@/design/theme';
import { Text } from '@/components/primitives/Text';

/**
 * Barre d'onglets épurée à fond de verre dépoli (Apple Wallet-like). Le
 * bouton central « Scanner » est mis en exergue par un disque néon.
 */

type IconName = 'dashboard' | 'binder' | 'scan' | 'market';

const GLYPH: Record<IconName, string> = {
  dashboard: '◈',
  binder: '▦',
  scan: '⊡',
  market: '📈',
};

function TabIcon({
  name,
  focused,
  label,
}: {
  name: IconName;
  focused: boolean;
  label: string;
}) {
  return (
    <View style={styles.tabItem}>
      <Text
        style={[
          styles.glyph,
          { color: focused ? theme.color.accent : theme.color.textTertiary },
        ]}
      >
        {GLYPH[name]}
      </Text>
      <Text
        variant="micro"
        color={focused ? 'textPrimary' : 'textTertiary'}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarShowLabel: false,
      }}
      screenListeners={{
        tabPress: () => Haptics.selectionAsync(),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="dashboard" focused={focused} label="Vault" />
          ),
        }}
      />
      <Tabs.Screen
        name="binder"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="binder" focused={focused} label="Classeur" />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.scanButton}>
              <Text style={styles.scanGlyph}>{GLYPH.scan}</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="market" focused={focused} label="Marché" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 8,
    elevation: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 64,
  },
  glyph: {
    fontSize: 20,
    lineHeight: 22,
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.color.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
    shadowColor: theme.color.accent,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  scanGlyph: {
    fontSize: 26,
    color: theme.color.textPrimary,
  },
});
