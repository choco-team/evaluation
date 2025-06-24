# SSE 연결 관리 개선 가이드

## 현재 재연결 로직 분석

### 기존 구현
```typescript
function handleSSEError(err: any, info: {
  endpoint: string;
  subject: string;
  examId: string;
  win: BrowserWindow;
}) {
  console.error('[SSE] Connection error:', err);
  info.win.webContents.send('sse-error', err.message ?? 'unknown error');

  if (sseConnection?.readyState === EventSource.CLOSED) {
    console.warn('[SSE] Stream closed. Retrying in 3 seconds...');
    sseConnection = null;
    setTimeout(() => startSSE(info), 3000);
  }
}
```

### 현재 로직의 한계점
- 재연결 횟수 제한 없음 (무한 재시도)
- 고정된 3초 간격 (지수 백오프 없음)
- 네트워크 상태 체크 없음
- 연결 상태 모니터링 부족

## 개선된 SSE 연결 관리

### 1. 견고한 재연결 로직
```typescript
interface SSEConfig {
  endpoint: string;
  subject: string;
  examId: string;
  win: BrowserWindow;
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

class SSEManager {
  private connection: EventSource | null = null;
  private currentEndpoint: string | null = null;
  private retryCount = 0;
  private config: SSEConfig | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  async connect(config: SSEConfig): Promise<void> {
    this.config = config;
    this.retryCount = 0;
    await this.createConnection();
  }

  private async createConnection(): Promise<void> {
    if (!this.config) return;

    // 기존 연결 정리
    this.cleanup();

    const { endpoint, subject, examId, win } = this.config;
    
    // 중복 연결 체크
    if (this.connection && this.currentEndpoint === endpoint) {
      console.log('[SSE] Already connected. Skipping reconnection.');
      return;
    }

    try {
      // 네트워크 연결 체크
      if (!(await this.checkNetworkConnection())) {
        throw new Error('Network connection unavailable');
      }

      console.log(`[SSE] Connecting to: ${endpoint} (attempt ${this.retryCount + 1})`);
      
      this.connection = new EventSource(endpoint);
      this.currentEndpoint = endpoint;
      this.setupEventListeners();

    } catch (error) {
      console.error('[SSE] Connection failed:', error);
      this.handleConnectionError(error);
    }
  }

  private setupEventListeners(): void {
    if (!this.connection || !this.config) return;

    const { subject, examId, win } = this.config;

    this.connection.onopen = () => {
      console.log('[SSE] Connection opened successfully');
      this.retryCount = 0; // 성공 시 재시도 카운트 리셋
      this.notifyConnectionStatus(win, 'connected');
    };

    this.connection.onmessage = (event) => {
      this.handleMessage(event, win, subject, examId);
    };

    this.connection.onerror = (error) => {
      console.error('[SSE] Connection error:', error);
      this.handleConnectionError(error);
    };
  }

  private handleConnectionError(error: any): void {
    if (!this.config) return;

    this.notifyConnectionStatus(this.config.win, 'error', error.message);

    // 최대 재시도 횟수 체크
    const maxRetries = this.config.maxRetries || 10;
    if (this.retryCount >= maxRetries) {
      console.error('[SSE] Maximum retry attempts reached');
      this.notifyConnectionStatus(this.config.win, 'failed');
      return;
    }

    // 지수 백오프로 재연결 스케줄링
    const delay = this.calculateRetryDelay();
    console.log(`[SSE] Scheduling reconnection in ${delay}ms (attempt ${this.retryCount + 1}/${maxRetries})`);

    this.reconnectTimer = setTimeout(() => {
      this.retryCount++;
      this.createConnection();
    }, delay);
  }

  private calculateRetryDelay(): number {
    const baseDelay = this.config?.baseDelay || 1000;
    const maxDelay = this.config?.maxDelay || 30000;
    
    // 지수 백오프: 1초 -> 2초 -> 4초 -> 8초 -> ... (최대 30초)
    const exponentialDelay = baseDelay * Math.pow(2, this.retryCount);
    
    // 지터 추가 (±25% 랜덤)
    const jitter = exponentialDelay * 0.25 * (Math.random() - 0.5);
    
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  private async checkNetworkConnection(): Promise<boolean> {
    try {
      // 간단한 연결 체크 (서버 ping)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.config!.endpoint.replace('/stream', '/health'), {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  private notifyConnectionStatus(
    win: BrowserWindow,
    status: 'connected' | 'error' | 'failed' | 'reconnecting',
    message?: string
  ): void {
    win.webContents.send('sse-status', {
      status,
      message,
      timestamp: new Date().toISOString(),
      retryCount: this.retryCount,
    });
  }

  disconnect(): void {
    console.log('[SSE] Disconnecting...');
    this.cleanup();
    this.config = null;
    this.retryCount = 0;
  }

  private cleanup(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }

    this.currentEndpoint = null;
  }

  // 연결 상태 체크
  isConnected(): boolean {
    return this.connection?.readyState === EventSource.OPEN;
  }

  // 수동 재연결
  async reconnect(): Promise<void> {
    if (!this.config) return;
    
    console.log('[SSE] Manual reconnection requested');
    this.retryCount = 0;
    await this.createConnection();
  }
}
```

### 2. 사용 방법
```typescript
// 전역 SSE 매니저 인스턴스
const sseManager = new SSEManager();

export function startSSE(info: { endpoint: string; subject: string; examId: string }) {
  const win = getMainWindow();
  if (!win) return;

  sseManager.connect({
    ...info,
    win,
    maxRetries: 10,
    baseDelay: 1000,
    maxDelay: 30000,
  });
}

export function stopSSE() {
  sseManager.disconnect();
}

export function reconnectSSE() {
  sseManager.reconnect();
}

export function getSSEStatus() {
  return sseManager.isConnected();
}
```

### 3. 프론트엔드 연결 상태 표시
```typescript
// React 컴포넌트에서 SSE 상태 표시
const SSEStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<'connected' | 'error' | 'failed' | 'reconnecting'>('connected');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleSSEStatus = (event: any, data: any) => {
      setStatus(data.status);
      setRetryCount(data.retryCount);
    };

    window.electronAPI.sse.onStatus(handleSSEStatus);

    return () => {
      window.electronAPI.sse.removeAllListeners();
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'reconnecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'failed': return 'text-red-700';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '연결됨';
      case 'reconnecting': return `재연결 중... (${retryCount}/10)`;
      case 'error': return '연결 오류';
      case 'failed': return '연결 실패';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {status === 'failed' && (
        <button
          onClick={() => window.electronAPI.sse.reconnect()}
          className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
        >
          재연결
        </button>
      )}
    </div>
  );
};
```

## 추가 개선 사항

### 1. 연결 품질 모니터링
```typescript
class ConnectionMonitor {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

  startHeartbeat(callback: () => void): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastHeartbeat > 30000) { // 30초 무응답 시
        console.warn('[SSE] Connection seems dead, triggering reconnection');
        callback();
      }
    }, 10000); // 10초마다 체크
  }

  recordHeartbeat(): void {
    this.lastHeartbeat = Date.now();
  }

  stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}
```

### 2. 오프라인 감지
```typescript
class OfflineDetector {
  private isOnline = navigator.onLine;
  private callbacks: Array<(online: boolean) => void> = [];

  constructor() {
    window.addEventListener('online', () => this.handleOnlineChange(true));
    window.addEventListener('offline', () => this.handleOnlineChange(false));
  }

  private handleOnlineChange(online: boolean): void {
    this.isOnline = online;
    this.callbacks.forEach(callback => callback(online));
  }

  onStatusChange(callback: (online: boolean) => void): void {
    this.callbacks.push(callback);
  }

  getStatus(): boolean {
    return this.isOnline;
  }
}
```

이렇게 개선하면 더 안정적이고 사용자 친화적인 SSE 연결 관리가 가능합니다!
