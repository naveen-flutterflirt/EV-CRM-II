import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
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
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Image 
          source={require('../../../../assets/images/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
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
    backgroundColor: '#f8fafc',
  },
  container: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 12,
  },
});
