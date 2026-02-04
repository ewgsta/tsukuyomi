import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Home, Search, Library } from 'lucide-react-native';
import { MobileGlass } from './MobileGlass';
import { COLORS } from './MobileTheme';

export const MobileBottomBar = ({ activeTab, onTabPress }) => {
    return (
        <View style={styles.wrapper}>
            <MobileGlass style={styles.container} intensity={50}>
                <View style={styles.innerContainer}>
                    <TouchableOpacity style={styles.tab} onPress={() => onTabPress('home')}>
                        <Home
                            size={24}
                            color={activeTab === 'home' ? COLORS.primary : COLORS.textSecondary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tab} onPress={() => onTabPress('search')}>
                        <Search
                            size={24}
                            color={activeTab === 'search' ? COLORS.primary : COLORS.textSecondary}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tab} onPress={() => onTabPress('library')}>
                        <Library
                            size={24}
                            color={activeTab === 'library' ? COLORS.primary : COLORS.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
            </MobileGlass>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    container: {
        borderRadius: 30,
        backgroundColor: 'rgba(10,10,10, 0.8)',
        height: 60,
    },
    innerContainer: {
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
    }
});
