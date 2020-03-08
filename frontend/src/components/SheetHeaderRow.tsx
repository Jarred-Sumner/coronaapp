import * as React from 'react';
import {View, StyleSheet, Text, TouchableWithoutFeedback} from 'react-native';
import {RectButton, BorderlessButton} from 'react-native-gesture-handler';
import {sendSelectionFeedback} from '../lib/Vibration';

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },

  headerText: {
    fontSize: 17,
    fontWeight: '600',
    textTransform: 'uppercase',
    textAlign: 'center',
    color: 'white',
  },
  activeRow: {
    borderRightColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
  },

  rowWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const SheetHeaderRow = ({
  isActive = true,
  children,
  onPress,
  value,
  size,
  Icon,
  light,
  isLast,
  iconOnly,
  inset,
}) => {
  const handlePress = React.useCallback(() => {
    sendSelectionFeedback();
    onPress && onPress(value);
  }, [onPress, value]);

  const ButtonComponent = TouchableWithoutFeedback;

  return (
    <View style={[size, !isLast && styles.separator]}>
      <ButtonComponent
        onPress={handlePress}
        enabled={!isActive}
        style={[styles.row, light && styles.lightRow, size]}>
        <View style={[size, {opacity: isActive ? 1 : 0.65}, styles.rowWrapper]}>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={[styles.headerText, size]}>
            {children}
          </Text>
        </View>
      </ButtonComponent>
    </View>
  );
};
