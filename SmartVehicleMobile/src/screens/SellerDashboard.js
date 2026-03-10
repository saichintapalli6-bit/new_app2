import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, ActivityIndicator, Platform, Image, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Car, PlusCircle, History, LogOut, RefreshCcw,
    CheckCircle, XCircle, Hash, DollarSign, AlertTriangle,
    FileText, ExternalLink, Upload, ImageIcon,
} from 'lucide-react-native';
import axios from 'axios';
import AnimatedBackground from '../components/AnimatedBackground';
import { ENDPOINTS } from '../config/api';

// ─── Helper ────────────────────────────────────────────────────────────────────
const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Component ─────────────────────────────────────────────────────────────────
const SellerDashboard = ({ route, navigation }) => {
    const user = route?.params?.user || { name: 'Seller', id: '' };

    const [activeTab, setActiveTab] = useState('add');
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [focusField, setFocusField] = useState(null);

    const [form, setForm] = useState({
        vehicle_number: '',
        price: '',
        accidents_history: '',
        photo_url: '',
        documents_url: '',
    });
    const [formErrors, setFormErrors] = useState({});

    // file upload states
    const [photoFile, setPhotoFile] = useState(null);   // { name, base64, preview, size }
    const [docFile, setDocFile] = useState(null);   // { name, base64, size }

    // ─── Toast ───────────────────────────────────────────────────────────────────
    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    // ─── Transaction Modal ───────────────────────────────────────────────────────
    const [txnModalVisible, setTxnModalVisible] = useState(false);
    const [selectedHash, setSelectedHash] = useState('');
    const [sellerTxnIdInput, setSellerTxnIdInput] = useState('');

    const openTxnModal = (hash) => {
        setSelectedHash(hash);
        setSellerTxnIdInput('');
        setTxnModalVisible(true);
    };

    const submitSellerTxnId = async () => {
        if (!sellerTxnIdInput.trim()) {
            showToast('error', 'Please enter your Transaction ID');
            return;
        }
        setTxnModalVisible(false);
        try {
            const res = await axios.post(ENDPOINTS.SELLER_UPDATE_TRANSACTION, {
                hash_code: selectedHash,
                seller_transaction_id: sellerTxnIdInput.trim()
            });
            showToast('success', res.data.message || 'Transaction ID submitted');
        } catch (err) {
            showToast('error', 'Failed to update transaction ID');
        }
    };

    // ─── Fetch history ───────────────────────────────────────────────────────────
    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${ENDPOINTS.SELLER_VEHICLE_HISTORY}?seller_id=${user.id}`);
            setVehicles(res.data);
        } catch {
            showToast('error', 'Failed to load vehicle history');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab, fetchHistory]);

    // ─── Form helpers ────────────────────────────────────────────────────────────
    const update = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (formErrors[key]) setFormErrors(prev => ({ ...prev, [key]: null }));
    };

    const validate = () => {
        const e = {};
        const vn = form.vehicle_number.trim().toUpperCase();
        if (!vn) e.vehicle_number = 'Vehicle number is required';
        else if (!/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(vn))
            e.vehicle_number = 'Format: AP34DH5001 (2 letters, 2 digits, 2 letters, 4 digits)';
        if (!form.price.trim()) e.price = 'Price is required';
        else if (isNaN(Number(form.price)) || Number(form.price) <= 0)
            e.price = 'Enter a valid price (e.g. 250000)';
        setFormErrors(e);
        return Object.keys(e).length === 0;
    };

    // ─── File pickers (web via DOM input) ────────────────────────────────────────
    const pickPhotoFile = () => {
        if (!(Platform.OS === 'web')) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                const dataUrl = evt.target.result;
                setPhotoFile({ name: file.name, base64: dataUrl.split(',')[1], preview: dataUrl, size: file.size });
                update('photo_url', ''); // clear URL field when file selected
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    const pickDocFile = () => {
        if (!(Platform.OS === 'web')) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                setDocFile({ name: file.name, base64: evt.target.result.split(',')[1], size: file.size });
                update('documents_url', ''); // clear URL field when file selected
            };
            reader.readAsDataURL(file);
        };
        input.click();
    };

    // ─── Submit ──────────────────────────────────────────────────────────────────
    const handleAddVehicle = async () => {
        if (!validate()) return;
        setSubmitting(true);
        try {
            const payload = {
                vehicle_number: form.vehicle_number.trim().toUpperCase(),
                price: form.price.trim(),
                accidents_history: form.accidents_history.trim(),
                seller_id: user.id,
                // URL fields (used when no file selected)
                photo_url: photoFile ? '' : form.photo_url.trim(),
                documents_url: docFile ? '' : form.documents_url.trim(),
                // Base64 file fields
                ...(photoFile ? { photo_base64: photoFile.base64, photo_filename: photoFile.name } : {}),
                ...(docFile ? { doc_base64: docFile.base64, doc_filename: docFile.name } : {}),
            };
            const res = await axios.post(ENDPOINTS.SELLER_ADD_VEHICLE, payload);
            showToast('success', res.data.message || 'Vehicle added successfully!');
            setForm({ vehicle_number: '', price: '', accidents_history: '', photo_url: '', documents_url: '' });
            setPhotoFile(null);
            setDocFile(null);
        } catch (err) {
            showToast('error', err.response?.data?.error || 'Failed to add vehicle.');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Tabs config ─────────────────────────────────────────────────────────────
    const tabs = [
        { key: 'add', icon: '➕', label: 'Add Vehicle' },
        { key: 'history', icon: '📋', label: 'Vehicle History' },
    ];

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <AnimatedBackground colors={['#060714', '#0a1520', '#040f1c']} particleColor="#60a5fa" />

            {/* Toast */}
            {toast && (
                <View style={[styles.toast, toast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
                    {toast.type === 'success'
                        ? <CheckCircle color="#10b981" size={18} />
                        : <XCircle color="#ef4444" size={18} />}
                    <Text style={styles.toastText}>{toast.msg}</Text>
                </View>
            )}

            {/* NAVBAR */}
            <View style={styles.navbar}>
                <View style={styles.navLeft}>
                    <Car color="#60a5fa" size={20} />
                    <Text style={styles.navTitle} numberOfLines={1}>Seller</Text>
                    <View style={styles.sellerBadge}>
                        <Text style={styles.sellerBadgeText}>Pro</Text>
                    </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexShrink: 1 }}>
                    <View style={styles.navRight}>
                        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.navigate('Home')}>
                            <LogOut color="#ef4444" size={14} />
                            <Text style={styles.logoutBtnText}>Exit</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>

            {/* TABS */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBarScroll}>
                {tabs.map((t) => (
                    <TouchableOpacity
                        key={t.key}
                        style={[
                            styles.tabBtn,
                            activeTab === t.key && (t.key === 'add' ? styles.tabBtnActiveGreen : styles.tabBtnActiveBlue),
                        ]}
                        onPress={() => setActiveTab(t.key)}
                    >
                        <Text style={styles.tabIcon}>{t.icon}</Text>
                        <Text style={[styles.tabBtnText, activeTab === t.key && { color: '#fff' }]}>
                            {t.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── ADD VEHICLE TAB ───────────────────────────────────────────────── */}
                {activeTab === 'add' && (
                    <View style={styles.centerCard}>
                        {/* Left info panel (web only) */}
                        {(Platform.OS === 'web') && (
                            <View style={styles.infoPanel}>
                                <View style={styles.infoBadge}>
                                    <Text style={styles.infoBadgeText}>🚗 List Your Vehicle</Text>
                                </View>
                                <Text style={styles.infoTitle}>Add Your Vehicle{'\n'}to Blockchain</Text>
                                <Text style={styles.infoSub}>
                                    Register your vehicle on the blockchain network for secure and transparent trading.
                                </Text>
                                <View style={styles.infoSteps}>
                                    {[
                                        { icon: '🔢', title: 'Vehicle Number', desc: 'Format: AP34DH5001' },
                                        { icon: '💰', title: 'Set Price', desc: 'Enter asking price in INR' },
                                        { icon: '📷', title: 'Upload Photo', desc: 'JPG/PNG or image URL' },
                                        { icon: '📄', title: 'Upload Documents', desc: 'PDF ownership certificate' },
                                        { icon: '⛓️', title: 'Blockchain Secured', desc: 'Immutable record created' },
                                    ].map((s, i) => (
                                        <View key={i} style={styles.infoStep}>
                                            <Text style={styles.infoStepIcon}>{s.icon}</Text>
                                            <View>
                                                <Text style={styles.infoStepTitle}>{s.title}</Text>
                                                <Text style={styles.infoStepDesc}>{s.desc}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Form Card */}
                        <View style={styles.formCard}>
                            <LinearGradient
                                colors={['rgba(96,165,250,0.06)', 'rgba(37,99,235,0.03)']}
                                style={StyleSheet.absoluteFillObject}
                            />
                            <Text style={styles.formTitle}>Register Vehicle</Text>
                            <Text style={styles.formSub}>Fields marked * are required</Text>

                            {/* Vehicle Number */}
                            <View style={styles.fGroup}>
                                <Text style={styles.fLabel}>Vehicle Number *</Text>
                                <View style={[styles.fInput, focusField === 'vn' && styles.fInputFocus, formErrors.vehicle_number && styles.fInputError]}>
                                    <Hash color={focusField === 'vn' ? '#60a5fa' : '#475569'} size={18} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="AP34DH5001"
                                        placeholderTextColor="#334155"
                                        value={form.vehicle_number}
                                        onChangeText={(v) => update('vehicle_number', v.toUpperCase())}
                                        autoCapitalize="characters"
                                        maxLength={10}
                                        onFocus={() => setFocusField('vn')}
                                        onBlur={() => setFocusField(null)}
                                    />
                                </View>
                                {formErrors.vehicle_number && <Text style={styles.fError}>⚠ {formErrors.vehicle_number}</Text>}
                                <Text style={styles.fHint}>Format: 2 letters + 2 digits + 2 letters + 4 digits</Text>
                            </View>

                            {/* Price */}
                            <View style={styles.fGroup}>
                                <Text style={styles.fLabel}>Price (INR) *</Text>
                                <View style={[styles.fInput, focusField === 'pr' && styles.fInputFocus, formErrors.price && styles.fInputError]}>
                                    <DollarSign color={focusField === 'pr' ? '#60a5fa' : '#475569'} size={18} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 250000"
                                        placeholderTextColor="#334155"
                                        value={form.price}
                                        onChangeText={(v) => update('price', v)}
                                        keyboardType="numeric"
                                        onFocus={() => setFocusField('pr')}
                                        onBlur={() => setFocusField(null)}
                                    />
                                </View>
                                {formErrors.price && <Text style={styles.fError}>⚠ {formErrors.price}</Text>}
                            </View>

                            {/* Accidents History */}
                            <View style={styles.fGroup}>
                                <Text style={styles.fLabel}>Accidents History (Optional)</Text>
                                <View style={[styles.fInput, styles.fInputMulti, focusField === 'ah' && styles.fInputFocus]}>
                                    <AlertTriangle color={focusField === 'ah' ? '#60a5fa' : '#475569'} size={18} style={{ marginTop: 4 }} />
                                    <TextInput
                                        style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 4 }]}
                                        placeholder="e.g. No accidents / 1 minor accident in 2022"
                                        placeholderTextColor="#334155"
                                        value={form.accidents_history}
                                        onChangeText={(v) => update('accidents_history', v)}
                                        multiline
                                        numberOfLines={3}
                                        onFocus={() => setFocusField('ah')}
                                        onBlur={() => setFocusField(null)}
                                    />
                                </View>
                            </View>

                            {/* ── MEDIA & DOCUMENTS DIVIDER ── */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>📎 Media & Documents</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* ── VEHICLE PHOTO ── */}
                            <View style={styles.fGroup}>
                                <Text style={styles.fLabel}>Vehicle Photo (Optional)</Text>

                                {/* File Upload Button */}
                                <TouchableOpacity style={styles.filePickBtn} onPress={pickPhotoFile}>
                                    <Upload color="#60a5fa" size={18} />
                                    <Text style={styles.filePickBtnText}>
                                        {photoFile ? `📷 ${photoFile.name}` : '📂 Browse Image File'}
                                    </Text>
                                    {photoFile && <Text style={styles.fileSizeText}>{formatSize(photoFile.size)}</Text>}
                                </TouchableOpacity>

                                {/* OR divider */}
                                <View style={styles.orRow}>
                                    <View style={styles.orLine} />
                                    <Text style={styles.orText}>OR paste URL</Text>
                                    <View style={styles.orLine} />
                                </View>

                                {/* Photo URL Input */}
                                <View style={[styles.fInput, focusField === 'pu' && styles.fInputFocus, { opacity: photoFile ? 0.4 : 1 }]}>
                                    <ImageIcon color={focusField === 'pu' ? '#60a5fa' : '#475569'} size={18} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="https://example.com/photo.jpg"
                                        placeholderTextColor="#334155"
                                        value={form.photo_url}
                                        onChangeText={(v) => { update('photo_url', v); if (v) setPhotoFile(null); }}
                                        keyboardType="url"
                                        autoCapitalize="none"
                                        editable={!photoFile}
                                        onFocus={() => setFocusField('pu')}
                                        onBlur={() => setFocusField(null)}
                                    />
                                    {photoFile && (
                                        <TouchableOpacity onPress={() => setPhotoFile(null)}>
                                            <XCircle color="#ef4444" size={16} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Photo preview */}
                                {(photoFile?.preview || (form.photo_url.length > 5)) && (
                                    <View style={styles.previewBox}>
                                        <Image
                                            source={{ uri: photoFile?.preview || form.photo_url }}
                                            style={styles.photoPreview}
                                            resizeMode="cover"
                                        />
                                        <Text style={styles.previewLabel}>
                                            📷 {photoFile ? `File: ${photoFile.name}` : 'URL Preview'}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* ── OWNERSHIP DOCUMENTS ── */}
                            <View style={styles.fGroup}>
                                <Text style={styles.fLabel}>Ownership Documents (Optional)</Text>

                                {/* File Upload Button */}
                                <TouchableOpacity style={[styles.filePickBtn, styles.filePickBtnDoc]} onPress={pickDocFile}>
                                    <Upload color="#f59e0b" size={18} />
                                    <Text style={[styles.filePickBtnText, { color: '#f59e0b' }]}>
                                        {docFile ? `📄 ${docFile.name}` : '📂 Browse PDF / DOC File'}
                                    </Text>
                                    {docFile && <Text style={[styles.fileSizeText, { color: '#78350f' }]}>{formatSize(docFile.size)}</Text>}
                                </TouchableOpacity>
                                <Text style={styles.fHint}>Accepted: PDF, DOC, DOCX, TXT</Text>

                                {/* OR divider */}
                                <View style={styles.orRow}>
                                    <View style={styles.orLine} />
                                    <Text style={styles.orText}>OR paste link</Text>
                                    <View style={styles.orLine} />
                                </View>

                                {/* Document URL Input */}
                                <View style={[styles.fInput, focusField === 'du' && styles.fInputFocus, { opacity: docFile ? 0.4 : 1 }]}>
                                    <FileText color={focusField === 'du' ? '#60a5fa' : '#475569'} size={18} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="https://drive.google.com/... or PDF link"
                                        placeholderTextColor="#334155"
                                        value={form.documents_url}
                                        onChangeText={(v) => { update('documents_url', v); if (v) setDocFile(null); }}
                                        keyboardType="url"
                                        autoCapitalize="none"
                                        editable={!docFile}
                                        onFocus={() => setFocusField('du')}
                                        onBlur={() => setFocusField(null)}
                                    />
                                    {docFile && (
                                        <TouchableOpacity onPress={() => setDocFile(null)}>
                                            <XCircle color="#ef4444" size={16} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Document preview card - uploaded file */}
                                {docFile && (
                                    <View style={styles.docPreviewBox}>
                                        <FileText color="#f59e0b" size={24} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.docPreviewTitle}>✅ File Selected</Text>
                                            <Text style={styles.docPreviewUrl} numberOfLines={1}>{docFile.name}</Text>
                                            <Text style={styles.docPreviewSize}>{formatSize(docFile.size)}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setDocFile(null)}>
                                            <XCircle color="#ef4444" size={18} />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Document preview card - URL link */}
                                {!docFile && form.documents_url.length > 5 && (
                                    <TouchableOpacity
                                        style={styles.docPreviewBox}
                                        onPress={() => Linking.openURL(form.documents_url).catch(() => { })}
                                    >
                                        <FileText color="#f59e0b" size={24} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.docPreviewTitle}>🔗 Document Linked</Text>
                                            <Text style={styles.docPreviewUrl} numberOfLines={1}>{form.documents_url}</Text>
                                        </View>
                                        <ExternalLink color="#f59e0b" size={18} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                                onPress={handleAddVehicle}
                                disabled={submitting}
                            >
                                <LinearGradient
                                    colors={['#10b981', '#059669']}
                                    style={styles.submitBtnGrad}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {submitting
                                        ? <ActivityIndicator color="#fff" />
                                        : (<><PlusCircle color="#fff" size={20} /><Text style={styles.submitBtnText}>Add Vehicle to Blockchain</Text></>)
                                    }
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.historyLink} onPress={() => setActiveTab('history')}>
                                <Text style={styles.historyLinkText}>📋 View Vehicle History →</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* ── HISTORY TAB ───────────────────────────────────────────────────── */}
                {activeTab === 'history' && (
                    <View style={styles.historySection}>
                        <View style={styles.historyHeader}>
                            <View style={styles.historyHeaderLeft}>
                                <History color="#60a5fa" size={20} />
                                <Text style={styles.historyTitle}>Your Vehicles</Text>
                            </View>
                            <TouchableOpacity style={styles.refreshBtn} onPress={fetchHistory}>
                                <RefreshCcw color="#94a3b8" size={16} />
                                <Text style={styles.refreshBtnText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            <View style={{ minWidth: (Platform.OS === 'web') ? '100%' : 600 }}>
                                <View style={styles.colRow}>
                                    {['#', 'Vehicle No.', 'Price (₹)', 'Accidents', 'Status', 'Block Hash'].map((c, i) => (
                                        <Text key={i} style={[styles.colHead, i === 0 && { width: 40 }, i === 5 && { flex: 2 }]}>{c}</Text>
                                    ))}
                                </View>

                                {loading ? (
                                    <View style={styles.centerMsg}>
                                        <ActivityIndicator color="#60a5fa" size="large" />
                                        <Text style={styles.centerMsgText}>Loading...</Text>
                                    </View>
                                ) : vehicles.length === 0 ? (
                                    <View style={styles.centerMsg}>
                                        <Car color="#334155" size={48} />
                                        <Text style={styles.centerMsgText}>No vehicles added yet</Text>
                                        <TouchableOpacity onPress={() => setActiveTab('add')}>
                                            <Text style={styles.addFirstText}>➕ Add your first vehicle</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    vehicles.map((v, idx) => (
                                        <View key={v.id} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                                            <Text style={[styles.cell, { width: 40, color: '#64748b' }]}>{idx + 1}</Text>
                                            <Text style={[styles.cell, { color: '#60a5fa', fontWeight: '700' }]}>{v.vehicle_number}</Text>
                                            <Text style={[styles.cell, { color: '#10b981' }]}>₹{Number(v.price).toLocaleString('en-IN')}</Text>
                                            <Text style={[styles.cell, { color: '#94a3b8', fontSize: 12 }]}>{v.accidents_history}</Text>
                                            <View style={styles.cell}>
                                                <View style={[styles.statusBadge, v.status === 'available' ? styles.statusAvail : v.status === 'pending' ? styles.statusWait : styles.statusSold]}>
                                                    <Text style={[styles.statusText, { color: v.status === 'available' ? '#10b981' : v.status === 'pending' ? '#eab308' : '#f59e0b' }]}>
                                                        {v.status === 'available' ? '✓ Available' : v.status === 'pending' ? '⏳ Pending' : '● Sold'}
                                                    </Text>
                                                </View>
                                                {v.status === 'pending' && (
                                                    <TouchableOpacity
                                                        style={{ marginTop: 5, backgroundColor: 'rgba(96,165,250,0.1)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' }}
                                                        onPress={() => openTxnModal(v.block_hash)}
                                                    >
                                                        <Text style={{ color: '#60a5fa', fontSize: 10, fontWeight: 'bold' }}>+ Add TXN ID</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                            <Text style={[styles.cell, { flex: 2, color: '#334155', fontSize: 10 }]} numberOfLines={1}>
                                                {v.block_hash}
                                            </Text>
                                        </View>
                                    ))
                                )}
                            </View>
                        </ScrollView>

                        <View style={styles.tableFooter}>
                            <Text style={styles.footerText}>Total: {vehicles.length} vehicles</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Transaction ID Modal */}
            {
                txnModalVisible && (
                    <View style={styles.modalBg}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>Provide Transaction ID</Text>
                            <Text style={styles.modalSub}>Enter the Transaction ID received in your Bank Account for this purchase.</Text>

                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. TXN123456789"
                                placeholderTextColor="#64748b"
                                value={sellerTxnIdInput}
                                onChangeText={setSellerTxnIdInput}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setTxnModalVisible(false)}>
                                    <Text style={styles.modalBtnCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalBtnConfirm} onPress={submitSellerTxnId}>
                                    <Text style={styles.modalBtnConfirmText}>Submit ID</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )
            }
        </View>
    );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#060714' },

    // Toast
    toast: {
        position: 'absolute', top: 70, alignSelf: 'center',
        width: (Platform.OS === 'web') ? 500 : '92%',
        flexDirection: 'row', alignItems: 'center', gap: 10,
        paddingHorizontal: 18, paddingVertical: 13,
        borderRadius: 14, zIndex: 999, borderWidth: 1,
    },
    toastSuccess: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' },
    toastError: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)' },
    toastText: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },

    // Navbar
    navbar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 40 : 16, paddingVertical: 14,
        backgroundColor: 'rgba(6,7,20,0.95)',
        borderBottomWidth: 1, borderBottomColor: 'rgba(96,165,250,0.2)',
    },
    navLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    navTitle: { color: '#fff', fontSize: (Platform.OS === 'web') ? 20 : 15, fontWeight: 'bold', marginLeft: 4 },
    sellerBadge: {
        backgroundColor: 'rgba(96,165,250,0.15)', borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.4)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    },
    sellerBadgeText: { color: '#60a5fa', fontSize: 11, fontWeight: '700' },
    navRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    navName: { color: '#94a3b8', fontSize: (Platform.OS === 'web') ? 14 : 12 },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.3)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    },
    logoutBtnText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },

    // Tabs
    // Tab Bar
    tabBarScroll: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    tabBar: {
        flexDirection: 'row', paddingHorizontal: (Platform.OS === 'web') ? 40 : 16, paddingVertical: 14, gap: 12,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    tabBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: (Platform.OS === 'web') ? 20 : 14, paddingVertical: 10, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    tabBtnActiveGreen: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' },
    tabBtnActiveBlue: { backgroundColor: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.4)' },
    tabIcon: { fontSize: 16 },
    tabBtnText: { color: '#64748b', fontWeight: '600', fontSize: (Platform.OS === 'web') ? 14 : 13 },

    scrollContent: {
        flexGrow: 1, paddingHorizontal: (Platform.OS === 'web') ? 40 : 16,
        paddingVertical: 28, paddingBottom: 60,
    },

    // Add form layout
    centerCard: {
        flexDirection: (Platform.OS === 'web') ? 'row' : 'column',
        gap: (Platform.OS === 'web') ? 50 : 0, alignItems: (Platform.OS === 'web') ? 'flex-start' : 'stretch',
    },
    infoPanel: { flex: 1, maxWidth: 360, paddingTop: 10 },
    infoBadge: {
        backgroundColor: 'rgba(96,165,250,0.1)', borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.3)', paddingHorizontal: 12,
        paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 24,
    },
    infoBadgeText: { color: '#60a5fa', fontSize: 13, fontWeight: '600' },
    infoTitle: { fontSize: 38, fontWeight: 'bold', color: '#fff', lineHeight: 48, marginBottom: 14 },
    infoSub: { fontSize: 15, color: '#64748b', lineHeight: 24, marginBottom: 28 },
    infoSteps: { gap: 18 },
    infoStep: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    infoStepIcon: { fontSize: 26, width: 44, textAlign: 'center' },
    infoStepTitle: { color: '#e2e8f0', fontWeight: '700', fontSize: 14 },
    infoStepDesc: { color: '#64748b', fontSize: 12, marginTop: 2 },

    // Form card
    formCard: {
        flex: 1, maxWidth: (Platform.OS === 'web') ? 560 : '100%', borderRadius: 24, borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.15)', padding: (Platform.OS === 'web') ? 40 : 24,
        overflow: 'hidden', backgroundColor: 'rgba(10,15,35,0.85)',
    },
    formTitle: { fontSize: (Platform.OS === 'web') ? 26 : 22, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
    formSub: { fontSize: 13, color: '#475569', marginBottom: 26 },

    // Form fields
    fGroup: { marginBottom: 18 },
    fLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginBottom: 8 },
    fInput: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 14, height: (Platform.OS === 'web') ? 50 : 48,
    },
    fInputMulti: { height: 'auto', paddingVertical: 12, alignItems: 'flex-start' },
    fInputFocus: { borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.06)' },
    fInputError: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.05)' },
    input: { flex: 1, color: '#fff', fontSize: (Platform.OS === 'web') ? 15 : 14, height: '100%', outlineStyle: 'none' },
    fError: { color: '#f87171', fontSize: 12, marginTop: 5 },
    fHint: { color: '#334155', fontSize: 12, marginTop: 5 },

    // Divider
    divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
    dividerText: { color: '#475569', fontSize: 13, fontWeight: '600' },

    // File pick button
    filePickBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: 'rgba(96,165,250,0.08)', borderWidth: 1,
        borderColor: 'rgba(96,165,250,0.3)', borderStyle: 'dashed',
        borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
        marginBottom: 10,
    },
    filePickBtnDoc: {
        backgroundColor: 'rgba(245,158,11,0.07)',
        borderColor: 'rgba(245,158,11,0.35)',
    },
    filePickBtnText: { color: '#60a5fa', fontWeight: '600', fontSize: 14, flex: 1 },
    fileSizeText: { color: '#475569', fontSize: 12 },

    // OR row
    orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
    orText: { color: '#334155', fontSize: 12, fontWeight: '600' },

    // Photo preview
    previewBox: {
        marginTop: 10, borderRadius: 14, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(96,165,250,0.2)',
    },
    photoPreview: {
        width: '100%', height: (Platform.OS === 'web') ? 200 : 160,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    previewLabel: {
        color: '#475569', fontSize: 12, fontWeight: '600',
        paddingVertical: 8, paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },

    // Document preview
    docPreviewBox: {
        marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: 'rgba(245,158,11,0.07)', borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.25)', borderRadius: 12, padding: 14,
    },
    docPreviewTitle: { color: '#f59e0b', fontWeight: '700', fontSize: 14 },
    docPreviewUrl: { color: '#64748b', fontSize: 11, marginTop: 2 },
    docPreviewSize: { color: '#78350f', fontSize: 11, marginTop: 2 },

    // Submit
    submitBtn: { height: (Platform.OS === 'web') ? 52 : 48, borderRadius: 14, overflow: 'hidden', marginTop: 10, marginBottom: 16 },
    submitBtnGrad: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: (Platform.OS === 'web') ? 17 : 15 },

    historyLink: { alignItems: 'center' },
    historyLinkText: { color: '#60a5fa', fontSize: 14, fontWeight: '600' },

    // History table
    historySection: {
        backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
    },
    historyHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 24 : 16, paddingVertical: 18,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    historyHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    historyTitle: { color: '#fff', fontSize: (Platform.OS === 'web') ? 18 : 15, fontWeight: 'bold' },
    refreshBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    },
    refreshBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
    colRow: {
        flexDirection: 'row', paddingHorizontal: (Platform.OS === 'web') ? 24 : 12, paddingVertical: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    colHead: { flex: 1, color: '#475569', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    tableRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 24 : 12, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.01)' },
    cell: { flex: 1, color: '#cbd5e1', fontSize: (Platform.OS === 'web') ? 14 : 12, paddingRight: 8 },
    statusBadge: {
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
        borderWidth: 1, alignSelf: 'flex-start',
    },
    statusAvail: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' },
    statusWait: { backgroundColor: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.3)' },
    statusSold: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' },
    statusText: { fontSize: 11, fontWeight: '700' },
    centerMsg: { alignItems: 'center', paddingVertical: 60, gap: 12 },
    centerMsgText: { color: '#475569', fontSize: 15 },
    addFirstText: { color: '#60a5fa', fontWeight: '600', fontSize: 15 },
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
    modalInput: {
        backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: '#475569',
        borderRadius: 10, color: '#fff', padding: 12, marginBottom: 20,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    modalBtnCancel: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
    modalBtnCancelText: { color: '#94a3b8', fontWeight: 'bold' },
    modalBtnConfirm: { backgroundColor: '#3b82f6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
    modalBtnConfirmText: { color: '#fff', fontWeight: 'bold' },
});

export default SellerDashboard;
