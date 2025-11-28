import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Dashboard from './src/screens/dashboard';

export default function App() {
  return (
    <View style={styles.container}>
      <Dashboard />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
