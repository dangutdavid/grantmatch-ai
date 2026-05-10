import { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brand } from '@/constants/brand';

type ContainerWidth = 'narrow' | 'medium' | 'wide';

interface ScreenContainerProps {
  children: ReactNode;
  maxWidth?: ContainerWidth;
  scroll?: boolean;
}

const maxWidthBySize: Record<ContainerWidth, number> = {
  narrow: 480,
  medium: 760,
  wide: 1080,
};

export function ScreenContainer({ children, maxWidth = 'wide', scroll = true }: ScreenContainerProps) {
  const { width } = useWindowDimensions();
  const horizontalPadding = width >= 768 ? 32 : 20;
  const contentStyle = [
    styles.content,
    {
      maxWidth: maxWidthBySize[maxWidth],
      paddingHorizontal: horizontalPadding,
    },
  ];

  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContent}>
          <View style={contentStyle}>{children}</View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={contentStyle}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brand.colors.background,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 36,
    width: '100%',
  },
  content: {
    flex: 1,
    paddingTop: 20,
    width: '100%',
  },
});
