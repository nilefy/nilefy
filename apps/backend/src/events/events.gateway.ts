import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  MessageBody,
  WsException,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
} from '@nestjs/websockets';
import { WebloomNode } from '../dto/apps.dto';
import { Server, WebSocket } from 'ws';
import { ComponentsService } from '../components/components.service';
import { PayloadUser, RequestUser } from 'src/auth/auth.types';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../evn.validation';
import { JwtService } from '@nestjs/jwt';

class LoomSocket extends WebSocket {
  user: RequestUser | null = null;
}

type LoomServer = Server<typeof LoomSocket>;

@WebSocketGateway({
  WebSocket: LoomSocket,
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private componentsService: ComponentsService,
    private jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: LoomServer;

  afterInit(server: LoomServer) {
    console.log('options', server.options);
    console.log('WS CREATED: ', server.address);
  }

  handleConnection(client: LoomSocket) {
    console.log('CONNECTION: client connected to ws', client.user?.userId);
    client.on('error', (e) => console.error('ERROR: ', e));
    client.send('hi');
  }

  handleDisconnect() {
    console.log('DISCONNECTION: client disconnect from ws');
  }

  @SubscribeMessage('auth')
  async handleAuth(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody() { access_token }: { access_token: string },
  ) {
    try {
      const payload =
        await this.jwtService.verifyAsync<PayloadUser>(access_token);
      socket.user = { userId: payload.sub, username: payload.username };
      console.log('USER AUTHED: ', socket.user.username);
      // TODO: return structred signal
      return 'ok';
    } catch {
      socket.send('bitch get out');
      socket.close();
      return;
    }
  }

  @SubscribeMessage('insert')
  async handleMessage(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody() payload: WebloomNode,
  ) {
    if (socket.user === null) {
      socket.send('bitch send auth first');
      socket.close();
      return;
    }

    const { id, ...rest } = payload;
    try {
      await this.componentsService.create({
        ...rest,
        // @ts-ignore
        props: rest.props,
        pageId: 1,
        name: payload.name,
        createdById: 1,
        parent: 1,
      });
      console.log('ADDED COMPONENT');
      return `done ${payload.id}`;
    } catch (e) {
      console.log(e);
      throw new WsException(e.message);
    }
  }
}
