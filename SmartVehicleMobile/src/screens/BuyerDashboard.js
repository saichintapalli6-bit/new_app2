import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, Platform, Linking, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, RefreshCcw, FileText, List, Car } from 'lucide-react-native';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { ENDPOINTS, API_BASE } from '../config/api';

const BuyerDashboard = ({ route, navigation }) => {
    const { user } = route.params;
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'transactions'
    const [vehicles, setVehicles] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Purchase Modal States
    const [buyModalVisible, setBuyModalVisible] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [generatedTxnId, setGeneratedTxnId] = useState('');  // auto-generated
    const [purchasing, setPurchasing] = useState(false);

    // Auto-generate a transaction ID
    const generateTxnId = () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `TXN${timestamp}${random}`;
    };

    const API_GET_VEHICLES = ENDPOINTS.BROWSE_VEHICLES;
    const API_PURCHASE = ENDPOINTS.PURCHASE;
    const API_TRANSACTIONS = ENDPOINTS.BUYER_TRANSACTIONS;

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'browse') {
                const response = await axios.get(API_GET_VEHICLES);
                setVehicles(response.data);
            } else {
                console.log(`Fetching transactions for buyer_id=${user.id}`);
                const url = `${API_TRANSACTIONS}?buyer_id=${user.id}`;
                console.log('URL:', url);
                const response = await axios.get(url);
                console.log('Transactions response:', response.data);
                setTransactions(response.data);
            }
        } catch (error) {
            console.error('fetchData error:', error.response?.data || error.message);
            if (Platform.OS === 'web') {
                window.alert(`Error loading data: ${error.response?.data?.error || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handlePurchaseClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setGeneratedTxnId(generateTxnId()); // auto-generate on click
        setBuyModalVisible(true);
    };

    const confirmPurchase = async () => {
        setBuyModalVisible(false);
        setPurchasing(true);
        try {
            const res = await axios.post(API_PURCHASE, {
                vehicle_number: selectedVehicle.vehicle_number,
                buyer_id: user.id,
                buyer_name: user.name,
                buyer_transaction_id: generatedTxnId
            });

            if (res.data.status === 'success') {
                const msg = `Purchase successful!\n\nYour Transaction ID:\n${generatedTxnId}\n\nBlockchain Hash:\n${res.data.transaction_id?.substring(0, 30)}...`;
                if (Platform.OS === 'web') {
                    window.alert(msg);
                } else {
                    Alert.alert('✅ Purchase Successful', msg);
                }
                fetchData();
            }
        } catch (error) {
            const errMsg = error.response?.data?.error || 'Transaction failed. Please try again.';
            if (Platform.OS === 'web') {
                window.alert(errMsg);
            } else {
                Alert.alert('❌ Error', errMsg);
            }
        } finally {
            setPurchasing(false);
        }
    };

    const renderVehicle = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.picture ? (item.picture.startsWith('http') ? item.picture : `${API_BASE}${item.picture}`) : 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=400&q=80' }}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <View style={styles.cardContent}>
                <Text style={styles.vehicleNum}>{item.vehicle_number}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
                <Text style={styles.accidents}>Accidents: {item.accidents_history || 'None'}</Text>

                {item.documents && (
                    <TouchableOpacity
                        style={styles.docButton}
                        onPress={() => {
                            const url = item.documents.startsWith('http') ? item.documents : `${API_BASE}${item.documents}`;
                            Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
                        }}
                    >
                        <FileText color="#f59e0b" size={18} />
                        <Text style={styles.docButtonText}>View Document</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handlePurchaseClick(item)}
                >
                    <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={styles.buyButtonGradient}
                    >
                        <Text style={styles.buyButtonText}>Buy with Blockchain</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderTransaction = ({ item }) => {
        const statusColor = item.status === 'approved' ? '#10b981' : item.status === 'pending' ? '#f59e0b' : '#94a3b8';
        const statusIcon = item.status === 'approved' ? '✅' : item.status === 'pending' ? '⏳' : '❓';
        return (
            <View style={styles.txnCard}>
                <View style={styles.txnHeader}>
                    <Text style={styles.txnVehicle}>🚗 {item.vehicle_number}</Text>
                    <View style={[styles.txnStatusBadge, { borderColor: statusColor, backgroundColor: statusColor + '22' }]}>
                        <Text style={[styles.txnStatusText, { color: statusColor }]}>{statusIcon} {item.status?.toUpperCase()}</Text>
                    </View>
                </View>

                <Text style={styles.txnPrice}>₹{Number(item.price).toLocaleString('en-IN')}</Text>

                <View style={styles.txnDetailRow}>
                    <Text style={styles.txnDetailLabel}>Your TXN ID</Text>
                    <Text style={styles.txnDetailValue}>{item.buyer_transaction_id || '—'}</Text>
                </View>
                <View style={styles.txnDetailRow}>
                    <Text style={styles.txnDetailLabel}>Seller TXN ID</Text>
                    <Text style={[styles.txnDetailValue, { color: item.seller_transaction_id ? '#10b981' : '#f87171' }]}>
                        {item.seller_transaction_id || 'Awaiting seller...'}
                    </Text>
                </View>
                <View style={styles.txnDetailRow}>
                    <Text style={styles.txnDetailLabel}>Date</Text>
                    <Text style={styles.txnDetailValue}>{new Date(item.created_at).toLocaleString()}</Text>
                </View>

                {item.hash_code && (
                    <Text style={styles.txnHash} numberOfLines={1}>🔗 Hash: {item.hash_code}</Text>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <AnimatedBackground
                colors={['#0a1628', '#111827', '#0d2137']}
                particleColor="#10b981"
            />
            <LinearGradient colors={['#111827', '#1f2937']} style={styles.header}>
                <View style={styles.headerRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.welcome}>Hello, <Text style={styles.userName}>{user.name}</Text></Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtnSm} onPress={() => navigation.navigate('Home')}>
                        <LogOut color="#f87171" size={18} />
                        <Text style={styles.logoutTextSm}>Exit</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
                    onPress={() => setActiveTab('browse')}
                >
                    <Car color={activeTab === 'browse' ? '#22d3ee' : '#94a3b8'} size={20} />
                    <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>Browse Vehicles</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
                    onPress={() => setActiveTab('transactions')}
                >
                    <List color={activeTab === 'transactions' ? '#22d3ee' : '#94a3b8'} size={20} />
                    <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>My Transactions</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{activeTab === 'browse' ? 'Available Vehicles' : 'My Transactions'}</Text>
                <TouchableOpacity onPress={fetchData}>
                    <RefreshCcw color="#60a5fa" size={20} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#60a5fa" style={{ marginTop: 50 }} />
            ) : activeTab === 'browse' ? (
                <FlatList
                    key="browse"
                    data={vehicles}
                    renderItem={renderVehicle}
                    keyExtractor={(item) => item.vehicle_number || String(item.id)}
                    numColumns={(Platform.OS === 'web') ? 2 : 1}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No vehicles available at the moment.</Text>
                    }
                />
            ) : (
                <FlatList
                    key="transactions"
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={1}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No transactions found.</Text>
                    }
                />
            )}

            {/* Purchase Confirm Modal */}
            <Modal visible={buyModalVisible} transparent animationType="slide">
                <View style={styles.modalBg}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Confirm Purchase</Text>
                        <Text style={styles.modalSub}>Vehicle: {selectedVehicle?.vehicle_number}</Text>
                        <Text style={styles.modalSub}>Price: ₹{selectedVehicle?.price}</Text>

                        <View style={styles.txnIdBox}>
                            <Text style={styles.txnIdLabel}>🔏 Auto-Generated Transaction ID</Text>
                            <Text style={styles.txnIdValue}>{generatedTxnId}</Text>
                            <Text style={styles.txnIdHint}>Share this ID with the seller after payment to verify your transaction.</Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setBuyModalVisible(false)}>
                                <Text style={styles.modalBtnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtnConfirm, purchasing && { opacity: 0.6 }]} onPress={confirmPurchase} disabled={purchasing}>
                                <Text style={styles.modalBtnConfirmText}>{purchasing ? 'Processing...' : 'Confirm & Pay'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a1628',
    },
    header: {
        paddingTop: (Platform.OS === 'web') ? 40 : 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcome: {
        color: '#9ca3af',
        fontSize: 14,
    },
    userName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutBtnSm: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(248,113,113,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(248,113,113,0.2)',
    },
    logoutTextSm: { color: '#f87171', fontSize: 12, fontWeight: 'bold' },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    list: {
        padding: 20,
        paddingTop: 0,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        width: (Platform.OS === 'web') ? '48%' : '100%',
    },
    cardImage: {
        width: '100%',
        height: 140,
    },
    cardContent: {
        padding: 15,
    },
    vehicleNum: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    price: {
        color: '#10b981',
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    accidents: {
        color: '#9ca3af',
        fontSize: 14,
        marginBottom: 10,
    },
    docButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245,158,11,0.1)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 15,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.3)',
    },
    docButtonText: {
        color: '#f59e0b',
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 13,
    },
    buyButton: {
        height: 45,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buyButtonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 50,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginTop: 15,
        gap: 10,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    activeTab: {
        backgroundColor: 'rgba(34,211,238,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(34,211,238,0.3)',
    },
    tabText: {
        color: '#94a3b8',
        fontWeight: 'bold',
    },
    activeTabText: {
        color: '#22d3ee',
    },
    status: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    date: {
        color: '#94a3b8',
        fontSize: 13,
        marginTop: 5,
    },
    modalBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#1e293b',
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalSub: {
        color: '#cbd5e1',
        fontSize: 16,
        marginBottom: 5,
    },
    modalInput: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1,
        borderColor: '#475569',
        borderRadius: 10,
        color: '#fff',
        padding: 12,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalBtnCancel: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    modalBtnCancelText: {
        color: '#94a3b8',
        fontWeight: 'bold',
    },
    modalBtnConfirm: {
        backgroundColor: '#10b981',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    modalBtnConfirmText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // TXN ID box in modal
    txnIdBox: {
        backgroundColor: 'rgba(34,211,238,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(34,211,238,0.3)',
        borderRadius: 12,
        padding: 14,
        marginTop: 16,
        marginBottom: 20,
    },
    txnIdLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6 },
    txnIdValue: { color: '#22d3ee', fontSize: 15, fontWeight: 'bold', fontFamily: 'monospace', marginBottom: 8 },
    txnIdHint: { color: '#64748b', fontSize: 12 },
    // Transaction cards
    txnCard: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 16,
        marginBottom: 14,
        marginHorizontal: 20,
    },
    txnHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    txnVehicle: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
    txnStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
    },
    txnStatusText: { fontSize: 12, fontWeight: '700' },
    txnPrice: { color: '#10b981', fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
    txnDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    txnDetailLabel: { color: '#64748b', fontSize: 13, flex: 1 },
    txnDetailValue: { color: '#cbd5e1', fontSize: 13, flex: 2, textAlign: 'right' },
    txnHash: {
        color: '#334155',
        fontSize: 11,
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
});

export default BuyerDashboard;
