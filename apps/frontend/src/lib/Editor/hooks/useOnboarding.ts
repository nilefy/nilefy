import { Driver, driver, DriveStep, Config } from 'driver.js';
import { when } from 'mobx';
import 'driver.js/dist/driver.css';
import { cloneDeep, isUndefined, keys } from 'lodash';
import { useEffect, useRef } from 'react';
import { editorStore } from '../Models';

type WebloomStep = Omit<DriveStep, 'element'> & {
  /**
   *
   * @description Side effect to be executed when next button is clicked
   */
  sideEffect?: () => void;
  /**
   *
   * @description Side effect to be executed when previous button is clicked
   */
  undoSideEffect?: () => void;
  /**
   * @description runs before oncePrev
   * @returns observes changes in the editor state and returns true if next step should be the current step
   */
  onceNext?: () => boolean;
  /**
   *
   * @returns observes changes in the editor state and returns true if previous step should be the current step
   */
  oncePrev?: () => boolean;
  element?:
    | DriveStep['element']
    | (() => Promise<DriveStep['element']> | DriveStep['element']);
};
// Groups are skipped together when the next button is clicked
type StepGroup = {
  steps: WebloomStep[];
  sideEffect?: () => void;
  undoSideEffect?: () => void;
};
type WebloomDriverConfig = Omit<
  Config,
  'steps' | 'onNextClick' | 'onPrevClick'
> & {
  steps: (WebloomStep | StepGroup)[];
};
type ProcessedStep = WebloomStep & {
  groupSideEffect?: () => void;
  groupUndoSideEffect?: () => void;
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
    disposeOnceNext: (() => void) | null;
    disposeOncePrev: (() => void) | null;
  } = {
    disposeOnceNext: null,
    disposeOncePrev: null,
  };

  const driverInstance = driver();
  const dispose = () => {
    state.disposeOnceNext && state.disposeOnceNext();
    state.disposeOncePrev && state.disposeOncePrev();
  };
  const setupStep = async (index: number) => {
    dispose();
    attachListeners(index);
    const steps = cloneDeep(stepsCopy);
    if (steps[index].element instanceof Function) {
      steps[index].element = await steps[index].element();
    }
    config.steps[index] = steps[index];
  };
  const customNextWithSideEffects: Config['onNextClick'] = async () => {
    const index = driverInstance.getActiveIndex();
    if (isUndefined(index)) return;
    let jump = 1;
    let groupSideEffect: (() => void) | undefined;
    if (config.steps[index].jumpForward) {
      jump = config.steps[index].jumpForward!;
      groupSideEffect = config.steps[index].groupSideEffect;
    }
    const newIndex = index + jump;
    const step = config.steps[index];
    if (groupSideEffect) groupSideEffect();
    else if (step.sideEffect) step.sideEffect();
    await setupStep(newIndex);
    driverInstance.moveTo(newIndex);
  };
  const customPrevWithSideEffects: Config['onPrevClick'] = async () => {
    const index = driverInstance.getActiveIndex();
    if (isUndefined(index)) return;
    let jump = -1;
    let groupUndoSideEffect: (() => void) | undefined;
    const prev = index - 1;
    const step = config.steps[prev];
    if (step.jumpBackward) {
      jump = -step.jumpBackward!;
      groupUndoSideEffect = step.groupUndoSideEffect;
    }
    const newIndex = index + jump;
    if (groupUndoSideEffect) groupUndoSideEffect();
    else if (step.undoSideEffect) step.undoSideEffect();
    await setupStep(newIndex);
    driverInstance.moveTo(newIndex);
  };
  const customNext = async () => {
    const index = driverInstance.getActiveIndex();
    if (isUndefined(index)) return;
    const newIndex = index + 1;
    await setupStep(newIndex);
    driverInstance.moveNext();
  };
  const customPrev = async () => {
    const index = driverInstance.getActiveIndex();
    if (isUndefined(index)) return;
    const newIndex = index - 1;
    await setupStep(newIndex);
    driverInstance.movePrevious();
  };
  const attachListeners = (index: number) => {
    const step = stepsCopy[index];
    if (step.onceNext) {
      state.disposeOnceNext = when(step.onceNext, () => {
        customNext();
      });
    }
    if (step.oncePrev) {
      state.disposeOncePrev = when(step.oncePrev, () => {
        //for sanity sake
        if (step.onceNext && step.onceNext()) {
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
  },
  {
    sideEffect: () => {
      editorStore.currentPage.addWidget({
        type: 'WebloomButton',
        parentId: '0',
        row: 20,
        col: 20,
      });
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
        },
        onceNext: () => {
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
        },
        onceNext: () => {
          return keys(editorStore.currentPage.widgets).length > 1;
        },
        oncePrev: () => {
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
      showButtons: ['close', 'previous'],
    },
    onceNext: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      const widget = editorStore.currentPage.getWidgetById(widgetId);
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
    });
    instance.current = driverInstance;
    instance.current?.drive();
    return () => {
      instance.current?.destroy();
    };
  }, [enabled]);
};
