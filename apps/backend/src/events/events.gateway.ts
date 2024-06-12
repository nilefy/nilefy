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
import { NilefyNode, frontKnownKeys } from '../dto/components.dto';
import { DatabaseI, pages as PagesTable } from '@nilefy/database';
import {
  SOCKET_EVENTS_REQUEST,
  SOCKET_EVENTS_RESPONSE,
} from '@nilefy/constants';
import { ZodValidationPipe } from '../pipes/zod.pipe';
import {
  AddQueryDto,
  addQuerySchema,
  UpdateQueryDto,
  updateQuerySchema,
} from '../dto/data_queries.dto';
import { DataQueriesService } from '../data_queries/data_queries.service';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';

class LoomSocket extends WebSocket {
  user: RequestUser | null = null;
  // if user exist implicitly means the rest of the props exist(i'm sorry)
  appId: AppDto['id'] = 0;
  pageId: PageDto['id'] = 0;
}

type LoomServer = Server<typeof LoomSocket>;
type UpdateNodePayload = (Partial<NilefyNode> & { id: NilefyNode['id'] })[];

// TODO: make page id dynamic
@WebSocketGateway({
  WebSocket: LoomSocket,
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private componentsService: ComponentsService,
    private jwtService: JwtService,
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    private dataQueriesService: DataQueriesService,
  ) {}

  @WebSocketServer()
  server: LoomServer;

  handleConnection(client: LoomSocket) {
    console.log('CONNECTION: client connected to ws', client.user?.userId);
    client.on('error', (e) => console.error('ERROR: ', e));
  }

  handleDisconnect() {
    console.log('DISCONNECTION: client disconnect from ws');
  }

  @SubscribeMessage(SOCKET_EVENTS_REQUEST.AUTH)
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
      return {
        message: SOCKET_EVENTS_RESPONSE.AUTHED,
      };
    } catch {
      socket.send(
        JSON.stringify({
          message: SOCKET_EVENTS_RESPONSE.NOT_AUTHED,
        }),
      );
      socket.close();
      return;
    }
  }

  /**
   * for now gonna depend on frontend id
   */
  @SubscribeMessage(SOCKET_EVENTS_REQUEST.CREATE_NODE)
  async handleInsert(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody()
    {
      opId,
      nodes,
      sideEffects,
    }: {
      /**
       * operation id
       */
      opId?: string;
      nodes: NilefyNode[];
      sideEffects: UpdateNodePayload;
    },
  ) {
    // TODO: is there a middleware concept in ws
    const user = socket.user;
    if (user === null) {
      socket.send(
        JSON.stringify({
          message: SOCKET_EVENTS_RESPONSE.NOT_AUTHED,
        }),
      );
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
      return {
        opId,
        message: 'done',
      };
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  @SubscribeMessage(SOCKET_EVENTS_REQUEST.CHANGE_PAGE)
  async handleChangePage(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody(
      new ZodValidationPipe(
        z.object({
          opId: z.string().optional(),
          pageId: z.number(),
        }),
      ),
    )
    { opId, pageId }: { opId?: string; pageId: number },
  ) {
    const user = socket.user;
    if (user === null) {
      socket.send(
        JSON.stringify({
          message: SOCKET_EVENTS_RESPONSE.NOT_AUTHED,
        }),
      );
      socket.close();
      return;
    }

    try {
      const page = await this.db.query.pages.findFirst({
        columns: { id: true },
        where: and(
          eq(PagesTable.id, pageId),
          eq(PagesTable.appId, socket.appId),
        ),
      });
      if (!page) {
        throw new Error('page not owned by this app');
      }
      socket.pageId = pageId;
      return {
        opId,
        message: SOCKET_EVENTS_RESPONSE.PAGE_CHANGED,
      };
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  @SubscribeMessage(SOCKET_EVENTS_REQUEST.UPDATE_NODE)
  async handleUpdate(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody()
    { opId, updates }: { opId?: string; updates: UpdateNodePayload },
  ) {
    const user = socket.user;
    if (user === null) {
      socket.send(
        JSON.stringify({
          message: SOCKET_EVENTS_RESPONSE.NOT_AUTHED,
        }),
      );
      socket.close();
      return;
    }

    try {
      await this.db.transaction(async (tx) => {
        return await Promise.all(
          updates.map((c) => {
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
      return {
        opId,
        message: 'done',
      };
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  @SubscribeMessage(SOCKET_EVENTS_REQUEST.DELETE_NODE)
  async handleDelete(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody()
    {
      opId,
      nodesId,
      sideEffects,
    }: {
      /**
       * operation id
       */
      opId?: string;
      nodesId: NilefyNode['id'][];
      sideEffects: UpdateNodePayload;
    },
  ) {
    const user = socket.user;
    if (user === null) {
      socket.send(
        JSON.stringify({
          message: SOCKET_EVENTS_RESPONSE.NOT_AUTHED,
        }),
      );
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
      return {
        opId,
        message: 'done',
      };
    } catch (e) {
      throw new WsException(e.message);
    }
  }

  @SubscribeMessage(SOCKET_EVENTS_REQUEST.CREATE_QUERY)
  async handleAddQuery(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody(
      new ZodValidationPipe(
        z.object({
          query: addQuerySchema,
          opId: z.string().optional(),
        }),
      ),
    )
    query: { query: AddQueryDto; opId?: string },
  ) {
    const user = socket.user;
    if (user === null) {
      socket.send(
        JSON.stringify({
          message: SOCKET_EVENTS_RESPONSE.NOT_AUTHED,
        }),
      );
      socket.close();
      return;
    }
    await this.dataQueriesService.addQuery({
      ...query.query,
      createdById: user.userId,
      appId: socket.appId,
    });
    return {
      opId: query.opId,
      message: 'done',
    };
  }

  @SubscribeMessage(SOCKET_EVENTS_REQUEST.DELETE_QUERY)
  async handleDeleteQuery(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody(
      new ZodValidationPipe(
        z.object({ queryId: z.string(), opId: z.string().optional() }),
      ),
    )
    query: { opId?: string; queryId: string },
  ) {
    const user = socket.user;
    if (user === null) {
      socket.send(
        JSON.stringify({
          message: SOCKET_EVENTS_RESPONSE.NOT_AUTHED,
        }),
      );
      socket.close();
      return;
    }

    await this.dataQueriesService.deleteQuery(socket.appId, query.queryId);
    return {
      opId: query.opId,
      message: 'done',
    };
  }

  @SubscribeMessage(SOCKET_EVENTS_REQUEST.UPDATE_QUERY)
  async handleUpdateQuery(
    @ConnectedSocket() socket: LoomSocket,
    @MessageBody(
      new ZodValidationPipe(
        z.object({
          query: updateQuerySchema,
          opId: z.string().optional(),
          queryId: z.string(),
        }),
      ),
    )
    query: { query: UpdateQueryDto; opId?: string; queryId: string },
  ) {
    const user = socket.user;
    if (user === null) {
      socket.send(
        JSON.stringify({
          message: SOCKET_EVENTS_RESPONSE.NOT_AUTHED,
        }),
      );
      socket.close();
      return;
    }

    await this.dataQueriesService.updateQuery({
      appId: socket.appId,
      queryId: query.queryId,
      updatedById: user.userId,
      query: query.query,
    });
    return {
      opId: query.opId,
      message: 'done',
    };
  }
}
