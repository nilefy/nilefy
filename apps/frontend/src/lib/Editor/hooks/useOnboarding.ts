import { Driver, driver, DriveStep, Config } from 'driver.js';
import { when } from 'mobx';
import 'driver.js/dist/driver.css';
import { cloneDeep, isUndefined, keys } from 'lodash';
import { useEffect, useRef } from 'react';
import { editorStore } from '../Models';
import { commandManager } from '@/actions/CommandManager';
import DragAction from '@/actions/editor/Drag';
import { updateOnBoardingStatus } from '@/api/users.api';

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

type WebloomStep = Omit<DriveStep, 'element' | 'popover'> & {
  popover?: Omit<NonNullable<DriveStep['popover']>, 'description'> & {
    description: string | (() => string);
  };
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
//todo fix library's highlight not scrolling to the element issue
// maybe monkey patch the library
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
  const isLastStep = (index: number) => {
    return index === stepsCopy.length - 1;
  };
  const onLastStep = () => {
    driverInstance.destroy();
  };
  const setupStep = async (index: number) => {
    attachListeners(index);
    const steps = cloneDeep(stepsCopy);
    if (steps[index].element instanceof Function) {
      steps[index].element = await steps[index].element();
    }
    if (steps[index]?.popover?.description instanceof Function) {
      steps[index].popover.description = steps[index].popover.description();
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
    if (isLastStep(index)) return onLastStep();
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
    if (isLastStep(index)) return onLastStep();
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
      description: `
        This is an interactive onboarding tour to help you get started with Nilefy. You can skip this tour by clicking the close button. Additionally, you can skip individual steps by clicking the skip button or navigate using the keyboard arrow keys.
        `,
      showButtons: ['next', 'close'],
    },
  },
  //todo ensure that the insert tab is selected
  {
    element: '#right-sidebar',
    popover: {
      title: 'Inserting Widgets',
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
      title: 'Datasources and Queries 1/10',
      description: `You can add datasources and queries here, Datasources are like blueprint for queries, Nilefy
      has many built-in datasources, you can also create your own. Queries are used to fetch data from datasources`,
    },
    disableActiveInteraction: true,
  },
  {
    element: '#add-new-query-trigger',
    popover: {
      title: 'Datasources and Queries 2/10',
      description: `Click here to add a new query`,
      nextBtnText: 'Skip',
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
      title: 'Datasources and Queries 3/10',
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
      title: 'Datasources and Queries 4/10',
      description: `You just made your first query, JS queries are used to return data and/or perform side effects`,
    },
  },
  {
    element: () => {
      const id = keys(editorStore.queries)[0];
      return document.querySelector(`#${id}-query`)!;
    },
    popover: {
      title: 'Datasources and Queries 5/10',
      description: `You can write your query here, let's show you a simple query`,
    },
    sideEffect: () => {
      const id = keys(editorStore.queries)[0];
      const code = `// You can call actions on other entities, we're calling the alert action on the WebloomGlobals entity
      WebloomGlobals.alert("fetching data");
      const res = await fetch('https://jsonplaceholder.typicode.com/todos');
      const json = await res.json();
      WebloomGlobals.alert("data fetched");
      // You can return the data you fetched to use in other entities
      return json.slice(0, 2);
      `;
      const query = editorStore.queries[id];
      query.setValue('query', code);
    },
    undoSideEffect: () => {
      const id = keys(editorStore.queries)[0];
      const query = editorStore.queries[id];
      query.setValue('query', '');
    },
    disableActiveInteraction: true,
  },
  {
    element: '#run-query-button',
    popover: {
      title: 'Datasources and Queries 6/10',
      description: `Click the run button to execute the query`,
      nextBtnText: 'Skip',
    },
    sideEffect: async () => {
      const id = keys(editorStore.queries)[0];
      await editorStore.queries[id].run();
    },
    undoSideEffect: () => {
      const id = keys(editorStore.queries)[0];
      editorStore.queries[id].reset();
    },
    moveToNextWhen: () => {
      const id = keys(editorStore.queries)[0];
      const query = editorStore.queries[id];
      return query.getValue('data') !== undefined;
    },
  },
  {
    element: '#query-preview-json',
    popover: {
      title: 'Datasources and Queries 6/10',
      description: `You can see the data returned by the query here`,
    },
    disableActiveInteraction: true,
  },
  {
    popover: {
      title: 'Datasources and Queries 7/10',
      description: `You can use the data returned by the query in your widgets by binding it to the widget, we'll create a table widget for you
        so you can see how it's done`,
    },
    sideEffect: () => {
      commandManager.executeCommand(
        new DragAction({
          parentId: '0',
          draggedItem: {
            isNew: true,
            type: 'Table',
          },
          endPosition: {
            col: 6,
            row: 60,
          },
        }),
      );
    },
    undoSideEffect: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[1];
      editorStore.currentPage.removeWidget(widgetId);
    },
  },
  {
    element: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[1];
      return editorStore.currentPage.getWidgetById(widgetId).dom!;
    },
    popover: {
      title: 'Datasources and Queries 8/10',
      description: "This is the table widget, currently it's empty",
    },
    disableActiveInteraction: true,
    sideEffect: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[1];
      editorStore.currentPage.setSelectedNodeIds(new Set([widgetId]));
    },
    undoSideEffect: () => {
      editorStore.currentPage.clearSelectedNodes();
    },
  },
  {
    element: async () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[1];
      return (await asyncQuerySelector(`#${widgetId}-data`))!;
    },
    popover: {
      title: 'Datasources and Queries 9/10',
      description: () =>
        `Now bind the data returned by the query to the table widget, write {{${
          keys(editorStore.queries)[0]
        }.data}}`,
      nextBtnText: 'Skip',
    },
    sideEffect: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[1];
      const widget = editorStore.currentPage.getWidgetById(widgetId);
      widget.setValue('data', `{{${keys(editorStore.queries)[0]}.data}}`);
    },
    undoSideEffect: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[1];
      const widget = editorStore.currentPage.getWidgetById(widgetId);
      widget.setValue('data', '');
    },
    moveToNextWhen: () => {
      const tableId = editorStore.currentPage.getWidgetById('0').nodes[1];
      const table = editorStore.currentPage.getWidgetById(tableId);
      return (
        (table.rawValues.data as string).trim() ===
        `{{${keys(editorStore.queries)[0]}.data}}`
      );
    },
    disableActiveInteraction: false,
  },
  {
    element: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[1];
      return editorStore.currentPage.getWidgetById(widgetId).dom!;
    },
    popover: {
      title: 'Datasources and Queries 10/10',
      description: `You can see the data has been automatically rendered`,
    },
    disableActiveInteraction: true,
  },
  {
    element: document.body,
    popover: {
      title: 'Congratulations',
      align: 'center',
      side: 'over',
      description: `You've completed the onboarding tour, you can always revisit this tour by clicking the help button in the top right corner`,
      showButtons: ['close'],
    },
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
        updateOnBoardingStatus({ onboardingCompleted: true });
      },
      onDestroyStarted: () => {
        if (
          driverInstance.hasNextStep() &&
          confirm('Are you sure you want to skip the onboarding tour?')
        ) {
          driverInstance.destroy();
        } else if (!driverInstance.hasNextStep()) {
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
