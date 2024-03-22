import { addQuery, deleteQuery, updateQuery } from '@/api/queries.api';
import { QueryClient } from '@tanstack/query-core';
import { EditorState } from './editor';
import { MobxMutation } from 'mobbing-query';
import { FetchXError } from '@/utils/fetch';

/**
 * @description This class is responsible for managing tanstack queries not our queries
 */
export class QueriesManager {
  private readonly queryClient;
  private readonly editor: EditorState;
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
        this.editor.getQueryById(data.id).updateQuery(data);
      },
    }));
  }
}
