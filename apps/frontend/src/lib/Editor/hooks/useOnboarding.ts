import { Driver, driver, DriveStep, Config } from 'driver.js';
import { when } from 'mobx';
import 'driver.js/dist/driver.css';
import { cloneDeep, isUndefined, keys } from 'lodash';
import { useEffect, useRef } from 'react';
import { editorStore } from '../Models';
import { commandManager } from '@/actions/CommandManager';
import DragAction from '@/actions/editor/Drag';

const asyncQuerySelector = async (
  selector: string,
  interval: number = 20,
  retries: number = 15,
) => {
  let i = 0;
  while (i < retries) {
    const element = document.querySelector(selector);
    if (element) return element;
    await new Promise((resolve) => setTimeout(resolve, interval));
    i++;
  }
  return null;
};

type SideEffect = () => Promise<void> | void;
type WebloomStep = Omit<DriveStep, 'element'> & {
  /**
   *
   * @description Side effect to be executed when next button is clicked
   */
  sideEffect?: SideEffect;
  /**
   *
   * @description Side effect to be executed when previous button is clicked, Ideally every effect should have a corresponding undo effect.
   */
  undoSideEffect?: SideEffect;
  /**
   * @returns observes changes in the editor state and returns true if next step should be the current step
   */
  moveToNextWhen?: () => boolean;
  /**
   *
   * @returns observes changes in the editor state and returns true if previous step should be the current step
   */
  moveToPrevWhen?: () => boolean;
  /**
   * @description if set to true, the active interaction will be disabled
   */
  disableActiveInteraction?: boolean;
  element?:
    | DriveStep['element']
    | (() => Promise<DriveStep['element']> | DriveStep['element']);
};
// Groups are skipped together when the next button is clicked
type StepGroup = {
  steps: WebloomStep[];
  sideEffect?: SideEffect;
  undoSideEffect?: SideEffect;
};
type WebloomDriverConfig = Omit<
  Config,
  'steps' | 'onNextClick' | 'onPrevClick'
> & {
  steps: (WebloomStep | StepGroup)[];
};
type ProcessedStep = WebloomStep & {
  groupSideEffect?: SideEffect;
  groupUndoSideEffect?: SideEffect;
  jumpForward?: number;
  jumpBackward?: number;
};
const webloomDriver = (_config: WebloomDriverConfig) => {
  const config: Omit<WebloomDriverConfig, 'steps'> & {
    steps: ProcessedStep[];
  } = {
    ..._config,
    steps: _config.steps.flatMap((step) => {
      if ('steps' in step) {
        return step.steps.map((s, i) => ({
          ...s,
          groupSideEffect: step.sideEffect,
          groupUndoSideEffect: step.undoSideEffect,
          jumpForward: step.steps.length - i,
          jumpBackward: i + 1,
        }));
      }
      return step;
    }),
  };
  const stepsCopy = cloneDeep(config.steps);
  const state: {
    disposeMoveNextWhen: (() => void) | null;
    disposeMovePrevWhen: (() => void) | null;
  } = {
    disposeMoveNextWhen: null,
    disposeMovePrevWhen: null,
  };

  const driverInstance = driver();
  const dispose = () => {
    state.disposeMoveNextWhen && state.disposeMoveNextWhen();
    state.disposeMovePrevWhen && state.disposeMovePrevWhen();
  };

  const setupStep = async (index: number) => {
    attachListeners(index);
    const steps = cloneDeep(stepsCopy);
    if (steps[index].element instanceof Function) {
      steps[index].element = await steps[index].element();
    }
    config.steps[index] = steps[index];
  };
  const setDisableActiveInteraction = (index: number) => {
    // When this function is called it's either a string or an element never a function
    const element = config.steps[index].element as DriveStep['element'];
    const stepDisableActiveInteraction =
      config.steps[index].disableActiveInteraction;
    const elemObj =
      typeof element === 'string' ? document.querySelector(element) : element;
    if (isUndefined(elemObj)) return;
    if (stepDisableActiveInteraction === true) {
      // https://github.com/kamranahmedse/driver.js/blob/master/src/highlight.ts#L162
      elemObj?.classList.add('driver-no-interaction');
    }
  };
  const customNextWithSideEffects: Config['onNextClick'] = async () => {
    dispose();
    const index = driverInstance.getActiveIndex();
    if (isUndefined(index)) return;
    let jump = 1;
    let groupSideEffect: SideEffect | undefined;
    if (config.steps[index].jumpForward) {
      jump = config.steps[index].jumpForward!;
      groupSideEffect = config.steps[index].groupSideEffect;
    }
    const newIndex = index + jump;
    const step = config.steps[index];
    if (groupSideEffect) await groupSideEffect();
    else if (step.sideEffect) await step.sideEffect();
    await setupStep(newIndex);
    driverInstance.moveTo(newIndex);
    setDisableActiveInteraction(newIndex);
  };
  const customPrevWithSideEffects: Config['onPrevClick'] = async () => {
    dispose();
    const index = driverInstance.getActiveIndex();
    if (isUndefined(index)) return;
    let jump = -1;
    let groupUndoSideEffect: SideEffect | undefined;
    const prev = index - 1;
    const step = config.steps[prev];
    if (step.jumpBackward) {
      jump = -step.jumpBackward!;
      groupUndoSideEffect = step.groupUndoSideEffect;
    }
    const newIndex = index + jump;
    if (groupUndoSideEffect) await groupUndoSideEffect();
    else if (step.undoSideEffect) await step.undoSideEffect();
    await setupStep(newIndex);
    driverInstance.moveTo(newIndex);
    setDisableActiveInteraction(newIndex);
  };
  const customNext = async () => {
    dispose();
    const index = driverInstance.getActiveIndex();
    if (isUndefined(index)) return;
    const newIndex = index + 1;
    await setupStep(newIndex);
    driverInstance.moveNext();
    setDisableActiveInteraction(newIndex);
  };
  const customPrev = async () => {
    dispose();
    const index = driverInstance.getActiveIndex();
    if (isUndefined(index)) return;
    const newIndex = index - 1;
    await setupStep(newIndex);
    driverInstance.movePrevious();
    setDisableActiveInteraction(newIndex);
  };
  const attachListeners = (index: number) => {
    const step = stepsCopy[index];
    if (step.moveToNextWhen) {
      state.disposeMoveNextWhen = when(step.moveToNextWhen, () => {
        customNext();
      });
    }
    if (step.moveToPrevWhen) {
      state.disposeMovePrevWhen = when(step.moveToPrevWhen, () => {
        //for sanity sake
        if (step.moveToNextWhen && step.moveToNextWhen()) {
          return customNext();
        }
        customPrev();
      });
    }
  };
  driverInstance.setConfig({
    ...config,
    steps: config.steps as DriveStep[],
    onNextClick: customNextWithSideEffects,
    onPrevClick: customPrevWithSideEffects,
    onDestroyed: (...args) => {
      config.onDestroyed && config.onDestroyed(...args);
      dispose();
    },
  });
  return driverInstance;
};

const steps: (WebloomStep | StepGroup)[] = [
  {
    popover: {
      title: 'Welcome to Nilefy',
      description:
        'This is an onboarding tour to help you get started, you can skip this tour at any time',
      showButtons: ['next', 'close'],
    },
  },
  //todo ensure that the insert tab is selected
  {
    element: '#right-sidebar',
    popover: {
      title: 'Right Sidebar',
      description:
        'This is the widgets panels where you can drag and drop widgets to the canvas',
    },
    disableActiveInteraction: true,
  },
  {
    sideEffect: () => {
      commandManager.executeCommand(
        new DragAction({
          parentId: '0',
          draggedItem: {
            isNew: true,
            type: 'WebloomButton',
          },
          endPosition: {
            col: 15,
            row: 30,
          },
        }),
      );
    },
    undoSideEffect: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      editorStore.currentPage.removeWidget(widgetId);
    },
    steps: [
      {
        element: '#new-WebloomButton-widget',
        popover: {
          title: 'Drag',
          description: 'try dragging this widget',
          showButtons: ['previous', 'close', 'next'],
          nextBtnText: 'Skip',
        },
        moveToNextWhen: () => {
          return editorStore.currentPage.isPrematureDragging;
        },
      },
      {
        element: () => editorStore.currentPage.rootWidget.dom!,
        popover: {
          title: 'Drop',
          description: 'Now drop it into the canvas',
          side: 'top',
          showButtons: ['close', 'next'],
          nextBtnText: 'Skip',
        },
        moveToNextWhen: () => {
          return keys(editorStore.currentPage.widgets).length > 1;
        },
        moveToPrevWhen: () => {
          return !editorStore.currentPage.isPrematureDragging;
        },
        undoSideEffect: () => {
          const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
          editorStore.currentPage.removeWidget(widgetId);
        },
      },
    ],
  },
  {
    element: async () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      const widget = editorStore.currentPage.getWidgetById(widgetId);
      await when(() => widget.dom !== null);
      return widget.dom!;
    },
    popover: {
      title: 'Select Widget',
      description: 'Now click on the widget you just dropped',
      showButtons: ['close', 'previous', 'next'],
      nextBtnText: 'Skip',
    },
    sideEffect: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      editorStore.currentPage.setSelectedNodeIds(new Set([widgetId]));
    },
    moveToNextWhen: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      const widget = editorStore.currentPage.getWidgetById(widgetId);
      if (!widget) return false;
      return widget.isTheOnlySelected;
    },
    undoSideEffect: () => {
      editorStore.currentPage.clearSelectedNodes();
    },
  },
  {
    element: '#right-sidebar',
    popover: {
      title: 'Inspecting widgets',
      description:
        'You can inspect and edit the properties of the selected widget here',
    },
    disableActiveInteraction: true,
  },
  {
    element: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      return document.querySelector(`#${widgetId}-text`)!;
    },
    popover: {
      title: 'Bindings 1/2',
      description: `Binding are pieces of code that are surrounded by double curly braces, they are used to bind data to the widget`,
    },
  },
  {
    element: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      return document.querySelector(`#${widgetId}-text`)!;
    },
    popover: {
      title: 'Bindings 2/2',
      description: `Try writing {{'Hello World'}}`,
      nextBtnText: 'Skip',
    },
    moveToNextWhen: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      const widget = editorStore.currentPage.getWidgetById(widgetId);
      const text = widget.rawValues.text as string;
      return (
        text.trim() === "{{'Hello World'}}" ||
        text.trim() === '{{"Hello World"}}'
      );
    },
    sideEffect: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      const widget = editorStore.currentPage.getWidgetById(widgetId);
      widget.setValue('text', '{{"Hello World"}}');
    },
    undoSideEffect: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      const widget = editorStore.currentPage.getWidgetById(widgetId);
      widget.setValue('text', 'Button');
    },
  },
  {
    element: async () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      const widget = editorStore.currentPage.getWidgetById(widgetId);
      await when(() => widget.dom !== null);
      return widget.dom!;
    },
    popover: {
      title: 'Binding 3/3',
      description: `You can see the code you wrote has been automatically evaluated and rendered`,
    },
    disableActiveInteraction: true,
  },
  {
    element: '#bottom-panel',
    popover: {
      title: 'Datasources and Queries 1/6',
      description: `You can add datasources and queries here, Datasources are like blueprint for queries, Nilefy
      has many built-in datasources, you can also create your own. Queries are used to fetch data from datasources`,
    },
    disableActiveInteraction: true,
  },
  {
    element: '#add-new-query-trigger',
    popover: {
      title: 'Datasources and Queries 2/6',
      description: `Click here to add a new query`,
    },
    sideEffect: () => {
      editorStore.setQueryPanelAddMenuOpen(true);
    },
    undoSideEffect: () => {
      editorStore.setQueryPanelAddMenuOpen(false);
    },
    moveToNextWhen: () => {
      return editorStore.queryPanel.addMenuOpen;
    },
  },
  {
    element: '#add-new-js-query',
    popover: {
      title: 'Datasources and Queries 3/6',
      description: `Select new JS Query`,
      nextBtnText: 'Skip',
    },
    sideEffect: async () => {
      await editorStore.queriesManager.addJSquery.mutateAsync({
        dto: {
          settings: {},
          query: '',
        },
      });
      await asyncQuerySelector('#query-form');
      editorStore.setQueryPanelAddMenuOpen(false);
    },
    undoSideEffect: async () => {
      await editorStore.queriesManager.deleteJSquery.mutateAsync({
        queryId: keys(editorStore.queries)[0],
      });
      editorStore.setQueryPanelAddMenuOpen(true);
    },
    moveToNextWhen: () => {
      return keys(editorStore.queries).length > 0;
    },
    moveToPrevWhen: () => {
      return (
        keys(editorStore.queries).length !== 0 &&
        !editorStore.queryPanel.addMenuOpen
      );
    },
  },
  {
    element: async () => {
      return (await asyncQuerySelector('#query-form'))!;
    },
    popover: {
      title: 'Datasources and Queries 4/6',
      description: `You just made your first query, JS queries are used to return data and/or perform side effects`,
    },
  },
  {
    element: () => {
      const id = keys(editorStore.queries)[0];
      return document.querySelector(`${id}-query`)!;
    },
    popover: {
      title: 'Datasources and Queries 5/6',
      description: `You can write your query here, let's show you a simple query`,
    },
    disableActiveInteraction: true,
  },
];

export const useOnboarding = (enabled: boolean) => {
  const instance = useRef<Driver | null>(null);
  useEffect(() => {
    if (!enabled || instance.current) return;
    const driverInstance = webloomDriver({
      showProgress: true,
      allowClose: true,
      animate: true,
      allowKeyboardControl: true,
      disableActiveInteraction: false,
      showButtons: [],
      steps,
      onDestroyed: () => {
        // todo communicate with the backend to mark the onboarding as completed
      },
      onDestroyStarted: () => {
        if (
          driverInstance.hasNextStep() &&
          confirm('Are you sure you want to skip the onboarding tour?')
        ) {
          driverInstance.destroy();
        }
      },
    });
    instance.current = driverInstance;
    instance.current?.drive();
    return () => {
      instance.current?.destroy();
    };
  }, [enabled]);
};
