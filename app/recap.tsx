import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing } from '../src/constants/theme';

export default function RecapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Recap annuel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  text: {
    fontSize: fontSize.lg,
    color: colors.text,
  },
});
