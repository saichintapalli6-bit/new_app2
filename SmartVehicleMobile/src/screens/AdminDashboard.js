import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, Platform, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, UserCheck, LogOut, RefreshCcw, Shield, Search, CheckCircle, XCircle } from 'lucide-react-native';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { ENDPOINTS } from '../config/api';

const AdminDashboard = ({ route, navigation }) => {
    const user = route?.params?.user || { name: 'System Administrator' };
    const [activeTab, setActiveTab] = useState('buyers'); // 'buyers' | 'sellers' | 'transactions' | 'vehicles'
    const [buyers, setBuyers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchBuyers = useCallback(async () => {
        try {
            const res = await axios.get(ENDPOINTS.ADMIN_BUYERS);
            setBuyers(res.data);
        } catch (e) {
            showToast('error', 'Failed to load buyers');
        }
    }, []);

    const fetchSellers = useCallback(async () => {
        try {
            const res = await axios.get(ENDPOINTS.ADMIN_SELLERS);
            setSellers(res.data);
        } catch (e) {
            showToast('error', 'Failed to load sellers');
        }
    }, []);

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await axios.get(ENDPOINTS.ADMIN_TRANSACTIONS);
            setTransactions(res.data);
        } catch (e) {
            showToast('error', 'Failed to load transactions');
        }
    }, []);

    const fetchVehicles = useCallback(async () => {
        try {
            const res = await axios.get(ENDPOINTS.BROWSE_VEHICLES);
            setVehicles(res.data);
        } catch (e) {
            showToast('error', 'Failed to load vehicles');
        }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchBuyers(), fetchSellers(), fetchTransactions(), fetchVehicles()]);
        setLoading(false);
    }, [fetchBuyers, fetchSellers, fetchTransactions, fetchVehicles]);

    useEffect(() => { fetchAll(); }, []);

    // Transaction Verification Modal
    const [verifyModalVisible, setVerifyModalVisible] = useState(false);
    const [selectedTxn, setSelectedTxn] = useState(null);

    const openVerifyModal = (txn) => {
        setSelectedTxn(txn);
        setVerifyModalVisible(true);
    };

    const handleApproveTransaction = async () => {
        if (!selectedTxn) return;
        setVerifyModalVisible(false);
        try {
            const res = await axios.post(ENDPOINTS.ADMIN_APPROVE_TRANSACTION, { hash_code: selectedTxn.hash_code });
            showToast('success', res.data.message);
            setTransactions(prev => prev.map(t => t.hash_code === selectedTxn.hash_code ? { ...t, status: 'approved' } : t));
        } catch (e) {
            showToast('error', 'Failed to approve transaction');
        }
    };

    const handleDeleteUser = async (id, role) => {
        const confirmDelete = Platform.OS === 'web'
            ? window.confirm(`Are you sure you want to delete this ${role}?`)
            : await new Promise((resolve) => {
                Alert.alert(
                    'Confirm Delete',
                    `Are you sure you want to delete this ${role}?`,
                    [
                        { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                        { text: 'Delete', onPress: () => resolve(true), style: 'destructive' }
                    ]
                );
            });

        if (!confirmDelete) return;

        try {
            const res = await axios.post(ENDPOINTS.ADMIN_DELETE_USER, { user_id: id, role });
            showToast('success', res.data.message || `${role} deleted successfully`);
            if (role === 'buyer') {
                setBuyers(prev => prev.filter(u => u.id !== id));
            } else {
                setSellers(prev => prev.filter(u => u.id !== id));
            }
        } catch (e) {
            showToast('error', `Failed to delete ${role}`);
        }
    };

    const handleToggle = async (id, currentStatus, type) => {
        if (type === 'transaction') {
            try {
                const res = await axios.post(ENDPOINTS.ADMIN_APPROVE_TRANSACTION, { hash_code: id });
                showToast('success', res.data.message);
                setTransactions(prev => prev.map(t => t.hash_code === id ? { ...t, status: 'approved' } : t));
            } catch (e) {
                showToast('error', 'Failed to approve transaction');
            }
            return;
        }

        const action = currentStatus === 'Active' ? 'deactivate' : 'activate';
        const endpoint = type === 'buyer' ? ENDPOINTS.ADMIN_ACTIVATE_BUYER : ENDPOINTS.ADMIN_ACTIVATE_SELLER;
        try {
            const res = await axios.post(endpoint, { id, action });
            showToast('success', res.data.message);
            if (type === 'buyer') {
                setBuyers(prev => prev.map(u => u.id === id ? { ...u, status: res.data.status } : u));
            } else {
                setSellers(prev => prev.map(u => u.id === id ? { ...u, status: res.data.status } : u));
            }
        } catch (e) {
            showToast('error', 'Failed to update user status');
        }
    };

    const currentList = activeTab === 'buyers' ? buyers : activeTab === 'sellers' ? sellers : activeTab === 'transactions' ? transactions : vehicles;
    const filtered = currentList.filter(item => {
        const term = searchText.toLowerCase();
        if (activeTab === 'transactions') {
            return item.vehicle_number?.toLowerCase().includes(term) || item.buyer_name?.toLowerCase().includes(term) || item.hash_code?.toLowerCase().includes(term);
        }
        if (activeTab === 'vehicles') {
            return item.vehicle_number?.toLowerCase().includes(term);
        }
        return item.name?.toLowerCase().includes(term) || item.loginid?.toLowerCase().includes(term) || item.email?.toLowerCase().includes(term);
    });

    const stats = [
        { label: 'Total Buyers', value: buyers.length, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
        { label: 'Active Buyers', value: buyers.filter(u => u.status === 'Active').length, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', border: 'rgba(34,211,238,0.3)' },
        { label: 'Total Sellers', value: sellers.length, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)' },
        { label: 'Pending Users', value: [...buyers, ...sellers].filter(u => u.status === 'waiting').length, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
    ];

    return (
        <View style={styles.root}>
            <AnimatedBackground colors={['#060714', '#0a0a1a', '#050510']} particleColor="#f59e0b" />

            {/* Toast */}
            {toast && (
                <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
                    {toast.type === 'success' ? <CheckCircle color="#10b981" size={18} /> : <XCircle color="#ef4444" size={18} />}
                    <Text style={styles.toastText}>{toast.msg}</Text>
                </View>
            )}

            {/* NAVBAR */}
            <View style={styles.navbar}>
                <View style={styles.navLeft}>
                    <Shield color="#f59e0b" size={20} />
                    <Text style={styles.navTitle} numberOfLines={1}>Admin</Text>
                    <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>
                </View>
                <View style={styles.navRight}>
                    <TouchableOpacity style={styles.refreshBtn} onPress={fetchAll}>
                        <RefreshCcw color="#94a3b8" size={14} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.navigate('Home')}>
                        <LogOut color="#ef4444" size={14} />
                        <Text style={styles.logoutBtnText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* WELCOME */}
                <View style={styles.welcomeRow}>
                    <View>
                        <Text style={styles.welcomeHello}>Welcome back, <Text style={styles.welcomeName}>{user.name}</Text></Text>
                        <Text style={styles.welcomeSub}>Manage vehicle platform users and monitor activity</Text>
                    </View>
                    {loading && <ActivityIndicator color="#f59e0b" size="small" />}
                </View>

                {/* STATS CARDS */}
                <View style={styles.statsGrid}>
                    {stats.map((s, i) => (
                        <View key={i} style={[styles.statCard, { backgroundColor: s.bg, borderColor: s.border }]}>
                            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* USER MANAGEMENT TABLE */}
                <View style={styles.tableSection}>
                    {/* Table Header */}
                    <View style={styles.tableHeader}>
                        <View style={styles.tableHeaderLeft}>
                            <Users color="#f59e0b" size={20} />
                            <Text style={styles.tableTitle}>User Management</Text>
                        </View>
                        <View style={styles.tabs}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'buyers' && styles.tabActive]}
                                onPress={() => { setActiveTab('buyers'); setSearchText(''); }}
                            >
                                <Text style={[styles.tabText, activeTab === 'buyers' && styles.tabTextActive]}>
                                    🛒 Buyers ({buyers.length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'sellers' && styles.tabActiveSeller]}
                                onPress={() => { setActiveTab('sellers'); setSearchText(''); }}
                            >
                                <Text style={[styles.tabText, activeTab === 'sellers' && styles.tabTextActiveSeller]}>
                                    🚗 Sellers ({sellers.length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'transactions' && styles.tabActiveTransactions]}
                                onPress={() => { setActiveTab('transactions'); setSearchText(''); }}
                            >
                                <Text style={[styles.tabText, activeTab === 'transactions' && styles.tabTextActiveTransactions]}>
                                    💱 Transactions ({transactions.length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'vehicles' && styles.tabActiveVehicles]}
                                onPress={() => { setActiveTab('vehicles'); setSearchText(''); }}
                            >
                                <Text style={[styles.tabText, activeTab === 'vehicles' && styles.tabTextActiveVehicles]}>
                                    🚗 Vehicles ({vehicles.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search */}
                    <View style={styles.searchBox}>
                        <Search color="#475569" size={16} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={`Search ${activeTab}...`}
                            placeholderTextColor="#334155"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    {/* Scrollable Table Content */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                        <View style={{ minWidth: (Platform.OS === 'web') ? '100%' : 700 }}>
                            {/* Column Headers */}
                            <View style={styles.colHeader}>
                                {activeTab === 'transactions' ? (
                                    ['#', 'Vehicle', 'Buyer', 'Price', 'Status', 'Hash Code', 'Action'].map((col, i) => (
                                        <Text key={i} style={[styles.colHeaderText, i === 0 && { width: 40 }, i === 5 && { flex: 2 }, i === 6 && { width: 130, textAlign: 'center' }]}>{col}</Text>
                                    ))
                                ) : activeTab === 'vehicles' ? (
                                    ['#', 'Vehicle Number', 'Price', 'Accidents', 'Action'].map((col, i) => (
                                        <Text key={i} style={[styles.colHeaderText, i === 0 && { width: 40 }, i === 4 && { width: 100, textAlign: 'center' }]}>{col}</Text>
                                    ))
                                ) : (
                                    ['#', 'Login ID', 'Name', 'Email', 'Mobile', 'Status', 'Action'].map((col, i) => (
                                        <Text key={i} style={[styles.colHeaderText, i === 0 && { width: 40 }, i === 6 && { width: 180, textAlign: 'center' }]}>{col}</Text>
                                    ))
                                )}
                            </View>

                            {/* Rows */}
                            {loading ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator color="#f59e0b" size="large" />
                                    <Text style={styles.loadingText}>Loading data...</Text>
                                </View>
                            ) : filtered.length === 0 ? (
                                <View style={styles.emptyRow}>
                                    <Text style={styles.emptyText}>No {activeTab} found</Text>
                                </View>
                            ) : activeTab === 'transactions' ? (
                                filtered.map((t, idx) => (
                                    <View key={t.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                        <Text style={[styles.cell, { width: 40, color: '#64748b', fontSize: 12 }]}>{idx + 1}</Text>
                                        <Text style={[styles.cell, styles.cellLoginId]}>{t.vehicle_number}</Text>
                                        <Text style={[styles.cell, styles.cellName]}>{t.buyer_name}</Text>
                                        <Text style={[styles.cell, styles.cellEmail]}>₹{t.price}</Text>
                                        <View style={[styles.cell, { width: 90 }]}>
                                            <View style={[styles.statusBadge, t.status === 'approved' ? styles.statusActive : styles.statusWaiting]}>
                                                <Text style={[styles.statusText, t.status === 'approved' ? { color: '#10b981' } : { color: '#f59e0b' }]}>
                                                    {t.status}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.cell, { flex: 2, fontSize: 10, color: '#334155' }]} numberOfLines={1}>{t.hash_code}</Text>
                                        <View style={[styles.cell, { width: 130 }]}>
                                            {t.status === 'pending' && (
                                                <TouchableOpacity
                                                    style={[styles.actionBtn, styles.activateBtn]}
                                                    onPress={() => openVerifyModal(t)}
                                                >
                                                    <Text style={styles.actionBtnText}>Verify</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                ))
                            ) : activeTab === 'vehicles' ? (
                                filtered.map((v, idx) => (
                                    <View key={v.vehicle_number} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                        <Text style={[styles.cell, { width: 40, color: '#64748b', fontSize: 12 }]}>{idx + 1}</Text>
                                        <Text style={[styles.cell, styles.cellLoginId]}>{v.vehicle_number}</Text>
                                        <Text style={[styles.cell, { color: '#10b981' }]}>₹{v.price}</Text>
                                        <Text style={[styles.cell, { color: '#94a3b8' }]}>{v.accidents_history || 'None'}</Text>
                                        <View style={[styles.cell, { width: 100, alignItems: 'center' }]}>
                                            <Text style={{ color: '#64748b', fontSize: 12 }}>View Only</Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                filtered.map((u, idx) => (
                                    <View key={u.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                        <Text style={[styles.cell, { width: 40, color: '#64748b', fontSize: 12 }]}>{idx + 1}</Text>
                                        <Text style={[styles.cell, styles.cellLoginId]}>{u.loginid}</Text>
                                        <Text style={[styles.cell, styles.cellName]}>{u.name}</Text>
                                        <Text style={[styles.cell, styles.cellEmail]}>{u.email}</Text>
                                        <Text style={[styles.cell, styles.cellMobile]}>{u.mobile || '—'}</Text>
                                        <View style={[styles.cell, { width: 90 }]}>
                                            <View style={[
                                                styles.statusBadge,
                                                u.status === 'Active' ? styles.statusActive :
                                                    u.status === 'Inactive' ? styles.statusInactive :
                                                        styles.statusWaiting
                                            ]}>
                                                <Text style={[
                                                    styles.statusText,
                                                    u.status === 'Active' ? { color: '#10b981' } :
                                                        u.status === 'Inactive' ? { color: '#ef4444' } :
                                                            { color: '#f59e0b' }
                                                ]}>
                                                    {u.status === 'waiting' ? 'Pending' : u.status}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={[styles.cell, { width: 180, flexDirection: 'row', gap: 6, justifyContent: 'center' }]}>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, u.status === 'Active' ? styles.deactivateBtn : styles.activateBtn]}
                                                onPress={() => handleToggle(u.id, u.status, activeTab === 'buyers' ? 'buyer' : 'seller')}
                                            >
                                                <Text style={styles.actionBtnText}>
                                                    {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.actionBtn, styles.deleteBtn]}
                                                onPress={() => handleDeleteUser(u.id, activeTab === 'buyers' ? 'buyer' : 'seller')}
                                            >
                                                <Text style={styles.actionBtnText}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </ScrollView>

                    {/* Table Footer */}
                    <View style={styles.tableFooter}>
                        <Text style={styles.footerText}>
                            Showing {filtered.length} of {currentList.length} {activeTab}
                        </Text>
                    </View>
                </View>

            </ScrollView>

            {/* Verification Modal */}
            {verifyModalVisible && selectedTxn && (() => {
                const buyerTxn = selectedTxn.buyer_transaction_id;
                const sellerTxn = selectedTxn.seller_transaction_id;
                const bothProvided = buyerTxn && sellerTxn;
                const idsMatch = bothProvided && (buyerTxn === sellerTxn);
                const idsMismatch = bothProvided && (buyerTxn !== sellerTxn);

                return (
                    <View style={styles.modalBg}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>🔍 Verify Transaction</Text>
                            <Text style={styles.verifyVehicle}>Vehicle: {selectedTxn.vehicle_number}  |  ₹{selectedTxn.price}</Text>

                            {/* Buyer TXN */}
                            <View style={[styles.verifyRow, { borderColor: buyerTxn ? 'rgba(34,211,238,0.5)' : 'rgba(239,68,68,0.5)' }]}>
                                <Text style={styles.verifyStepLabel}>STEP 1 — Buyer's Payment TXN ID</Text>
                                <Text style={[styles.verifyValue, { color: buyerTxn ? '#22d3ee' : '#ef4444' }]}>
                                    {buyerTxn || '❌ Buyer did not provide a Transaction ID'}
                                </Text>
                                <Text style={styles.verifyHint}>Auto-generated when buyer clicked "Buy with Blockchain"</Text>
                            </View>

                            {/* Seller TXN */}
                            <View style={[styles.verifyRow, { borderColor: sellerTxn ? 'rgba(96,165,250,0.5)' : 'rgba(245,158,11,0.5)' }]}>
                                <Text style={styles.verifyStepLabel}>STEP 2 — Seller's Payment TXN ID</Text>
                                <Text style={[styles.verifyValue, { color: sellerTxn ? '#60a5fa' : '#f59e0b' }]}>
                                    {sellerTxn || '⏳ Seller has not entered TXN ID yet'}
                                </Text>
                                <Text style={styles.verifyHint}>Seller enters this from their bank/UPI statement</Text>
                            </View>

                            {/* Result */}
                            <View style={[styles.verifyResultBox,
                            idsMatch ? styles.verifyResultMatch :
                                idsMismatch ? styles.verifyResultMismatch :
                                    styles.verifyResultPending
                            ]}>
                                <Text style={styles.verifyResultText}>
                                    {!bothProvided
                                        ? '⏳ Waiting for both parties to provide their TXN IDs'
                                        : idsMatch
                                            ? '✅ IDs Match! Safe to process payment'
                                            : '⚠️ IDs do NOT match — Do NOT approve!'}
                                </Text>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setVerifyModalVisible(false)}>
                                    <Text style={styles.modalBtnCancelText}>Close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalBtnConfirm, !idsMatch && { opacity: 0.4, backgroundColor: '#475569' }]}
                                    onPress={handleApproveTransaction}
                                    disabled={!idsMatch}
                                >
                                    <Text style={styles.modalBtnConfirmText}>
                                        {idsMatch ? '✅ Process Payment' : '🔒 Cannot Approve'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                );
            })()}
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#060714' },

    // TOAST
    toast: {
        position: 'absolute', top: 70, alignSelf: 'center',
        width: (Platform.OS === 'web') ? 420 : '90%',
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 18, paddingVertical: 12,
        borderRadius: 12, zIndex: 999, borderWidth: 1,
    },
    toastSuccess: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' },
    toastError: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' },
    toastText: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },

    // NAVBAR
    navbar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 40 : 16, paddingVertical: 14,
        backgroundColor: 'rgba(6,7,20,0.95)',
        borderBottomWidth: 1, borderBottomColor: 'rgba(245,158,11,0.2)',
        zIndex: 100,
    },
    navLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    navTitle: { color: '#fff', fontSize: (Platform.OS === 'web') ? 20 : 16, fontWeight: 'bold', marginLeft: 4 },
    adminBadge: {
        backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.4)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    adminBadgeText: { color: '#f59e0b', fontSize: 11, fontWeight: '700' },
    navRight: { flexDirection: 'row', gap: 12 },
    refreshBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    },
    refreshBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    },
    logoutBtnText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: (Platform.OS === 'web') ? 40 : 16, paddingVertical: 28, paddingBottom: 60 },

    // WELCOME
    welcomeRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 28,
    },
    welcomeHello: { fontSize: (Platform.OS === 'web') ? 20 : 16, color: '#94a3b8', marginBottom: 4 },
    welcomeName: { color: '#fff', fontWeight: 'bold' },
    welcomeSub: { fontSize: (Platform.OS === 'web') ? 15 : 13, color: '#475569' },

    // STATS
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32,
    },
    statCard: {
        flex: 1, minWidth: (Platform.OS === 'web') ? 180 : 140, borderRadius: 16,
        borderWidth: 1, padding: (Platform.OS === 'web') ? 24 : 16,
    },
    statValue: { fontSize: (Platform.OS === 'web') ? 40 : 30, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { color: '#64748b', fontSize: (Platform.OS === 'web') ? 14 : 12 },

    // TABLE SECTION
    tableSection: {
        backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 24 : 16, paddingVertical: 18,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 12,
    },
    tableHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    tableTitle: { color: '#fff', fontSize: (Platform.OS === 'web') ? 18 : 15, fontWeight: 'bold' },
    tabs: { flexDirection: 'row', gap: 8 },
    tab: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    tabActive: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' },
    tabActiveSeller: { backgroundColor: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.4)' },
    tabActiveTransactions: { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.4)' },
    tabText: { color: '#64748b', fontWeight: '600', fontSize: (Platform.OS === 'web') ? 14 : 12 },
    tabTextActive: { color: '#10b981' },
    tabTextActiveSeller: { color: '#60a5fa' },
    tabTextActiveTransactions: { color: '#f59e0b' },

    // SEARCH
    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginHorizontal: (Platform.OS === 'web') ? 24 : 16, marginVertical: 14,
        backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
        paddingHorizontal: 14, height: 44,
    },
    searchInput: { flex: 1, color: '#fff', fontSize: 14, outlineStyle: 'none' },

    // TABLE
    colHeader: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 24 : 16, paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    colHeaderText: { flex: 1, color: '#475569', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    tableRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 24 : 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.01)' },
    cell: { flex: 1, color: '#cbd5e1', fontSize: (Platform.OS === 'web') ? 14 : 12, paddingRight: 8 },
    cellLoginId: { color: '#60a5fa', fontWeight: '600' },
    cellName: { color: '#e2e8f0', fontWeight: '500' },
    cellEmail: { color: '#94a3b8', fontSize: (Platform.OS === 'web') ? 13 : 11 },
    cellMobile: { color: '#64748b' },

    statusBadge: {
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
        borderWidth: 1, alignSelf: 'flex-start',
    },
    statusActive: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' },
    statusInactive: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' },
    statusWaiting: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' },
    statusText: { fontSize: 12, fontWeight: '700' },

    activateBtn: {
        paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8,
        backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)', flex: 1, alignItems: 'center'
    },
    deactivateBtn: {
        paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8,
        backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', flex: 1, alignItems: 'center'
    },
    deleteBtn: {
        paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8,
        backgroundColor: 'rgba(220,38,38,0.15)', borderWidth: 1, borderColor: 'rgba(220,38,38,0.4)', flex: 1, alignItems: 'center'
    },
    actionBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },

    loadingRow: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    loadingText: { color: '#475569', fontSize: 14 },
    emptyRow: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { color: '#475569', fontSize: 15 },

    tableFooter: {
        paddingHorizontal: (Platform.OS === 'web') ? 24 : 16, paddingVertical: 14,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    },
    footerText: { color: '#475569', fontSize: 13 },

    // Modal
    modalBg: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center',
        padding: 20, zIndex: 1000,
    },
    modalCard: {
        backgroundColor: '#1e293b', width: '100%', maxWidth: 400,
        borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    modalSub: { color: '#cbd5e1', fontSize: 14, marginBottom: 20 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
    modalBtnCancelText: { color: '#94a3b8', fontWeight: 'bold' },
    modalBtnConfirm: { backgroundColor: '#10b981', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
    modalBtnConfirmText: { color: '#fff', fontWeight: 'bold' },
    tabActiveVehicles: { backgroundColor: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.4)' },
    tabTextActiveVehicles: { color: '#a78bfa' },

    // Verify Modal extra styles
    verifyVehicle: { color: '#94a3b8', fontSize: 13, marginBottom: 16 },
    verifyRow: {
        borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    verifyStepLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
    verifyValue: { fontSize: 15, fontWeight: 'bold', marginBottom: 4, fontFamily: 'monospace' },
    verifyHint: { color: '#334155', fontSize: 11 },
    verifyResultBox: {
        borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1,
    },
    verifyResultMatch: { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.4)' },
    verifyResultMismatch: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.4)' },
    verifyResultPending: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' },
    verifyResultText: { color: '#fff', fontWeight: '700', fontSize: 14, textAlign: 'center' },
});

export default AdminDashboard;
