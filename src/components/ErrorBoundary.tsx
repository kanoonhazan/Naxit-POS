import React, {Component, ErrorInfo, ReactNode} from 'react';
import {StyleSheet, Text, View, Pressable} from 'react-native';
import {theme} from '../theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
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
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            The app encountered an unexpected error. Please restart the app or
            reset this screen.
          </Text>
          
          <Pressable onPress={this.handleReset} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.ink,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.colors.muted,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.md,
    minHeight: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.panel,
  },
});
