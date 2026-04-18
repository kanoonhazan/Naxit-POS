import React, {Component, ErrorInfo, ReactNode} from 'react';
import {StyleSheet, Text, View, Pressable} from 'react-native';
import {useAppTheme} from '../theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Fallback UI component that uses the theme hook.
 * We separate this because hooks cannot be used in class components.
 */
function ErrorFallback({onReset}: {onReset: () => void}) {
  const {colors, spacing, radius} = useAppTheme();

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.title, {color: colors.ink}]}>Something went wrong</Text>
      <Text style={[styles.body, {color: colors.muted}]}>
        The app encountered an unexpected error. Please restart the app or
        reset this screen.
      </Text>
      
      <Pressable 
        onPress={onReset} 
        style={[styles.button, {backgroundColor: colors.primary, borderRadius: radius.md}]}
      >
        <Text style={[styles.buttonText, {color: colors.panel}]}>Try again</Text>
      </Pressable>
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({hasError: false, error: null});
  };

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  button: {
    marginTop: 14,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
