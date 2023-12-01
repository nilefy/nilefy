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
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';

class LoomSocket extends WebSocket {
  user: RequestUser | null = null;
}

type LoomServer = Server<typeof LoomSocket>;

// TODO: make page id dynamic
// TODO: make app id dynamic
@WebSocketGateway({
  WebSocket: LoomSocket,
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private componentsService: ComponentsService,
    private jwtService: JwtService,
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
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
  async handleInsert(
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
      console.log('parent', payload.parent);
      await this.componentsService.create({
        ...rest,
        pageId: 1,
        createdById: 1,
        parent: +payload.parent,
      });
      console.log('ADDED COMPONENT');
      return `done ${payload.id}`;
    } catch (e) {
      console.log(e);
      throw new WsException(e.message);
    }
  }

  @SubscribeMessage('update')
  async handleUpdate(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody()
    payload: (Partial<WebloomNode> & { id: WebloomNode['id'] })[],
  ) {
    const user = socket.user;
    if (user === null) {
      socket.send('bitch send auth first');
      socket.close();
      return;
    }

    try {
      await this.db.transaction(async (tx) => {
        return await Promise.all(
          payload.map((c) =>
            this.componentsService.update(
              1,
              +c.id,
              {
                ...c,
                updatedById: user.userId,
                parent: c.parent ? +c.parent : undefined,
              },
              {
                // @ts-ignore
                tx,
              },
            ),
          ),
        );
      });
      console.log('UPDATED COMPONENT/s');
      return `done`;
    } catch (e) {
      console.log(e);
      throw new WsException(e.message);
    }
  }

  @SubscribeMessage('delete')
  async handleDelete(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody() payload: WebloomNode['id'][],
  ) {
    const user = socket.user;
    if (user === null) {
      socket.send('bitch send auth first');
      socket.close();
      return;
    }
    try {
      await this.componentsService.delete(
        1,
        payload.map((c) => +c),
      );
      console.log('DELETED COMPONENT/s');
      return `done`;
    } catch (e) {
      console.log(e);
      throw new WsException(e.message);
    }
  }
}
