import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ActivityIndicator, Platform, ScrollView, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { Car, User, Mail, Phone, Lock, ChevronRight, CheckCircle, XCircle, CreditCard, Library } from 'lucide-react-native';
import { ENDPOINTS } from '../config/api';

const RegisterScreen = ({ navigation }) => {
    const { width } = Dimensions.get('window');
    const isLargeWeb = Platform.OS === 'web' && width > 800;

    const [form, setForm] = useState({
        name: '', email: '', loginid: '', mobile: '', password: '', confirmPassword: '',
        bank_account_number: '', ifsc_code: '', bank_name: ''
    });
    const [role, setRole] = useState('buyer');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg: '' }

    const update = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: null }));
    };

    const showToast = (type, msg) => {
        setToast({ type, msg });
        if (type === 'success') {
            // Auto navigate to Login after 2 seconds
            setTimeout(() => {
                setToast(null);
                navigation.navigate('Login');
            }, 2000);
        } else {
            setTimeout(() => setToast(null), 4000);
        }
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        else if (form.name.trim().length < 3) e.name = 'Min 3 characters';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
        if (!form.loginid.trim()) e.loginid = 'Login ID required';
        if (!form.mobile.trim()) e.mobile = 'Mobile required';
        else if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Must be 10 digits';
        if (!form.password) e.password = 'Password required';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(form.password)) {
            e.password = 'Must be 8+ chars and include upper, lower, digit & special char';
        }
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

        if (role === 'seller') {
            if (!form.bank_account_number.trim()) e.bank_account_number = 'Bank Account Number required';
            if (!form.ifsc_code.trim()) e.ifsc_code = 'IFSC Code required';
            if (!form.bank_name.trim()) e.bank_name = 'Bank Name required';
        }

        setFieldErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const response = await axios.post(ENDPOINTS.REGISTER, {
                name: form.name.trim(),
                email: form.email.trim(),
                loginid: form.loginid.trim(),
                mobile: form.mobile.trim(),
                password: form.password,
                role,
                ...(role === 'seller' && {
                    bank_account_number: form.bank_account_number.trim(),
                    ifsc_code: form.ifsc_code.trim(),
                    bank_name: form.bank_name.trim(),
                })
            });
            showToast('success', response.data.message || 'Registered! Redirecting to login...');
        } catch (error) {
            let msg = 'Registration failed. Please try again.';
            if (error.response) {
                msg = error.response.data?.error || `Server Error: ${error.response.status}`;
            } else if (error.request) {
                msg = 'Network Error: Cannot connect to server. Check IP & WiFi.';
            } else {
                msg = `Error: ${error.message}`;
            }
            showToast('error', msg);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { key: 'buyer', label: '🛒 Buyer', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: '#10b981' },
        { key: 'seller', label: '🚗 Seller', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: '#60a5fa' },
    ];

    const fields = [
        { key: 'name', label: 'Full Name', icon: <User color="#475569" size={18} />, placeholder: 'Enter your full name', secure: false, keyboard: 'default' },
        { key: 'email', label: 'Email Address', icon: <Mail color="#475569" size={18} />, placeholder: 'Enter your email', secure: false, keyboard: 'email-address' },
        { key: 'loginid', label: 'Login ID', icon: <User color="#475569" size={18} />, placeholder: 'Choose a login ID', secure: false, keyboard: 'default' },
        { key: 'mobile', label: 'Mobile Number', icon: <Phone color="#475569" size={18} />, placeholder: '10-digit mobile', secure: false, keyboard: 'phone-pad' },
        { key: 'password', label: 'Password', icon: <Lock color="#475569" size={18} />, placeholder: 'Min 8 characters', secure: true, keyboard: 'default' },
        { key: 'confirmPassword', label: 'Confirm Password', icon: <Lock color="#475569" size={18} />, placeholder: 'Re-enter password', secure: true, keyboard: 'default' },
    ];

    if (role === 'seller') {
        fields.push(
            { key: 'bank_account_number', label: 'Bank Account Number', icon: <CreditCard color="#475569" size={18} />, placeholder: 'Enter Account Number', secure: false, keyboard: 'number-pad' },
            { key: 'ifsc_code', label: 'IFSC Code', icon: <Library color="#475569" size={18} />, placeholder: 'Enter IFSC Code', secure: false, keyboard: 'default' },
            { key: 'bank_name', label: 'Bank Name', icon: <Library color="#475569" size={18} />, placeholder: 'Enter Bank Name', secure: false, keyboard: 'default' }
        );
    }

    const stylesOptions = getStyles(isLargeWeb);


    return (
        <View style={stylesOptions.root}>
            <AnimatedBackground colors={['#060714', '#0a1020', '#0d1830']} particleColor="#22d3ee" />

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
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={stylesOptions.navLink}>Sign In →</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={stylesOptions.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={stylesOptions.centerWrapper}>
                    {/* Left Panel - Web only */}
                    {isLargeWeb && (
                        <View style={stylesOptions.leftPanel}>
                            <View style={stylesOptions.leftBadge}>
                                <Text style={stylesOptions.leftBadgeText}>🚀 Join the Platform</Text>
                            </View>
                            <Text style={stylesOptions.leftTitle}>Create Your{'\n'}Blockchain{'\n'}Identity</Text>
                            <Text style={stylesOptions.leftSubtitle}>
                                Register as Buyer or Seller and participate in blockchain-powered vehicle transactions.
                            </Text>
                            <View style={stylesOptions.steps}>
                                {[
                                    { num: '01', title: 'Register', sub: 'Fill in your details below' },
                                    { num: '02', title: 'Admin Review', sub: 'Admin verifies your account' },
                                    { num: '03', title: 'Start Trading', sub: 'Buy or sell vehicles securely' },
                                ].map((s, i) => (
                                    <View key={i} style={stylesOptions.step}>
                                        <View style={stylesOptions.stepNum}>
                                            <Text style={stylesOptions.stepNumText}>{s.num}</Text>
                                        </View>
                                        <View>
                                            <Text style={stylesOptions.stepTitle}>{s.title}</Text>
                                            <Text style={stylesOptions.stepSub}>{s.sub}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Register Card */}
                    <View style={stylesOptions.card}>
                        <LinearGradient
                            colors={['rgba(34,211,238,0.06)', 'rgba(37,99,235,0.03)']}
                            style={StyleSheet.absoluteFillObject}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        />
                        <Text style={stylesOptions.cardTitle}>Create Account</Text>
                        <Text style={stylesOptions.cardSubtitle}>Register to trade vehicles on blockchain</Text>

                        {/* Role Selector */}
                        <View style={stylesOptions.roleRow}>
                            {roles.map((r) => (
                                <TouchableOpacity
                                    key={r.key}
                                    style={[stylesOptions.roleBtn, role === r.key && { backgroundColor: r.bg, borderColor: r.border, borderWidth: 1.5 }]}
                                    onPress={() => setRole(r.key)}
                                >
                                    <Text style={[stylesOptions.roleBtnText, role === r.key && { color: r.color }]}>{r.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Form Fields */}
                        <View style={isLargeWeb ? stylesOptions.fieldsGrid : stylesOptions.fieldsList}>
                            {fields.map((f) => (
                                <View key={f.key} style={[stylesOptions.fieldGroup, isLargeWeb && stylesOptions.fieldGroupWeb]}>
                                    <Text style={stylesOptions.fieldLabel}>{f.label}</Text>
                                    <View style={[
                                        stylesOptions.inputWrapper,
                                        focusedField === f.key && stylesOptions.inputFocused,
                                        fieldErrors[f.key] && stylesOptions.inputError,
                                    ]}>
                                        {f.icon}
                                        <TextInput
                                            style={stylesOptions.input}
                                            placeholder={f.placeholder}
                                            placeholderTextColor="#334155"
                                            value={form[f.key]}
                                            onChangeText={(v) => update(f.key, v)}
                                            secureTextEntry={f.secure}
                                            keyboardType={f.keyboard}
                                            autoCapitalize="none"
                                            onFocus={() => setFocusedField(f.key)}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </View>
                                    {fieldErrors[f.key] && (
                                        <Text style={stylesOptions.errorText}>⚠ {fieldErrors[f.key]}</Text>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* Info Box */}
                        <View style={stylesOptions.infoBox}>
                            <Text style={stylesOptions.infoText}>
                                ℹ️ After registration, admin will review and activate your account.
                            </Text>
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity style={stylesOptions.regBtn} onPress={handleRegister} disabled={loading}>
                            <LinearGradient colors={['#06b6d4', '#2563eb']} style={stylesOptions.regBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                {loading
                                    ? <ActivityIndicator color="#fff" />
                                    : <><Text style={stylesOptions.regBtnText}>Create Account</Text><ChevronRight color="#fff" size={20} /></>
                                }
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={stylesOptions.loginLink} onPress={() => navigation.navigate('Login')}>
                            <Text style={stylesOptions.loginLinkText}>Already have an account? Sign In →</Text>
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
        position: 'absolute', top: 70, left: '50%',
        transform: [{ translateX: -150 }],
        width: 300,
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14,
        zIndex: 999, borderWidth: 1,
    },
    toastSuccess: {
        backgroundColor: 'rgba(16,185,129,0.15)',
        borderColor: 'rgba(16,185,129,0.4)',
    },
    toastError: {
        backgroundColor: 'rgba(239,68,68,0.15)',
        borderColor: 'rgba(239,68,68,0.4)',
    },
    toastText: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },

    // NAVBAR
    navbar: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: isLargeWeb ? 60 : 20, paddingVertical: 14,
        backgroundColor: 'rgba(6,7,20,0.9)',
        borderBottomWidth: 1, borderBottomColor: 'rgba(34,211,238,0.1)',
    },
    navBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    brandText: { color: '#fff', fontSize: isLargeWeb ? 17 : 13, fontWeight: 'bold', marginLeft: 8 },
    navLink: { color: '#22d3ee', fontSize: isLargeWeb ? 15 : 13, fontWeight: '600' },

    scrollContent: {
        flexGrow: 1, justifyContent: 'center', alignItems: 'center',
        paddingTop: 90, paddingBottom: 40, paddingHorizontal: isLargeWeb ? 40 : 16,
    },
    centerWrapper: {
        flexDirection: isLargeWeb ? 'row' : 'column',
        alignItems: isLargeWeb ? 'flex-start' : 'center',
        gap: isLargeWeb ? 60 : 0,
        width: '100%', maxWidth: isLargeWeb ? 1100 : 500, justifyContent: 'center',
    },

    leftPanel: { flex: 1, maxWidth: 400, paddingRight: 10, paddingTop: 10 },
    leftBadge: {
        backgroundColor: 'rgba(34,211,238,0.1)', borderWidth: 1,
        borderColor: 'rgba(34,211,238,0.3)', paddingHorizontal: 14,
        paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 28,
    },
    leftBadgeText: { color: '#22d3ee', fontSize: 13, fontWeight: '600' },
    leftTitle: { fontSize: isLargeWeb ? 48 : 32, fontWeight: 'bold', color: '#fff', lineHeight: isLargeWeb ? 58 : 40, marginBottom: 18 },
    leftSubtitle: { fontSize: isLargeWeb ? 16 : 14, color: '#64748b', lineHeight: 26, marginBottom: 36 },
    steps: { gap: 20 },
    step: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    stepNum: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(34,211,238,0.1)', borderWidth: 1,
        borderColor: 'rgba(34,211,238,0.3)', justifyContent: 'center', alignItems: 'center',
    },
    stepNumText: { color: '#22d3ee', fontWeight: 'bold', fontSize: 13 },
    stepTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
    stepSub: { color: '#475569', fontSize: 13 },

    card: {
        width: isLargeWeb ? 580 : '100%', borderRadius: 24, borderWidth: 1,
        borderColor: 'rgba(34,211,238,0.15)', padding: isLargeWeb ? 40 : 24,
        overflow: 'hidden', backgroundColor: 'rgba(10,15,35,0.85)',
    },
    cardTitle: { fontSize: isLargeWeb ? 28 : 24, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
    cardSubtitle: { fontSize: isLargeWeb ? 15 : 13, color: '#475569', marginBottom: 24 },

    roleRow: {
        flexDirection: 'row', gap: 12, marginBottom: 24,
        backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 5,
    },
    roleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
    roleBtnText: { color: '#475569', fontWeight: '700', fontSize: isLargeWeb ? 15 : 13 },

    fieldsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 16 },
    fieldsList: { gap: 14, marginBottom: 16 },
    fieldGroup: { width: '100%' },
    fieldGroupWeb: { width: '47%' },
    fieldLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 6 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        paddingHorizontal: 14, height: isLargeWeb ? 48 : 46, gap: 10,
    },
    inputFocused: { borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.05)' },
    inputError: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)' },
    input: { flex: 1, color: '#fff', fontSize: isLargeWeb ? 15 : 14, height: '100%', outlineStyle: 'none' },
    errorText: { color: '#f87171', fontSize: 12, marginTop: 4 },

    infoBox: {
        backgroundColor: 'rgba(34,211,238,0.05)', borderWidth: 1,
        borderColor: 'rgba(34,211,238,0.15)', borderRadius: 12, padding: 14, marginBottom: 20,
    },
    infoText: { color: '#64748b', fontSize: 13, lineHeight: 20 },

    regBtn: { height: isLargeWeb ? 52 : 48, borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
    regBtnGrad: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    regBtnText: { color: '#fff', fontWeight: 'bold', fontSize: isLargeWeb ? 17 : 15 },

    loginLink: { alignItems: 'center' },
    loginLinkText: { color: '#22d3ee', fontSize: isLargeWeb ? 14 : 13, fontWeight: '600' },
});

export default RegisterScreen;
