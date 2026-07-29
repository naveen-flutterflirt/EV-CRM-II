import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { RegisterForm } from '../components/RegisterForm';

interface RegisterScreenProps {
  onRegisterSuccess: (user: any) => void;
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <RegisterForm
          onRegisterSuccess={onRegisterSuccess}
          onNavigateToLogin={onNavigateToLogin}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
