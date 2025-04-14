import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform, SafeAreaView } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_TEMPO && Platform.OS === "web") {
      const { TempoDevtools } = require("tempo-devtools");
      TempoDevtools.init();
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack
          screenOptions={({ route }) => ({
            headerShown: !route.name.startsWith("tempobook"),
            headerStyle: {
              backgroundColor: "#111827", // Dark background to match the app theme
            },
            headerTintColor: "#fff", // White text
            headerTitleStyle: {
              fontWeight: "bold",
            },
            contentStyle: {
              backgroundColor: "#fff",
            },
          })}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </SafeAreaView>
    </ThemeProvider>
  );
}
