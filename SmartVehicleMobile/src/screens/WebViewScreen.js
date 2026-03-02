import React from 'react';
import { StyleSheet, View, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewScreen = () => {
    const WEB_URL = 'https://digital-smart-vehicle-procurement.onrender.com';

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                source={{ uri: WEB_URL }}
                style={styles.webview}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#7c3aed" />
                    </View>
                )}
                // Ensures smooth experience on mobile
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsBackForwardNavigationGestures={true}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webview: {
        flex: 1,
    },
    loading: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    }
});

export default WebViewScreen;
