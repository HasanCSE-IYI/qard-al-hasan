import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from './src/theme/colors';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { LoansScreen } from './src/screens/LoansScreen';
import { NewLoanScreen } from './src/screens/NewLoanScreen';
import { LoanDetailScreen } from './src/screens/LoanDetailScreen';
import { WasiyyahScreen } from './src/screens/WasiyyahScreen';
import { Loan } from '@qard/shared';

type Screen = 'dashboard' | 'loans' | 'newLoan' | 'loanDetail' | 'wasiyyah';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const handleSelectLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setCurrentScreen('loanDetail');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigateToNewLoan={() => setCurrentScreen('newLoan')}
            onNavigateToLoans={() => setCurrentScreen('loans')}
            onNavigateToWasiyyah={() => setCurrentScreen('wasiyyah')}
            onSelectLoan={handleSelectLoan}
          />
        );
      case 'loans':
        return (
          <LoansScreen
            onBack={() => setCurrentScreen('dashboard')}
            onSelectLoan={handleSelectLoan}
            onNavigateToNewLoan={() => setCurrentScreen('newLoan')}
          />
        );
      case 'newLoan':
        return (
          <NewLoanScreen
            onBack={() => setCurrentScreen('dashboard')}
            onSuccess={(loan) => {
              setSelectedLoan(loan);
              setCurrentScreen('loanDetail');
            }}
          />
        );
      case 'loanDetail':
        return selectedLoan ? (
          <LoanDetailScreen loan={selectedLoan} onBack={() => setCurrentScreen('dashboard')} />
        ) : (
          <DashboardScreen
            onNavigateToNewLoan={() => setCurrentScreen('newLoan')}
            onNavigateToLoans={() => setCurrentScreen('loans')}
            onNavigateToWasiyyah={() => setCurrentScreen('wasiyyah')}
            onSelectLoan={handleSelectLoan}
          />
        );
      case 'wasiyyah':
        return <WasiyyahScreen onBack={() => setCurrentScreen('dashboard')} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <Text style={[styles.navIcon, currentScreen === 'dashboard' && styles.navIconActive]}>
            🏠
          </Text>
          <Text style={[styles.navLabel, currentScreen === 'dashboard' && styles.navLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('loans')}
        >
          <Text style={[styles.navIcon, currentScreen === 'loans' && styles.navIconActive]}>
            📋
          </Text>
          <Text style={[styles.navLabel, currentScreen === 'loans' && styles.navLabelActive]}>
            Loans
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fabItem}
          onPress={() => setCurrentScreen('newLoan')}
        >
          <View style={styles.fabCircle}>
            <Text style={styles.fabText}>+</Text>
          </View>
          <Text style={styles.navLabel}>New Loan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentScreen('wasiyyah')}
        >
          <Text style={[styles.navIcon, currentScreen === 'wasiyyah' && styles.navIconActive]}>
            📜
          </Text>
          <Text style={[styles.navLabel, currentScreen === 'wasiyyah' && styles.navLabelActive]}>
            Wasiyyah
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064E3B',
  },
  content: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.slate.subtle,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navIconActive: {
    transform: [{ scale: 1.1 }],
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate.muted,
  },
  navLabelActive: {
    color: Colors.primary.dark,
    fontWeight: '700',
  },
  fabItem: {
    alignItems: 'center',
    flex: 1,
    marginTop: -16,
  },
  fabCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 2,
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginTop: -2,
  },
});
