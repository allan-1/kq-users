import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AppProvider } from '@/providers/app-provider';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerBackTitle: 'Back',
          }}>
          <Stack.Screen name="index" options={{ title: 'Users', headerShown: false }} />
          <Stack.Screen name="user/[id]" options={{ title: 'User' }} />
          <Stack.Screen name="post/[id]" options={{ title: 'Post' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppProvider>
  );
}
