import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, TextStyle, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
interface CustomTextInputProps extends TextInputProps {
  leftIcon?: string; 
  rightIcon?: string; 
  onPressRightIcon?: () => void; 
  placeholder?: string; 
  placeholderColor?: string; 
  width?: string | number; 
  height?: string | number; 
  style?: TextStyle; 
  containerStyle?: ViewStyle; 
}
const CustomTextInput: React.FC<CustomTextInputProps> = ({
  leftIcon,
  rightIcon,
  onPressRightIcon,
  placeholder,
  placeholderColor = '#999',
  width = '100%',
  height = 50,
  style,
  containerStyle,
  ...rest
}) => {
  return (
    <View style={[styles.container, { width, height }, containerStyle]}>
      {leftIcon && (
        <Ionicons name={leftIcon} size={24} color="#333" style={styles.icon} />
      )}
      <TextInput
        style={[styles.textInput, style]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        {...rest}
      />
      {rightIcon && (
        <TouchableOpacity onPress={onPressRightIcon} style={styles.iconButton}>
          <Ionicon name={rightIcon} size={24} color="#333" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
});

export default CustomTextInput;
