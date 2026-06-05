import React from 'react';
import { Tabs } from 'expo-router';
import { GlassTabBar } from '@/components/navigation/GlassTabBar';

/**
 * Onglets pilotés par une barre custom en verre flottant (`GlassTabBar`).
 * On délègue tout le rendu à ce composant pour obtenir l'indicateur lumineux
 * magnétique et le bouton central néon — impossible avec la tab bar par défaut.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="binder" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="market" />
    </Tabs>
  );
}
