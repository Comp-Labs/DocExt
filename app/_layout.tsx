import 'expo-dev-client';
import 'react-native-gesture-handler';
import { useEffect, useMemo } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { TamaguiProvider, Theme } from 'tamagui'
import { PortalProvider } from '@tamagui/portal'
import { config } from '../tamagui.config'
import { useQuickActionRouting, RouterAction } from "expo-quick-actions/router";
import * as QuickActions from "expo-quick-actions";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
    initialRouteName: 'index',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    useQuickActionRouting();
    const colorScheme = useColorScheme()
    const { theme } = useMaterial3Theme({ sourceColor: '#076AF7', fallbackSourceColor: '#076AF7' });
    const paperTheme = useMemo(
        () =>
            colorScheme === 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light },
        [colorScheme, theme]
    );

    const [interLoaded, interError] = useFonts({
        Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    })

    useEffect(() => {
        if (interLoaded || interError) {
            // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
            SplashScreen.hideAsync()
        }

        QuickActions.setItems<RouterAction>([
            {
                title: "Scan Document",
                icon: "compose",
                id: "0",
                params: { href: "/scanner" },
            }
        ]);
    }, [interLoaded, interError])

    if (!interLoaded && !interError) {
        return null
    }

    return (
        <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
                <TamaguiProvider config={config} defaultTheme={colorScheme!}>
                    <PortalProvider shouldAddRootHost>
                        <Theme name={colorScheme}>
                            <Theme name="blue">
                                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                                    <Stack>
                                    </Stack>
                                </ThemeProvider>
                            </Theme>
                        </Theme>
                    </PortalProvider>
                </TamaguiProvider>
            </PaperProvider>
        </SafeAreaProvider>
    )
}
