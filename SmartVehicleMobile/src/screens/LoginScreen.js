import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ActivityIndicator, Platform, Dimensions, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { Car, Lock, User, ChevronRight, CheckCircle, XCircle } from 'lucide-react-native';
import { ENDPOINTS } from '../config/api';

const LoginScreen = ({ navigation, route }) => {
    const { width } = Dimensions.get('window');
    const isLargeWeb = Platform.OS === 'web' && width > 800;

    // Pre-select role if passed from Home page buttons
    const defaultRole = route?.params?.role || 'buyer';

    const [loginid, setLoginid] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(defaultRole);
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg: '' }

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleLogin = async () => {
        if (!loginid.trim() || !password) {
            showToast('error', 'Please enter Login ID and Password');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(ENDPOINTS.LOGIN, {
                loginid: loginid.trim(),
                password,
                role,
            });
            if (response.data) {
                const user = response.data;
                // Navigate immediately without Alert
                if (role === 'buyer') navigation.navigate('BuyerDashboard', { user });
                else if (role === 'seller') navigation.navigate('SellerDashboard', { user });
                else if (role === 'admin') navigation.navigate('AdminDashboard', { user });
            }
        } catch (error) {
            let msg = 'Login failed. Check credentials.';
            if (error.response) {
                // Server responded with an error (4xx, 5xx)
                msg = error.response.data?.error || `Server Error: ${error.response.status}`;
            } else if (error.request) {
                // Request was made but no response received
                msg = 'Network Error: Cannot connect to server. Check IP & WiFi.';
                console.log('Network Error Details:', error.message);
            } else {
                msg = `Error: ${error.message}`;
            }
            showToast('error', msg);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { key: 'buyer', label: 'Buyer', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: '#10b981' },
        { key: 'seller', label: 'Seller', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: '#60a5fa' },
        { key: 'admin', label: 'Admin', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: '#fbbf24' },
    ];

    const stylesOptions = getStyles(isLargeWeb);

    return (
        <View style={stylesOptions.root}>
            <AnimatedBackground colors={['#060714', '#0d0621', '#0f0029']} particleColor="#8b5cf6" />

            {/* Toast Notification */}
            {toast && (
                <View style={[stylesOptions.toast, toast.type === 'success' ? stylesOptions.toastSuccess : stylesOptions.toastError]}>
                    {toast.type === 'success'
                        ? <CheckCircle color="#10b981" size={20} />
                        : <XCircle color="#ef4444" size={20} />}
                    <Text style={stylesOptions.toastText}>{toast.msg}</Text>
                </View>
            )}

            {/* Navbar */}
            <View style={stylesOptions.navbar}>
                <TouchableOpacity style={stylesOptions.navBrand} onPress={() => navigation.navigate('Home')}>
                    <Car color="#22d3ee" size={24} />
                    <Text style={stylesOptions.brandText}>Smart Vehicle Procurement</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                    <Text style={stylesOptions.navHomeLink}>← Back to Home</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={stylesOptions.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={stylesOptions.centerWrapper}>
                    {/* Left Panel - Web only */}
                    {isLargeWeb && (
                        <View style={stylesOptions.leftPanel}>
                            <View style={stylesOptions.leftBadge}>
                                <Text style={stylesOptions.leftBadgeText}>🔐 Secure Login</Text>
                            </View>
                            <Text style={stylesOptions.leftTitle}>Welcome to{'\n'}Smart Vehicle{'\n'}Platform</Text>
                            <Text style={stylesOptions.leftSubtitle}>
                                Access your dashboard to manage vehicle transactions secured by blockchain technology.
                            </Text>
                            <View style={stylesOptions.leftFeatures}>
                                {[
                                    '✓  Blockchain Secured',
                                    '✓  Real-time Updates',
                                    '✓  Smart Contract Enabled',
                                ].map((f, i) => (
                                    <Text key={i} style={stylesOptions.leftFeatureText}>{f}</Text>
                                ))}
                            </View>

                            {/* Admin hint
                            <View style={stylesOptions.adminHint}>
                                <Text style={stylesOptions.adminHintTitle}>🔑 Admin Credentials</Text>
                                <Text style={stylesOptions.adminHintText}>Login ID: <Text style={stylesOptions.adminHintVal}>admin</Text></Text>
                                <Text style={stylesOptions.adminHintText}>Password: <Text style={stylesOptions.adminHintVal}>admin</Text></Text>
                            </View> */}
                        </View>
                    )}

                    {/* Login Card */}
                    <View style={stylesOptions.card}>
                        <LinearGradient
                            colors={['rgba(139,92,246,0.08)', 'rgba(109,40,217,0.04)']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />
                        <Text style={stylesOptions.cardTitle}>Welcome Back</Text>
                        <Text style={stylesOptions.cardSubtitle}>Login to your account</Text>

                        {/* Role Selector */}
                        <View style={stylesOptions.roleContainer}>
                            {roles.map((r) => (
                                <TouchableOpacity
                                    key={r.key}
                                    style={[stylesOptions.roleBtn, role === r.key && { backgroundColor: r.bg, borderColor: r.border, borderWidth: 1 }]}
                                    onPress={() => setRole(r.key)}
                                >
                                    <Text style={[stylesOptions.roleBtnText, role === r.key && { color: r.color }]}>
                                        {r.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Login ID */}
                        <View style={[stylesOptions.inputWrapper, focusedField === 'id' && stylesOptions.inputWrapperFocused]}>
                            <User color={focusedField === 'id' ? '#8b5cf6' : '#475569'} size={18} />
                            <TextInput
                                style={stylesOptions.input}
                                placeholder="Login ID"
                                placeholderTextColor="#475569"
                                value={loginid}
                                onChangeText={setLoginid}
                                autoCapitalize="none"
                                onFocus={() => setFocusedField('id')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>

                        {/* Password */}
                        <View style={[stylesOptions.inputWrapper, focusedField === 'pw' && stylesOptions.inputWrapperFocused]}>
                            <Lock color={focusedField === 'pw' ? '#8b5cf6' : '#475569'} size={18} />
                            <TextInput
                                style={stylesOptions.input}
                                placeholder="Password"
                                placeholderTextColor="#475569"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                onFocus={() => setFocusedField('pw')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity style={stylesOptions.loginBtn} onPress={handleLogin} disabled={loading}>
                            <LinearGradient
                                colors={['#8b5cf6', '#6d28d9']} style={stylesOptions.loginBtnGrad}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            >
                                {loading
                                    ? <ActivityIndicator color="#fff" />
                                    : <><Text style={stylesOptions.loginBtnText}>Sign In</Text><ChevronRight color="#fff" size={20} /></>
                                }
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={stylesOptions.divider}>
                            <View style={stylesOptions.dividerLine} />
                            <Text style={stylesOptions.dividerText}>or</Text>
                            <View style={stylesOptions.dividerLine} />
                        </View>

                        <TouchableOpacity style={stylesOptions.registerBtn} onPress={() => navigation.navigate('Register')}>
                            <Text style={stylesOptions.registerBtnText}>Create New Account →</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                            <Text style={stylesOptions.backLink}>← Back to Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const getStyles = (isLargeWeb) => StyleSheet.create({
    root: { flex: 1, backgroundColor: '#060714' },

    // TOAST
    toast: {
        position: 'absolute', top: 70, alignSelf: 'center',
        width: isLargeWeb ? 480 : '90%',
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 20, paddingVertical: 14,
        borderRadius: 14, zIndex: 999, borderWidth: 1,
    },
    toastSuccess: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' },
    toastError: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' },
    toastText: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },

    // NAVBAR
    navbar: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: isLargeWeb ? 60 : 20, paddingVertical: 14,
        backgroundColor: 'rgba(6,7,20,0.85)',
        borderBottomWidth: 1, borderBottomColor: 'rgba(139,92,246,0.1)',
    },
    navBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    brandText: { color: '#fff', fontSize: isLargeWeb ? 17 : 13, fontWeight: 'bold', marginLeft: 8 },
    navHomeLink: { color: '#8b5cf6', fontSize: isLargeWeb ? 15 : 13, fontWeight: '600' },

    scrollContent: {
        flexGrow: 1, justifyContent: 'center', alignItems: 'center',
        paddingTop: 80, paddingBottom: 40, paddingHorizontal: isLargeWeb ? 40 : 20,
    },
    centerWrapper: {
        flexDirection: isLargeWeb ? 'row' : 'column', alignItems: 'center',
        gap: isLargeWeb ? 60 : 0, width: '100%',
        maxWidth: isLargeWeb ? 1000 : 500, justifyContent: 'center',
    },

    // LEFT PANEL
    leftPanel: { flex: 1, maxWidth: 440, paddingRight: 20 },
    leftBadge: {
        backgroundColor: 'rgba(139,92,246,0.1)', borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.3)', paddingHorizontal: 14,
        paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 28,
    },
    leftBadgeText: { color: '#a78bfa', fontSize: 13, fontWeight: '600' },
    leftTitle: {
        fontSize: isLargeWeb ? 50 : 36, fontWeight: 'bold', color: '#fff',
        lineHeight: isLargeWeb ? 60 : 44, marginBottom: 20,
    },
    leftSubtitle: { fontSize: isLargeWeb ? 17 : 14, color: '#64748b', lineHeight: 26, marginBottom: 24 },
    leftFeatures: { gap: 10, marginBottom: 28 },
    leftFeatureText: { color: '#94a3b8', fontSize: 15 },
    adminHint: {
        backgroundColor: 'rgba(251,191,36,0.08)', borderWidth: 1,
        borderColor: 'rgba(251,191,36,0.25)', padding: 16, borderRadius: 14,
    },
    adminHintTitle: { color: '#fbbf24', fontWeight: 'bold', fontSize: 14, marginBottom: 8 },
    adminHintText: { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
    adminHintVal: { color: '#fbbf24', fontWeight: 'bold' },

    // CARD
    card: {
        width: isLargeWeb ? 420 : '100%', borderRadius: 24, borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.2)', padding: isLargeWeb ? 40 : 28,
        overflow: 'hidden', backgroundColor: 'rgba(15,10,40,0.8)',
    },
    cardTitle: { fontSize: isLargeWeb ? 30 : 26, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
    cardSubtitle: { fontSize: isLargeWeb ? 16 : 14, color: '#64748b', marginBottom: 28 },

    roleContainer: {
        flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14, padding: 4, marginBottom: 24,
    },
    roleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    roleBtnText: { color: '#64748b', fontWeight: '600', fontSize: isLargeWeb ? 14 : 13 },

    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 16, marginBottom: 16, height: isLargeWeb ? 54 : 50, gap: 12,
    },
    inputWrapperFocused: { borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.07)' },
    input: { flex: 1, color: '#fff', fontSize: isLargeWeb ? 16 : 15, height: '100%', outlineStyle: 'none' },

    loginBtn: { height: isLargeWeb ? 54 : 50, borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 24 },
    loginBtnGrad: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: isLargeWeb ? 17 : 16 },

    divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
    dividerText: { color: '#475569', fontSize: 13 },

    registerBtn: {
        height: isLargeWeb ? 50 : 46, borderRadius: 14, borderWidth: 1,
        borderColor: 'rgba(139,92,246,0.3)', justifyContent: 'center',
        alignItems: 'center', marginBottom: 20,
    },
    registerBtnText: { color: '#a78bfa', fontWeight: '600', fontSize: isLargeWeb ? 15 : 14 },
    backLink: { color: '#475569', textAlign: 'center', fontSize: 13 },
});

export default LoginScreen;
