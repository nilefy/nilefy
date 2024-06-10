import {
  makeObservable,
  observable,
  action,
  computed,
  comparer,
  runInAction,
  reaction,
} from 'mobx';
import { Entity } from './entity';
import { DependencyManager } from './dependencyManager';
import { EvaluationManager } from './evaluationManager';
import {
  AddEntityRequest,
  EntityConfigBody,
  InstallLibraryRequest,
  UninstallLibraryRequest,
  UpdateLibraryNameRequest,
} from './common/interface';
import { EDITOR_CONSTANTS } from '@nilefy/constants';
import { AnalysisContext } from '../evaluation/dependancyUtils';
import { MainThreadBroker } from './mainThreadBroker';
import { entries, forEach, keys, values } from 'lodash';
import { installLibrary, WebloomLibraries } from './libraries';
import { defaultLibraries, JSLibrary } from '../libraries';
import { JSLibraryI } from '@/api/JSLibraries.api';
import { TypeScriptServer } from './tsServer';

export type EntityConfig = ConstructorParameters<typeof Entity>[0];
type EntityConfigRecord = Record<string, EntityConfigBody>;

// The worker maintains its version of the state
// They are kept in sync by autorunners
// The worker is responsible for evaluation, widget events, and dependency analysis
// as usually these tend to be the most expensive operations
export class EditorState {
  widgets: Record<string, Entity> = {};
  queries: Record<string, Entity> = {};
  otherEntities: Record<string, Entity> = {};
  currentPageId: string = '';
  dependencyManager: DependencyManager;
  evaluationManager: EvaluationManager;
  mainThreadBroker: MainThreadBroker;
  /**
   * maps namespaces to exports from libraries
   */
  libraries: WebloomLibraries = { ...defaultLibraries };
  tsServer!: Promise<TypeScriptServer>;
  private disposables: (() => void)[] = [];

  constructor() {
    makeObservable(this, {
      queries: observable,
      currentPageId: observable,
      context: computed({
        keepAlive: true,
        equals: comparer.shallow,
      }),
      entities: computed,
      changePage: action,
      widgets: observable,
      addPage: action,
      addQuery: action,
      removeQuery: action,
      removePage: action,
      addWidget: action,
      cleanUp: action,
      removeWidget: action,
      init: action,
      addEntity: action,
      removeEntity: action,
      libraries: observable.ref,
      installLibrary: action,
      updateLibraryName: action,
      uninstallLibrary: action,
    });
    this.dependencyManager = new DependencyManager({ editor: this });
    this.evaluationManager = new EvaluationManager(this);
    this.mainThreadBroker = new MainThreadBroker(this);
    this.disposables.push(
      reaction(
        () => this.tsGlobalFile,
        (newContent) => {
          this.tsServer.then((ts) => ts.updateGlobalContextFile(newContent));
        },
      ),
    );
  }

  cleanUp() {
    this.widgets = {};
    this.queries = {};
    this.currentPageId = '';
    this.dependencyManager = new DependencyManager({ editor: this });
    this.evaluationManager = new EvaluationManager(this);
    this.mainThreadBroker = new MainThreadBroker(this);
    this.disposables.forEach((fn) => fn());
  }

  async init({
    currentPageId,
    queries,
    widgets,
    globals,
    libraries,
  }: {
    currentPageId: string;
    queries: Record<string, EntityConfigBody>;
    widgets: Record<string, EntityConfigBody>;
    globals: EntityConfigBody;
    libraries: JSLibraryI[];
  }) {
    this.tsServer = TypeScriptServer.getInstance();
    this.currentPageId = currentPageId;
    entries(queries).forEach(([_, query]) => {
      this.addQuery(this.normalizeEntityConfig(query));
    });
    entries(widgets).forEach(([_, widget]) => {
      this.addWidget(this.normalizeEntityConfig(widget));
    });
    this.otherEntities[EDITOR_CONSTANTS.GLOBALS_ID] = new Entity(
      this.normalizeEntityConfig(globals),
    );
    // if this takes too long, this might be a problem because the initial evaluation will be delayed
    const libs = await Promise.all(
      libraries.map((lib) => installLibrary({ url: lib.url, name: lib.id })),
    );
    runInAction(() => {
      libs.forEach((lib) => {
        this.libraries[lib.name] = lib.library;
      });
      this.dependencyManager.initAnalysis();
    });
  }

  get context() {
    const context: AnalysisContext = {};
    entries(this.entities).forEach(([id, entity]) => {
      context[id] = new Set(keys(entity.publicAPI));
    });
    return context;
  }

  get entities() {
    return {
      ...this.widgets,
      ...this.queries,
      ...this.otherEntities,
    };
  }
  get tsGlobalFile() {
    const file: string[] = [];
    values(this.entities).forEach((entity) => {
      if (entity.tsType) {
        file.push(entity.tsType);
      }
    });
    return file.join('\n');
  }
  getEntityById(id: string) {
    return this.widgets[id] || this.queries[id] || this.otherEntities[id];
  }

  addPage({ widgets }: { widgets: EntityConfigRecord }) {
    this.widgets = {};
    Object.entries(widgets).forEach(([id, widget]) => {
      this.widgets[id] = new Entity(this.normalizeEntityConfig(widget));
    });
  }

  addWidget(config: EntityConfig) {
    if (!this.widgets) return;
    if (
      config.id === EDITOR_CONSTANTS.ROOT_NODE_ID ||
      config.id === EDITOR_CONSTANTS.PREVIEW_NODE_ID
    )
      return;
    this.widgets[config.id] ||= new Entity(config);
  }

  addQuery(config: EntityConfig) {
    this.queries[config.id] = new Entity(config);
  }
  addOtherEntity(config: EntityConfig) {
    this.otherEntities[config.id] = new Entity(config);
  }
  removeWidget(id: string) {
    delete this.widgets[id];
  }
  removeQuery(id: string) {
    delete this.queries[id];
  }
  removePage(id: string) {
    delete this.widgets[id];
  }
  removeEntity(id: string) {
    const entity = this.getEntityById(id);
    entity.dispose();
    if (this.widgets[id]) {
      this.removeWidget(id);
    } else {
      this.removeQuery(id);
    }
  }
  addEntity(body: AddEntityRequest['body']) {
    switch (body.entityType) {
      case 'query':
      case 'jsQuery':
        this.addQuery(this.normalizeEntityConfig(body.config));
        break;
      case 'widget':
        this.addWidget(this.normalizeEntityConfig(body.config));
        break;
      default:
        this.addOtherEntity(this.normalizeEntityConfig(body.config));
        break;
    }
  }
  normalizeEntityConfig(config: EntityConfigBody) {
    return {
      ...config,
      dependencyManager: this.dependencyManager,
      mainThreadBroker: this.mainThreadBroker,
      editorState: this,
    };
  }
  changePage(widgets: EntityConfigRecord) {
    forEach(this.widgets, (widget) => widget.dispose());
    this.widgets = {};
    Object.entries(widgets).forEach(([id, widget]) => {
      this.widgets[id] = new Entity(this.normalizeEntityConfig(widget));
    });
  }
  updateLibraryName(body: UpdateLibraryNameRequest['body']) {
    const lib = this.libraries[body.id];
    delete this.libraries[body.id];
    this.libraries[body.newName] = lib;
    const newLibs = { ...this.libraries };
    this.libraries = newLibs;
  }
  uninstallLibrary(body: UninstallLibraryRequest['body']) {
    delete this.libraries[body.id];
    this.libraries = { ...this.libraries };
  }
  async installLibrary(
    body: InstallLibraryRequest['body'],
  ): Promise<JSLibrary> {
    const lib = await installLibrary(body);
    runInAction(() => {
      this.libraries[lib.name] = lib.library;
      this.libraries = { ...this.libraries };
    });
    return {
      availabeAs: lib.name,
      isDefault: false,
      name: lib.name,
      url: body.url,
    };
  }
}
