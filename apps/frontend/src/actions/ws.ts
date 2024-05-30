import { getToken } from '@/lib/token.localstorage';

export const REPEAT_LIMIT = 5;
export const RECONNECT_TIMEOUT = 2000;

export class WebloomWebSocket {
  socket: WebSocket | null;
  /**
   * @NOTE: 'connected' means connected successfully and authed
   */
  private state: 'connected' | 'not-authed' | 'connecting';
  private retry: boolean;
  private msgQ: string[];
  private repeat: number;
  private lock: boolean;

  constructor(
    private appId: number,
    private pageId: number,
  ) {
    this.socket = null;
    this.state = 'connecting';
    this.retry = true;
    this.msgQ = [];
    this.repeat = 0;
    this.lock = false;
    this.connectWebSocket();
  }

  public connectWebSocket() {
    try {
      const https = window.location.protocol === 'https:';

      this.socket = new WebSocket(
        https ? `wss://${window.location.host}` : `ws://localhost:3000`,
      );
      this.assignListeners();
    } catch (ig) {
      this.reconnect();
    }
  }

  /**
   *Note: The process of closing the connection begins with a closing handshake, and the close() method does not discard previously-sent messages before starting that closing handshake; even if the user agent is still busy sending those messages, the handshake will only start after the messages are sent.
   */
  public closeConnection() {
    this.retry = false;
    this.socket?.close();
  }

  /**
   * returnes is the internal state we keep not the state of the physical socket
   * use this if you want to check is the user authed => 'connected'
   * to get socket ready state use `this.socketState`
   */
  getState() {
    return this.state;
  }
  get socketState() {
    return this.socket?.readyState;
  }

  /**
   * @NOTE: once the open event fire will send `auth` msg
   */
  private assignListeners() {
    // TODO: do something useful with the errrs
    this.socket!.onerror = function (ev) {
      console.log('error', ev);
    };

    this.socket!.addEventListener('close', () => {
      this.reconnect();
    });

    this.socket!.addEventListener('message', (e) => {
      this.handleMessages(e.data);
    });

    this.socket!.addEventListener('open', () => {
      this.auth();

      while (this.msgQ.length) {
        if (this.socketState != this.socket?.OPEN) break;
        const msg = this.msgQ.shift();
        this.socket!.send(msg as string);
      }
    });
  }

  private reconnect() {
    if (!this.retry) {
      console.log('connection closed');
      return;
    }
    if (this.repeat > REPEAT_LIMIT) {
      throw new Error('connection error');
    }
    if (this.lock) return;

    console.log('reconnecting...');
    this.lock = true;
    this.repeat += 1;
    setTimeout(() => {
      this.connectWebSocket();
      this.lock = false;
    }, RECONNECT_TIMEOUT);
  }

  public sendMessage(msg: string) {
    this.msgQ.push(msg);
    if (this.socketState != this.socket?.OPEN) {
      this.reconnect();
      return;
    }

    while (this.msgQ.length) {
      if (this.socketState !== this.socket?.OPEN || this.state !== 'connected')
        break;
      const msg = this.msgQ.shift();
      this.socket!.send(msg as string);
    }
  }

  private auth() {
    this.socket!.send(
      JSON.stringify({
        event: 'auth',
        data: {
          access_token: getToken(),
          pageId: this.pageId,
          appId: this.appId,
        },
      }),
    );
  }

  private handleMessages(msg: string) {
    if (msg === 'ok authed') {
      this.state = 'connected';
      console.log('authed');
    } else if (msg === 'get out') {
      this.state = 'not-authed';
      console.log("couldn't auth");
    } else {
      console.log('ws new msg', msg);
    }
  }
}
