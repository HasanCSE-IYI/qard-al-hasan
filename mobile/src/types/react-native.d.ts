declare module 'react-native' {
  export interface ViewProps {
    style?: any;
    children?: any;
  }
  export const View: (props: ViewProps) => any;

  export interface TextProps {
    style?: any;
    children?: any;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  }
  export const Text: (props: TextProps) => any;

  export interface TouchableOpacityProps {
    style?: any;
    children?: any;
    onPress?: () => void;
    activeOpacity?: number;
  }
  export const TouchableOpacity: (props: TouchableOpacityProps) => any;

  export interface ScrollViewProps {
    style?: any;
    contentContainerStyle?: any;
    children?: any;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
  }
  export const ScrollView: (props: ScrollViewProps) => any;

  export interface TextInputProps {
    style?: any;
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
    multiline?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  }
  export const TextInput: (props: TextInputProps) => any;

  export interface ModalProps {
    visible?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
    transparent?: boolean;
    onRequestClose?: () => void;
    children?: any;
  }
  export const Modal: (props: ModalProps) => any;

  export interface SafeAreaViewProps {
    style?: any;
    children?: any;
  }
  export const SafeAreaView: (props: SafeAreaViewProps) => any;

  export interface StatusBarProps {
    barStyle?: 'default' | 'light-content' | 'dark-content';
    backgroundColor?: string;
  }
  export const StatusBar: (props: StatusBarProps) => any;

  export const StyleSheet: {
    create<T extends Record<string, any>>(styles: T): T;
  };

  export interface AlertButton {
    text?: string;
    onPress?: (value?: string) => void;
    style?: 'default' | 'cancel' | 'destructive';
  }

  export const Alert: {
    alert(title: string, message?: string, buttons?: AlertButton[]): void;
    prompt?(title: string, message?: string, callbackOrButtons?: ((text?: string) => void) | AlertButton[], type?: string, defaultValue?: string): void;
  };

  export const Linking: {
    canOpenURL(url: string): Promise<boolean>;
    openURL(url: string): Promise<any>;
  };
}
