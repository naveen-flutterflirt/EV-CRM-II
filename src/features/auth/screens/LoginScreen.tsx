import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { LoginForm } from '../components/LoginForm';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
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
        <LoginForm
          onLoginSuccess={onLoginSuccess}
          onNavigateToRegister={onNavigateToRegister}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
  },
});
