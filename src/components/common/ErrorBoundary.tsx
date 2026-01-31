// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });

    // 可選：上報錯誤到監控服務
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo): void => {
    // TODO: 整合錯誤監控服務（如 Sentry）
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    // 本地記錄（開發環境）
    if (import.meta.env?.DEV) {
      console.log('[Error Report]', errorReport);
    }
  };

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container">
          <div className="error-content">
            <h1 className="error-title">出了點問題</h1>
            <p className="error-message">
              抱歉，發生了預期外的錯誤。請嘗試以下操作：
            </p>

            {import.meta.env?.DEV && this.state.error && (
              <details className="error-details">
                <summary>錯誤詳情（開發模式）</summary>
                <pre className="error-stack">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <Button onClick={this.handleRetry} variant="primary">
                重試
              </Button>
              <Button onClick={this.handleReload} variant="secondary">
                重新載入頁面
              </Button>
            </div>
          </div>

          <style>{`
            .error-boundary-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
              background: #f5f5f5;
            }
            .error-content {
              max-width: 500px;
              padding: 40px;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              text-align: center;
            }
            .error-title {
              font-size: 24px;
              color: #e53935;
              margin-bottom: 16px;
            }
            .error-message {
              color: #666;
              margin-bottom: 24px;
            }
            .error-details {
              text-align: left;
              margin: 16px 0;
              padding: 12px;
              background: #f5f5f5;
              border-radius: 8px;
              font-size: 12px;
            }
            .error-stack {
              white-space: pre-wrap;
              word-break: break-all;
              color: #666;
            }
            .error-actions {
              display: flex;
              gap: 12px;
              justify-content: center;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
