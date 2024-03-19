import { makeObservable, observable, action, autorun, toJS } from 'mobx';
import { Snapshotable } from './interfaces';
import { CompleteQueryI, runQuery as runQueryApi } from '@/api/queries.api';
import { EvaluationManager } from './evaluationManager';
import { DependencyManager } from './dependencyManager';
import { Entity } from './entity';
import { QueryClient } from '@tanstack/query-core';
import { MobxMutation } from 'mobbing-query';
import { FetchXError } from '@/utils/fetch';
import {
  genEventHandlerUiSchema,
  widgetsEventHandlerJsonSchema,
} from '@/components/rjsf_shad/eventHandler';
import _ from 'lodash';
import { EditorState } from './editor';

const SucessEventKey = 'loomSuccessEvent';
const FailureEventKey = 'loomFailureEvent';
const SucessEventType = 'success';
const FailureEventType = 'failure';

export type QueryRawValues = {
  /**
   * @description data returned from the query
   * @NOTE: start with undefined
   */
  data: unknown;
  /**
   * dataSource type
   */
  type: string;
  /**
   * statusCode of the query call to the other backend, or 505 if ourserver faced error
   */
  statusCode?: number;
  /**
   * if the plugin returned error will be here
   */
  error?: string;
  config: CompleteQueryI['query'];
  queryState: 'idle' | 'loading' | 'success' | 'error';
};

export class WebloomQuery
  extends Entity
  implements
    Snapshotable<
      Omit<
        ConstructorParameters<typeof WebloomQuery>[0],
        | 'editor'
        | 'dataSource'
        | 'evaluationManger'
        | 'dependencyManager'
        | 'queryClient'
      >
    >
{
  editor: EditorState;
  appId: CompleteQueryI['appId'];
  workspaceId: number;
  dataSource: CompleteQueryI['dataSource'];
  dataSourceId: CompleteQueryI['dataSourceId'];
  createdAt: CompleteQueryI['createdAt'];
  updatedAt: CompleteQueryI['updatedAt'];
  triggerMode: CompleteQueryI['triggerMode'];
  static queryClient: QueryClient;
  queryRunner: MobxMutation<
    Awaited<ReturnType<typeof runQueryApi>>,
    FetchXError,
    Parameters<typeof runQueryApi>[0],
    void
  >;

  constructor({
    query,
    id,
    appId,
    dataSource,
    dataSourceId,
    createdAt,
    updatedAt,
    evaluationManger,
    dependencyManager,
    triggerMode,
    workspaceId,
    editor,
  }: Omit<CompleteQueryI, 'createdById' | 'updatedById'> & {
    evaluationManger: EvaluationManager;
    dependencyManager: DependencyManager;
    workspaceId: number;
    editor: EditorState;
  }) {
    WebloomQuery.addEventConfigToSchema(dataSource.dataSource.queryConfig);
    super({
      id,
      dependencyManager,
      evaluationManger,
      rawValues: {
        config: query,
        data: undefined,
        queryState: 'idle',
        type: dataSource.dataSource.type,
        statusCode: undefined,
        error: undefined,
      } satisfies QueryRawValues,
      schema: {
        dataSchema: dataSource.dataSource.queryConfig.schema,
        uiSchema: dataSource.dataSource.queryConfig.uiSchema,
      },
      nestedPathPrefix: 'config',
    });
    this.editor = editor;
    this.appId = appId;
    this.workspaceId = workspaceId;
    this.dataSourceId = dataSourceId;
    this.dataSource = dataSource;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.triggerMode = triggerMode;
    this.queryRunner = new MobxMutation(WebloomQuery.queryClient, () => ({
      mutationFn: (vars: Parameters<typeof runQueryApi>[0]) => {
        return runQueryApi(vars);
      },
      onMutate: () => {
        this.setQueryState('loading');
      },
      onError: (error) => {
        this.setQueryState('error');
        this.updateQuery({
          rawValues: {
            error: error.message,
            statusCode: error.statusCode,
          },
        });
        // similar to widgets the query is responsible of informing the editor when to run events
        this.editor.executeActions(this.id, FailureEventType, FailureEventKey);
      },
      onSuccess: (data) => {
        this.updateQuery({
          rawValues: {
            data: data.data,
            error: data.error,
            statusCode: data.status,
          },
        });
        if (data.error) {
          this.setQueryState('error');
          // similar to widgets the query is responsible of informing the editor when to run events
          // the other backend could fail but our backend will return the failure state in the json so fetchX cannot know it's failure
          this.editor.executeActions(
            this.id,
            FailureEventType,
            FailureEventKey,
          );
        }
        this.setQueryState('success');
        // similar to widgets the query is responsible of informing the editor when to run events
        this.editor.executeActions(this.id, SucessEventType, SucessEventKey);
      },
    }));
    makeObservable(this, {
      createdAt: observable,
      updatedAt: observable,
      updateQuery: action,
      setQueryState: action,
      reset: action.bound,
    });
    if (this.triggerMode === 'onAppLoad') {
      this.queryRunner.mutate({
        appId: this.appId,
        queryId: this.id,
        workspaceId: this.workspaceId,
        body: {
          evaluatedConfig: toJS(this.config) as Record<string, unknown>,
        },
      });
    }
    autorun(() =>
      console.log('query:rawvalues', this.id, toJS(this.rawValues)),
    );
  }

  /**
   * path the query json schema and ui schema to add event handlers config
   */
  private static addEventConfigToSchema(
    config: CompleteQueryI['dataSource']['dataSource']['queryConfig'],
  ) {
    const dataSchema = config.schema;
    if (dataSchema) {
      let path = 'properties';
      if ('$ref' in dataSchema && typeof dataSchema['$ref'] === 'string') {
        path = dataSchema['$ref'].split('/').slice(1).join('.') + '.' + path;
      }
      _.set(
        dataSchema,
        path + '.' + SucessEventKey,
        widgetsEventHandlerJsonSchema,
      );
      _.set(
        dataSchema,
        path + '.' + FailureEventKey,
        widgetsEventHandlerJsonSchema,
      );
    }
    let uiSchema = config.uiSchema;
    if (!uiSchema) {
      _.set(config, 'uiSchema', {});
      uiSchema = config.uiSchema;
    }
    _.set(
      uiSchema as Record<string, unknown>,
      SucessEventKey,
      genEventHandlerUiSchema(
        {
          [SucessEventType]: 'Success',
        },
        'success events',
      ),
    );
    _.set(
      uiSchema as Record<string, unknown>,
      FailureEventKey,
      genEventHandlerUiSchema(
        {
          [FailureEventType]: 'Failure',
        },
        'failure events',
      ),
    );
  }

  setQueryState(state: 'idle' | 'loading' | 'success' | 'error') {
    this.rawValues.queryState = state;
  }

  // TODO: make it handle id update
  updateQuery(
    dto: Omit<
      Partial<CompleteQueryI & { rawValues: Partial<QueryRawValues> }>,
      'id'
    >,
  ) {
    if (dto.query) this.rawValues.config = dto.query;
    if (dto.updatedAt) this.updatedAt = dto.updatedAt;
    if (dto.dataSource) this.dataSource = dto.dataSource;
    if (dto.dataSourceId) this.dataSourceId = dto.dataSourceId;
    if (dto.triggerMode) this.triggerMode = dto.triggerMode;
    if (dto.rawValues) {
      this.rawValues.data = dto.rawValues.data;
      this.rawValues.error = dto.rawValues.error;
      this.rawValues.statusCode = dto.rawValues.statusCode;
    }
  }

  /**
   * trigger the query async, but don't return the promise
   */
  run() {
    this.queryRunner.mutate({
      workspaceId: this.workspaceId,
      appId: this.appId,
      queryId: this.id,
      body: {
        evaluatedConfig: toJS(this.config) as Record<string, unknown>,
      },
    });
  }

  /**
   * Clear the data and error properties of the query.
   */
  reset() {
    this.rawValues.data = undefined;
    this.rawValues.queryState = 'idle';
    this.rawValues.statusCode = undefined;
    this.rawValues.error = undefined;
  }

  get snapshot() {
    return {
      id: this.id,
      dataSourceId: this.dataSourceId,
      query: this.rawValues,
      appId: this.appId,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt,
      triggerMode: this.triggerMode,
      workspaceId: this.workspaceId,
    };
  }

  get config() {
    return this.finalValues.config;
  }

  get rawConfig() {
    return this.rawValues.config;
  }
}
