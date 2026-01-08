import AppGradientContainer from "@/components/layout/app-gradient-container";
import { colors } from "@/lib/constants/colors";
import { queryClient } from "@/lib/utils/query-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useFonts } from "expo-font";
import { SplashScreen, Tabs } from "expo-router";
import { Heart, HomeIcon } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected && !!state.isInternetReachable);
  });
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DmSans: require("~/fonts/DMSans.ttf"),
    "DmSans-Italic": require("~/fonts/DMSans-Italic.ttf"),
  })
  const [cacheRestored, setCacheRestored] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (fontsLoaded && cacheRestored) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, cacheRestored])

  const persister = useMemo(
    () =>
      createAsyncStoragePersister({
        storage: AsyncStorage,
        key: "react-query-cache",
      }),
    []
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 * 7 }}
      onSuccess={() => setCacheRestored(true)}
    >
      <AppGradientContainer style={{ flex: 1, width: Dimensions.get("window").width, justifyContent: "center" }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.white,
            tabBarLabelPosition: "below-icon",
            lazy: true,
            tabBarStyle: {
              position: "absolute",
              bottom: insets.bottom + 20,
              left: "25%",
              transform: [{ translateX: "22%" }],
              width: "70%",
              backgroundColor: "rgba(0,0,0,0.5)",
              borderTopWidth: 0,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
              height: 72,
              borderRadius: 52,
              paddingTop: 10,
              paddingBottom: 20,
              marginHorizontal: "auto",
            },
            animation: "shift",
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
              tabBarLabel: "Home",
              tabBarLabelStyle: {
                color: colors.white,
              },
            }}
          />
          <Tabs.Screen
            name="watchlist"
            options={{
              title: "Wishlist",
              tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
              tabBarLabel: "Watchlist",
              tabBarLabelStyle: {
                color: colors.white,
              },
            }}
          />
        </Tabs>
      </AppGradientContainer>
    </PersistQueryClientProvider>
  )
}
