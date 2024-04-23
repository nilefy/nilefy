import { addQuery, deleteQuery, updateQuery } from '@/api/queries.api';
import {
  createJSquery,
  deleteJSQuery,
  updateJSquery,
} from '@/api/jsQueries.api';
import { QueryClient } from '@tanstack/query-core';
import { EditorState } from './editor';
import { MobxMutation } from 'mobbing-query';
import { FetchXError } from '@/utils/fetch';
import { WebloomJSQuery } from './jsQuery';
import { WebloomQuery } from './query';
import { merge } from 'lodash';
import { getNewEntityName } from '../entitiesNameSeed';
import { EDITOR_CONSTANTS } from '@webloom/constants';

type OmitWorkspaceAndAppId<T> = Omit<T, 'workspaceId' | 'appId'>;

/**
 * @description This class is responsible for managing tanstack queries not our queries
 */
export class QueriesManager {
  private readonly queryClient;
  private readonly editor: EditorState;
  private readonly workspaceId: number;
  private readonly appId: number;
  public addJSquery: MobxMutation<
    Awaited<ReturnType<typeof createJSquery>>,
    FetchXError,
    Omit<
      Parameters<typeof createJSquery>[0],
      'dto' | 'workspaceId' | 'appId'
    > & {
      dto: Omit<Parameters<typeof createJSquery>[0]['dto'], 'id'>;
    }
  >;
  public deleteJSquery: MobxMutation<
    Awaited<ReturnType<typeof deleteJSQuery>>,
    FetchXError,
    OmitWorkspaceAndAppId<Parameters<typeof deleteJSQuery>[0]>
  >;
  public updateJSquery: MobxMutation<
    Awaited<ReturnType<typeof updateJSquery>>,
    FetchXError,
    OmitWorkspaceAndAppId<Parameters<typeof updateJSquery>[0]>
  >;
  public addQuery: MobxMutation<
    Awaited<ReturnType<typeof addQuery>>,
    FetchXError,
    OmitWorkspaceAndAppId<Parameters<typeof addQuery>[0]>
  >;
  public deleteQuery: MobxMutation<
    Awaited<ReturnType<typeof deleteQuery>>,
    FetchXError,
    OmitWorkspaceAndAppId<Parameters<typeof deleteQuery>[0]>
  >;
  public updateQuery: MobxMutation<
    Awaited<ReturnType<typeof updateQuery>>,
    FetchXError,
    OmitWorkspaceAndAppId<Parameters<typeof updateQuery>[0]>
  >;

  constructor(queryClient: QueryClient, editor: EditorState) {
    this.editor = editor;
    this.queryClient = queryClient;
    this.workspaceId = editor.workspaceId;
    this.appId = editor.appId;
    this.addQuery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (
        vars: OmitWorkspaceAndAppId<Parameters<typeof addQuery>[0]>,
      ) => {
        return addQuery(this.addWorkspaceAndAppId(vars));
      },
      onSuccess: (data) => {
        this.editor.addQuery(data);
      },
    }));
    this.deleteQuery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (
        vars: OmitWorkspaceAndAppId<Parameters<typeof deleteQuery>[0]>,
      ) => {
        return deleteQuery(this.addWorkspaceAndAppId(vars));
      },
      onSuccess: (data) => {
        this.editor.removeQuery(data.id);
      },
    }));
    this.updateQuery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (
        vars: OmitWorkspaceAndAppId<Parameters<typeof updateQuery>[0]>,
      ) => {
        return updateQuery(this.addWorkspaceAndAppId(vars));
      },
      onSuccess: (data) => {
        (this.editor.getQueryById(data.id) as WebloomQuery).updateQuery(data);
      },
    }));
    this.addJSquery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (
        vars: Omit<
          Parameters<typeof createJSquery>[0],
          'dto' | 'workspaceId' | 'appId'
        > & {
          dto: Omit<Parameters<typeof createJSquery>[0]['dto'], 'id'>;
        },
      ) => {
        return createJSquery(
          merge(vars, {
            workspaceId: this.workspaceId,
            appId: this.appId,
            dto: { id: getNewEntityName(EDITOR_CONSTANTS.JS_QUERY_BASE_NAME) },
          }),
        );
      },
      onSuccess: (data) => {
        this.editor.addJSQuery(data);
      },
    }));
    this.deleteJSquery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (
        vars: OmitWorkspaceAndAppId<Parameters<typeof deleteJSQuery>[0]>,
      ) => {
        return deleteJSQuery(this.addWorkspaceAndAppId(vars));
      },
      onSuccess: (data) => {
        this.editor.removeQuery(data.id);
      },
    }));
    this.updateJSquery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (
        vars: OmitWorkspaceAndAppId<Parameters<typeof updateJSquery>[0]>,
      ) => {
        return updateJSquery(this.addWorkspaceAndAppId(vars));
      },
      onSuccess: (data) => {
        (this.editor.getQueryById(data.id) as WebloomJSQuery).updateQuery(data);
      },
    }));
  }
  addWorkspaceAndAppId<T extends Record<string, unknown>>(vars: T) {
    return { ...vars, workspaceId: this.workspaceId, appId: this.appId };
  }
}
