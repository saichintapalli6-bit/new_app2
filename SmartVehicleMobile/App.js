import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform, View } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import BuyerDashboard from './src/screens/BuyerDashboard';
import SellerDashboard from './src/screens/SellerDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import WebViewScreen from './src/screens/WebViewScreen';

const Stack = createStackNavigator();

export default function App() {
  // Mobile (APK) should start with WebView wrapper
  // Web (Browser) should start with the normal Home screen
  const isWeb = Platform.OS === 'web';
  const initialRoute = isWeb ? "Home" : "WebView";

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            cardStyle: { flex: 1, backgroundColor: '#060714' },
          }}
        >
          {/* WebView Screen (Initial) */}
          <Stack.Screen name="WebView" component={WebViewScreen} />

          {/* Core App Screens (Optional) */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="BuyerDashboard" component={BuyerDashboard} />
          <Stack.Screen name="SellerDashboard" component={SellerDashboard} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#060714',
    // Web: fill 100% of browser window (works on Chrome, Edge, Safari, Firefox)
    ...(Platform.OS === 'web' && {
      width: '100%',
      height: '100%',
      minHeight: '100vh',
      position: 'fixed',   // Edge fix: ensures full coverage
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }),
  },
});

