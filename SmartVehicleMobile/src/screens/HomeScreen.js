import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Platform, Dimensions, ImageBackground, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Car, Shield, Cpu, Activity, ChevronRight } from 'lucide-react-native';
import AnimatedBackground from '../components/AnimatedBackground';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={[styles.root, { width: (Platform.OS === 'web') ? '100%' : width * 1.1 }]}>
                <AnimatedBackground
                    colors={['#060714', '#0d1117', '#111827']}
                    particleColor="#22d3ee"
                />

                {/* NAVBAR */}
                <View style={styles.navbar}>
                    <View style={styles.navBrand}>
                        <Car color="#22d3ee" size={(Platform.OS === 'web') ? 26 : 20} />
                        <Text style={styles.brandText} numberOfLines={1}>Vehicle Chain</Text>
                    </View>
                    <View style={styles.navLinks}>
                        <TouchableOpacity style={[styles.navBtn, styles.navBtnActive]} onPress={() => navigation.navigate('Home')}>
                            <Text style={styles.navBtnActiveText}>Home</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.navBtn, styles.navBtnGreen]} onPress={() => navigation.navigate('Login', { role: 'buyer' })}>
                            <Text style={styles.navBtnText}>Buyer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.navBtn, styles.navBtnBlue]} onPress={() => navigation.navigate('Login', { role: 'seller' })}>
                            <Text style={styles.navBtnText}>Seller</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.navBtn, styles.navBtnOrange]} onPress={() => navigation.navigate('Login', { role: 'admin' })}>
                            <Text style={styles.navBtnText}>Admin</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* HERO SECTION */}
                    <View style={styles.hero}>
                        <Image
                            source={require('../../assets/vehicle_hero_bg.png')}
                            style={styles.heroImgBg}
                            resizeMode="cover"
                            blurRadius={2}
                        />
                        <View style={styles.heroOverlay} />

                        <View style={styles.vehicleShowcaseBox}>
                            <Image
                                source={require('../../assets/vehicle_hero_bg.png')}
                                style={styles.vehicleShowcaseImg}
                                resizeMode="contain"
                            />
                            <View style={styles.vehicleGlow} />
                        </View>

                        <View style={styles.heroBadge}>
                            <Text style={styles.heroBadgeText}>🔗 Blockchain Driven</Text>
                        </View>
                        <Text style={styles.heroTitle}>Smart Vehicle{'\n'}Procurement</Text>
                        <Text style={styles.heroSubtitle}>
                            Transforming Vehicle Transactions with{'\n'}Secure Blockchain Smart Contracts
                        </Text>

                        <View style={styles.heroBtns}>
                            <TouchableOpacity
                                style={styles.heroBtnPrimary}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <LinearGradient
                                    colors={['#06b6d4', '#2563eb']}
                                    style={styles.heroBtnGrad}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.heroBtnPrimaryText}>Get Started</Text>
                                    <ChevronRight color="#fff" size={18} />
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.heroBtnSecondary}
                                onPress={() => navigation.navigate('Login', { role: 'buyer' })}
                            >
                                <Text style={styles.heroBtnSecondaryText}>Sign In →</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            {[
                                { val: '500+', label: 'Vehicles Listed' },
                                { val: '1200+', label: 'Transactions' },
                                { val: '99.9%', label: 'Uptime' },
                            ].map((s, i) => (
                                <View key={i} style={styles.statItem}>
                                    <Text style={styles.statValue}>{s.val}</Text>
                                    <Text style={styles.statLabel}>{s.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* FEATURES SECTION */}
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionBadge}>WHY CHOOSE US</Text>
                        <Text style={styles.sectionTitle}>Why Our System Stands Out</Text>
                        <Text style={styles.sectionSubtitle}>
                            Built on cutting-edge blockchain technology for maximum security and transparency
                        </Text>

                        <View style={styles.featuresGrid}>
                            {[
                                {
                                    icon: <Cpu color="#22d3ee" size={(Platform.OS === 'web') ? 40 : 32} />,
                                    title: 'Transparent Transactions',
                                    desc: 'Leverage blockchain for secure, traceable, and tamper-proof vehicle transactions.',
                                    color: '#22d3ee',
                                    bg: 'rgba(34,211,238,0.08)',
                                    border: 'rgba(34,211,238,0.3)',
                                },
                                {
                                    icon: <Shield color="#4ade80" size={(Platform.OS === 'web') ? 40 : 32} />,
                                    title: 'Smart Contracts',
                                    desc: 'Streamline procurement with automated, error-free smart contracts.',
                                    color: '#4ade80',
                                    bg: 'rgba(74,222,128,0.08)',
                                    border: 'rgba(74,222,128,0.3)',
                                },
                                {
                                    icon: <Activity color="#a78bfa" size={(Platform.OS === 'web') ? 40 : 32} />,
                                    title: 'Decentralized Security',
                                    desc: 'Safeguard sensitive data with decentralized blockchain storage.',
                                    color: '#a78bfa',
                                    bg: 'rgba(167,139,250,0.08)',
                                    border: 'rgba(167,139,250,0.3)',
                                },
                            ].map((f, i) => (
                                <View key={i} style={[styles.featureCard, { backgroundColor: f.bg, borderColor: f.border }]}>
                                    <View style={[styles.featureIconBox, { backgroundColor: f.bg }]}>
                                        {f.icon}
                                    </View>
                                    <Text style={[styles.featureTitle, { color: f.color }]}>{f.title}</Text>
                                    <Text style={styles.featureDesc}>{f.desc}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* CTA SECTION */}
                    <View style={styles.ctaSection}>
                        <LinearGradient
                            colors={['rgba(6,182,212,0.15)', 'rgba(37,99,235,0.15)']}
                            style={styles.ctaBox}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.ctaTitle}>Ready to Get Started?</Text>
                            <Text style={styles.ctaSubtitle}>
                                Join hundreds of buyers and sellers on our blockchain platform
                            </Text>
                            <TouchableOpacity
                                style={styles.ctaBtn}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <LinearGradient
                                    colors={['#06b6d4', '#2563eb']}
                                    style={styles.ctaBtnGrad}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.ctaBtnText}>Create Account →</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <Car color="#22d3ee" size={20} />
                        <Text style={styles.footerText}>
                            © 2024 Smart Vehicle Procurement System. All rights reserved.
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#060714',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 70,
    },

    // NAVBAR
    navbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 60 : 20,
        paddingVertical: 14,
        backgroundColor: 'rgba(6,7,20,0.85)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(34,211,238,0.1)',
    },
    navBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    brandText: {
        color: '#fff',
        fontSize: (Platform.OS === 'web') ? 18 : 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    navLinks: {
        flexDirection: 'row',
        gap: 8,
    },
    navBtn: {
        paddingHorizontal: (Platform.OS === 'web') ? 16 : 10,
        paddingVertical: 8,
        borderRadius: 20,
    },
    navBtnActive: { backgroundColor: '#7c3aed' },
    navBtnGreen: { backgroundColor: '#059669' },
    navBtnBlue: { backgroundColor: '#2563eb' },
    navBtnOrange: { backgroundColor: '#d97706' },
    navBtnPink: { backgroundColor: '#db2777' },
    navBtnText: { color: '#fff', fontWeight: '600', fontSize: (Platform.OS === 'web') ? 14 : 11 },
    navBtnActiveText: { color: '#fff', fontWeight: '600', fontSize: (Platform.OS === 'web') ? 14 : 11 },

    // HERO
    hero: {
        alignItems: 'center',
        paddingHorizontal: (Platform.OS === 'web') ? 40 : 20,
        paddingTop: (Platform.OS === 'web') ? 100 : 70,
        paddingBottom: (Platform.OS === 'web') ? 100 : 70,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 30, // Curvy edges
        marginHorizontal: (Platform.OS === 'web') ? 40 : 15,
        marginTop: 20,
    },
    heroImgBg: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%',
        height: '100%',
        opacity: 0.35,
    },
    heroOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(6,7,20,0.6)',
    },

    // Vehicle showcase image (clear, glowing)
    vehicleShowcaseBox: {
        width: '100%',
        maxWidth: (Platform.OS === 'web') ? 820 : 360,
        alignItems: 'center',
        marginBottom: (Platform.OS === 'web') ? -20 : -10,
        position: 'relative',
    },
    vehicleShowcaseImg: {
        width: '100%',
        height: (Platform.OS === 'web') ? 340 : 200,
        opacity: 0.92,
    },
    vehicleGlow: {
        position: 'absolute',
        bottom: (Platform.OS === 'web') ? -20 : -10,
        left: '10%',
        right: '10%',
        height: (Platform.OS === 'web') ? 60 : 30,
        backgroundColor: 'rgba(34,211,238,0.18)',
        borderRadius: 100,
        // blur simulation with shadowColor
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 30,
        elevation: 20,
    },

    heroBadge: {
        backgroundColor: 'rgba(34,211,238,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34,211,238,0.3)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 30,
    },
    heroBadgeText: {
        color: '#22d3ee',
        fontSize: (Platform.OS === 'web') ? 14 : 12,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: (Platform.OS === 'web') ? 64 : 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        lineHeight: (Platform.OS === 'web') ? 76 : 36,
        marginBottom: 16,
    },
    heroSubtitle: {
        fontSize: (Platform.OS === 'web') ? 20 : 13,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: (Platform.OS === 'web') ? 30 : 20,
        marginBottom: 40,
        maxWidth: 600,
        paddingHorizontal: 10,
    },
    heroBtns: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 60,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    heroBtnPrimary: {
        height: (Platform.OS === 'web') ? 54 : 46,
        minWidth: (Platform.OS === 'web') ? 180 : 150,
        borderRadius: 28,
        overflow: 'hidden',
    },
    heroBtnGrad: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
        gap: 6,
    },
    heroBtnPrimaryText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: (Platform.OS === 'web') ? 17 : 15,
    },
    heroBtnSecondary: {
        height: (Platform.OS === 'web') ? 54 : 46,
        minWidth: (Platform.OS === 'web') ? 140 : 120,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    heroBtnSecondaryText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: (Platform.OS === 'web') ? 16 : 14,
    },
    statsRow: {
        flexDirection: 'row',
        gap: (Platform.OS === 'web') ? 60 : 30,
    },
    statItem: { alignItems: 'center' },
    statValue: {
        fontSize: (Platform.OS === 'web') ? 36 : 26,
        fontWeight: 'bold',
        color: '#22d3ee',
    },
    statLabel: {
        fontSize: (Platform.OS === 'web') ? 14 : 12,
        color: '#64748b',
        marginTop: 4,
    },

    // FEATURES
    featuresSection: {
        paddingHorizontal: (Platform.OS === 'web') ? 60 : 20,
        paddingVertical: 60,
        alignItems: 'center',
    },
    sectionBadge: {
        color: '#22d3ee',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 3,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: (Platform.OS === 'web') ? 42 : 28,
        fontWeight: 'bold',
        color: '#fbbf24',
        textAlign: 'center',
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: (Platform.OS === 'web') ? 17 : 14,
        color: '#64748b',
        textAlign: 'center',
        maxWidth: 560,
        lineHeight: (Platform.OS === 'web') ? 26 : 22,
        marginBottom: 50,
    },
    featuresGrid: {
        flexDirection: (Platform.OS === 'web') ? 'row' : 'column',
        gap: 24,
        width: '100%',
        maxWidth: 1100,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    featureCard: {
        flex: (Platform.OS === 'web') ? 1 : undefined,
        minWidth: (Platform.OS === 'web') ? 280 : undefined,
        maxWidth: (Platform.OS === 'web') ? 340 : undefined,
        width: (Platform.OS === 'web') ? undefined : '100%',
        borderRadius: 20,
        borderWidth: 1,
        padding: 30,
        alignItems: 'center',
    },
    featureIconBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 18,
    },
    featureTitle: {
        fontSize: (Platform.OS === 'web') ? 20 : 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    featureDesc: {
        fontSize: (Platform.OS === 'web') ? 15 : 13,
        color: '#94a3b8',
        textAlign: 'center',
        lineHeight: 22,
    },

    // CTA
    ctaSection: {
        paddingHorizontal: (Platform.OS === 'web') ? 60 : 20,
        paddingBottom: 60,
    },
    ctaBox: {
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(34,211,238,0.2)',
        padding: (Platform.OS === 'web') ? 60 : 36,
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: (Platform.OS === 'web') ? 40 : 26,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 14,
    },
    ctaSubtitle: {
        fontSize: (Platform.OS === 'web') ? 17 : 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 32,
        maxWidth: 500,
    },
    ctaBtn: {
        height: 54,
        borderRadius: 28,
        overflow: 'hidden',
        minWidth: 200,
    },
    ctaBtnGrad: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 36,
    },
    ctaBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 17,
    },

    // FOOTER
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    footerText: {
        color: '#475569',
        fontSize: 13,
        marginLeft: 8,
    },
});

export default HomeScreen;
