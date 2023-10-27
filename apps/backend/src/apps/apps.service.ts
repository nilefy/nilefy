import { Injectable, Inject } from '@nestjs/common';
import { CreateAppDto, UpdateAppDto, AppDto } from '../dto/apps.dto';
import { RequestUser } from '../auth/auth.types';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { apps } from '../drizzle/schema/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';

@Injectable()
export class AppsService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async create(user: RequestUser, createAppDto: CreateAppDto): Promise<AppDto> {
    const values = { ...createAppDto, userId: user.userId };
    const [app] = await this.db.insert(apps).values(values).returning();
    return app;
  }

  async findAll(user: RequestUser): Promise<AppDto[]> {
    const userApps = await this.db.query.apps.findMany({
      where: eq(apps.userId, user.userId),
    });
    return userApps;
  }

  async findOne(user: RequestUser, id: number): Promise<AppDto | undefined> {
    const app = await this.db.query.apps.findFirst({
      where: and(eq(apps.id, id), eq(apps.userId, user.userId)),
    });
    return app;
  }

  async update(
    user: RequestUser,
    id: number,
    updateAppDto: UpdateAppDto,
  ): Promise<AppDto> {
    const [app] = await this.db
      .update(apps)
      .set({ ...updateAppDto, updatedAt: sql`now()` })
      .where(
        and(
          eq(apps.id, id),
          eq(apps.userId, user.userId),
          isNull(apps.deletedAt),
        ),
      )
      .returning();
    return app;
  }

  async delete(user: RequestUser, id: number): Promise<AppDto> {
    const [app] = await this.db
      .update(apps)
      .set({ deletedAt: sql`now()` })
      .where(and(eq(apps.id, id), eq(apps.userId, user.userId)))
      .returning();
    return app;
  }
}
