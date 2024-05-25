import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  MessageBody,
  WsException,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { AppDto } from '../dto/apps.dto';
import { Server, WebSocket } from 'ws';
import { ComponentsService } from '../components/components.service';
import { PayloadUser, RequestUser } from 'src/auth/auth.types';
import { JwtService } from '@nestjs/jwt';
import { Inject } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { PageDto } from 'src/dto/pages.dto';
import { pick } from 'lodash';
import { WebloomNode, frontKnownKeys } from '../dto/components.dto';
import { DatabaseI } from '@webloom/database';

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
      socket.send('get out');
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
    {
      nodes,
      sideEffects,
    }: {
      nodes: WebloomNode[];
      sideEffects: UpdateNodePayload;
    },
  ) {
    // TODO: is there a middleware concept in ws
    const user = socket.user;
    if (user === null) {
      socket.send('need send auth first');
      socket.close();
      return;
    }

    try {
      await this.db.transaction(async (tx) => {
        await this.componentsService.create(
          nodes.map((node) => ({
            ...node,
            pageId: socket.pageId,
            createdById: user.userId,
          })),
          {
            tx,
          },
        );
        await Promise.all(
          sideEffects.map((c) => {
            // clear all columns that not on the db(i hate drizzzle already)
            const temp = pick(c, frontKnownKeys);
            return this.componentsService.update(
              socket.pageId,
              c.id,
              {
                ...temp,
                updatedById: user.userId,
              },
              {
                tx,
              },
            );
          }),
        );
      });
      console.log('ADDED COMPONENT/s');
      return `done ${nodes[0]?.id}`;
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
      socket.send('send auth first');
      socket.close();
      return;
    }
    try {
      await this.db.transaction(async (tx) => {
        return await Promise.all(
          payload.map((c) => {
            // clear all columns that not on the db(i hate drizzzle already)
            const temp = pick(c, frontKnownKeys);
            return this.componentsService.update(
              socket.pageId,
              c.id,
              {
                ...temp,
                updatedById: user.userId,
              },
              {
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
    @MessageBody()
    {
      nodesId,
      sideEffects,
    }: {
      nodesId: WebloomNode['id'][];
      sideEffects: UpdateNodePayload;
    },
  ) {
    const user = socket.user;
    if (user === null) {
      socket.send('send auth first');
      socket.close();
      return;
    }
    try {
      this.db.transaction(async (tx) => {
        // eslint-disable-next-line drizzle/enforce-delete-with-where
        await this.componentsService.delete(socket.pageId, nodesId, { tx });
        await Promise.all(
          sideEffects.map((c) => {
            // clear all columns that not on the db(i hate drizzzle already)
            const temp = pick(c, frontKnownKeys);
            return this.componentsService.update(
              socket.pageId,
              c.id,
              {
                ...temp,
                updatedById: user.userId,
              },
              {
                tx,
              },
            );
          }),
        );
      });
      console.log('DELETED COMPONENT/s ' + nodesId);
      return `done`;
    } catch (e) {
      console.log(e);
      throw new WsException(e.message);
    }
  }
}
