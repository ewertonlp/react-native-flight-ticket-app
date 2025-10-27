import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { SearchProvider } from "@/contexts/SearchContexts";
import BottomNavBar from "@/components/BottomNavBar";

// export const unstable_settings = {
//   anchor: "(tabs)",
// };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SearchProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          {/* <Stack.Screen name="(tabs)" /> */}
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          <Stack.Screen name="departure" />
          <Stack.Screen name="destination" />
          <Stack.Screen name="departureDate" />
          <Stack.Screen name="searchResult" />
          <Stack.Screen name="brandedUpsell" />
          <Stack.Screen name="flightDetails" />
        </Stack>
        <BottomNavBar/>
        <StatusBar style="auto" />
      </SearchProvider>
    </ThemeProvider>
  );
}
