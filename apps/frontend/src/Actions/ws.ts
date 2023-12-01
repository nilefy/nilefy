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

  getState() {
    return this.state;
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
    } else if (msg === 'bitch get out') {
      this.state = 'not-authed';
      console.log("couldn't auth");
    } else {
      console.log('ws new msg', msg);
    }
  }
}

