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

/**
 * @description This class is responsible for managing tanstack queries not our queries
 */
export class QueriesManager {
  private readonly queryClient;
  private readonly editor: EditorState;
  public addJSquery: MobxMutation<
    Awaited<ReturnType<typeof createJSquery>>,
    FetchXError,
    Omit<Parameters<typeof createJSquery>[0], 'dto'> & {
      dto: Omit<Parameters<typeof createJSquery>[0]['dto'], 'id'>;
    }
  >;
  public deleteJSquery: MobxMutation<
    Awaited<ReturnType<typeof deleteJSQuery>>,
    FetchXError,
    Parameters<typeof deleteJSQuery>[0]
  >;
  public updateJSquery: MobxMutation<
    Awaited<ReturnType<typeof updateJSquery>>,
    FetchXError,
    Parameters<typeof updateJSquery>[0]
  >;
  public addQuery: MobxMutation<
    Awaited<ReturnType<typeof addQuery>>,
    FetchXError,
    Parameters<typeof addQuery>[0]
  >;
  public deleteQuery: MobxMutation<
    Awaited<ReturnType<typeof deleteQuery>>,
    FetchXError,
    Parameters<typeof deleteQuery>[0]
  >;
  public updateQuery: MobxMutation<
    Awaited<ReturnType<typeof updateQuery>>,
    FetchXError,
    Parameters<typeof updateQuery>[0]
  >;

  constructor(queryClient: QueryClient, editor: EditorState) {
    this.editor = editor;
    this.queryClient = queryClient;
    this.addQuery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (vars: Parameters<typeof addQuery>[0]) => {
        return addQuery(vars);
      },
      onSuccess: (data) => {
        this.editor.addQuery(data);
      },
    }));
    this.deleteQuery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (vars: Parameters<typeof deleteQuery>[0]) => {
        return deleteQuery(vars);
      },
      onSuccess: (data) => {
        this.editor.removeQuery(data.id);
      },
    }));
    this.updateQuery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (vars: Parameters<typeof updateQuery>[0]) => {
        return updateQuery(vars);
      },
      onSuccess: (data) => {
        (this.editor.getQueryById(data.id) as WebloomQuery).updateQuery(data);
      },
    }));
    this.addJSquery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (
        vars: Omit<Parameters<typeof createJSquery>[0], 'dto'> & {
          dto: Omit<Parameters<typeof createJSquery>[0]['dto'], 'id'>;
        },
      ) => {
        return createJSquery(
          merge(vars, {
            dto: { id: getNewEntityName(EDITOR_CONSTANTS.JS_QUERY_BASE_NAME) },
          }),
        );
      },
      onSuccess: (data) => {
        this.editor.addJSQuery(data);
      },
    }));
    this.deleteJSquery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (vars: Parameters<typeof deleteJSQuery>[0]) => {
        return deleteJSQuery(vars);
      },
      onSuccess: (data) => {
        this.editor.removeQuery(data.id);
      },
    }));
    this.updateJSquery = new MobxMutation(this.queryClient, () => ({
      mutationFn: (vars: Parameters<typeof updateJSquery>[0]) => {
        return updateJSquery(vars);
      },
      onSuccess: (data) => {
        (this.editor.getQueryById(data.id) as WebloomJSQuery).updateQuery(data);
      },
    }));
  }
}
