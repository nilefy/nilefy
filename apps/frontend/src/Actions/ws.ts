import { getToken } from '@/lib/token.localstorage';

export class WebloomWebSocket {
  socket: WebSocket;
  private state: 'connected' | 'not-authed' | 'connecting';

  constructor(
    private appId: number,
    private pageId: number,
  ) {
    this.socket = new WebSocket('ws://localhost:3000');
    this.state = 'connecting';
    this.assignListeners();
  }

  /**
   *Note: The process of closing the connection begins with a closing handshake, and the close() method does not discard previously-sent messages before starting that closing handshake; even if the user agent is still busy sending those messages, the handshake will only start after the messages are sent.
   */
  public closeConnection() {
    this.socket.close();
  }

  getState() {
    return this.state;
  }
  get socketState() {
    return this.socket.readyState;
  }
  // note it will call the auth
  private assignListeners() {
    this.socket.onerror = function (ev) {
      console.log('error', ev);
    };

    this.socket.onclose = function () {
      console.log('connection closed');
    };

    this.socket.addEventListener('message', (e) => {
      this.handleMessages(e.data);
    });

    this.socket.addEventListener('open', () => {
      this.auth();
    });
  }

  private auth() {
    this.socket.send(
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
