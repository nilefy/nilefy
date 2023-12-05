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
import { AppDto, WebloomNode } from '../dto/apps.dto';
import { Server, WebSocket } from 'ws';
import { ComponentsService } from '../components/components.service';
import { PayloadUser, RequestUser } from 'src/auth/auth.types';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { PageDto } from 'src/dto/pages.dto';

class LoomSocket extends WebSocket {
  user: RequestUser | null = null;
  // if user exist implicitly means the rest of the props exist(i'm sorry)
  appId: AppDto['id'] = 0;
  pageId: PageDto['id'] = 0;
}

type LoomServer = Server<typeof LoomSocket>;
type UpdateNodePayload = (Partial<WebloomNode> & { id: WebloomNode['id'] })[];

// TODO: make page id dynamic
// TODO: make app id dynamic
@WebSocketGateway({
  WebSocket: LoomSocket,
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private componentsService: ComponentsService,
    private jwtService: JwtService,
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
  ) {}

  @WebSocketServer()
  server: LoomServer;

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
    @MessageBody()
    {
      access_token,
      appId,
      pageId,
    }: { access_token: string; appId: AppDto['id']; pageId: PageDto['id'] },
  ) {
    try {
      const payload =
        await this.jwtService.verifyAsync<PayloadUser>(access_token);
      socket.user = { userId: payload.sub, username: payload.username };
      // TODO: verify if the user has access to this app
      socket.appId = appId;
      socket.pageId = pageId;
      console.log('USER AUTHED: ', socket.user.username);
      // TODO: return structred signal
      socket.send('ok authed');
      return;
    } catch {
      socket.send('bitch get out');
      socket.close();
      return;
    }
  }

  /**
   * for now gonna depend on frontend id
   */
  @SubscribeMessage('insert')
  async handleInsert(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody()
    payload: {
      node: WebloomNode;
      sideEffects: UpdateNodePayload;
    },
  ) {
    const user = socket.user;
    if (user === null) {
      socket.send('bitch send auth first');
      socket.close();
      return;
    }

    try {
      await this.db.transaction(async (tx) => {
        await this.componentsService.create(
          {
            ...payload.node,
            pageId: socket.pageId,
            createdById: user.userId,
          },
          {
            // @ts-ignore
            tx,
          },
        );
        await Promise.all(
          payload.sideEffects.map((c) => {
            // clear all columns that not on the db(i hate drizzzle already)
            const { columnWidth, nodes, dom, ...temp } = c;
            return this.componentsService.update(
              socket.pageId,
              c.id,
              {
                ...temp,
                updatedById: user.userId,
              },
              {
                // @ts-ignore
                tx,
              },
            );
          }),
        );
      });
      console.log('ADDED COMPONENT');
      return `done ${payload.node.id}`;
    } catch (e) {
      console.log(e);
      throw new WsException(e.message);
    }
  }

  @SubscribeMessage('update')
  async handleUpdate(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody()
    payload: UpdateNodePayload,
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
          payload.map((c) => {
            // clear all columns that not on the db(i hate drizzzle already)
            const { columnWidth, nodes, dom, ...temp } = c;
            return this.componentsService.update(
              socket.pageId,
              c.id,
              {
                ...temp,
                updatedById: user.userId,
              },
              {
                // @ts-ignore
                tx,
              },
            );
          }),
        );
      });
      console.log('UPDATED COMPONENT/s');
      return `done`;
    } catch (e) {
      console.log('e in update', e);
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
      await this.componentsService.delete(socket.pageId, payload);
      console.log('DELETED COMPONENT/s');
      return `done`;
    } catch (e) {
      console.log(e);
      throw new WsException(e.message);
    }
  }
}
