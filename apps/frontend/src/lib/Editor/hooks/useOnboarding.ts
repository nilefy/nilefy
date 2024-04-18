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
type WebloomDriverConfig = Omit<
  Config,
  'steps' | 'onNextClick' | 'onPrevClick'
> & {
  steps: WebloomStep[];
};

const webloomDriver = (config: WebloomDriverConfig) => {
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
    await processStep(index);
  };
  const processStep = async (index: number) => {
    const steps = cloneDeep(stepsCopy);
    if (steps[index].element instanceof Function) {
      steps[index].element = await steps[index].element();
    }
    config.steps[index] = steps[index];
  };
  const customNextWithSideEffects: Config['onNextClick'] = async () => {
    const index = driverInstance.getActiveIndex();
    if (isUndefined(index)) return;
    const newIndex = index + 1;
    const step = config.steps[index];
    step.sideEffect && step.sideEffect();
    await setupStep(newIndex);
    driverInstance.moveNext();
  };
  const customPrevWithSideEffects: Config['onPrevClick'] = async () => {
    const index = driverInstance.getActiveIndex();
    if (isUndefined(index)) return;
    const newIndex = index - 1;
    const step = config.steps[index];
    step.undoSideEffect && step.undoSideEffect();
    await setupStep(newIndex);
    driverInstance.movePrevious();
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
    const step = config.steps[index];
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

const steps: WebloomStep[] = [
  {
    popover: {
      title: 'Welcome to Nilefy',
      description:
        'This is an onboarding tour to help you get started, you can skip this tour at any time',
      showButtons: ['next', 'close'],
    },
  },
  {
    element: '#right-sidebar',
    popover: {
      title: 'Right Sidebar',
      description:
        'This is the widgets panels where you can drag and drop widgets to the canvas',
    },
  },
  {
    element: '#new-WebloomButton-widget',
    popover: {
      title: 'Drag',
      description: 'try dragging this widget',
      showButtons: ['previous', 'close'],
    },
    sideEffect() {},
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
      showButtons: ['close'],
    },
    onceNext: () => {
      return keys(editorStore.currentPage.widgets).length > 1;
    },
    oncePrev: () => {
      return !editorStore.currentPage.isPrematureDragging;
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
      title: 'Select Widget',
      description: 'Now click on the widget you just dropped',
      showButtons: ['close'],
    },
    onceNext: () => {
      const widgetId = editorStore.currentPage.getWidgetById('0').nodes[0];
      const widget = editorStore.currentPage.getWidgetById(widgetId);
      return widget.isTheOnlySelected;
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
