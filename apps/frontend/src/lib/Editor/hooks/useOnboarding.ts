import { Driver, driver, DriveStep, AllowedButtons } from 'driver.js';
import { when } from 'mobx';
import 'driver.js/dist/driver.css';
import { keys, omit } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import { editorStore } from '../Models';
const stepsWithSideeffects: (DriveStep & {
  /**
   *
   * @description Side effect to be executed when next button is clicked
   */
  sideEffect?: ({
    driverInstance,
    nextCallBack,
  }: {
    driverInstance: Driver;
    nextCallBack: () => void;
  }) => void;
  /**
   *
   * @description Side effect to be executed when previous button is clicked
   */
  undoSideEffect?: () => void;
  /**
   *
   * @returns observes changes in the editor state and returns true if step should be skipped
   */
  once?: () => boolean;
})[] = [
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
    once: () => {
      return editorStore.currentPage.isPrematureDragging;
    },
  },
  {
    element: "[data-id='0']",
    popover: {
      title: 'Drop',
      description: 'Now drop it into the canvas',
      side: 'top',
      showButtons: ['close'],
    },
    once: () => {
      return keys(editorStore.currentPage.widgets).length > 1;
    },
  },
  {
    element: "[data-id='0']",
    popover: {
      title: 'Select Widget',
      description: 'Now click on the widget you just dropped',
      showButtons: ['close'],
    },
    once: () => {
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
const steps = stepsWithSideeffects.map((step) => {
  return omit(step, ['sideEffect', 'undoSideEffect']);
});
const sideEffects = stepsWithSideeffects.map((step) => step.sideEffect);
const undoSideEffects = stepsWithSideeffects.map((step) => step.undoSideEffect);
const onceListeners = stepsWithSideeffects.map((step) => step.once);
export const useOnboarding = (enabled: boolean) => {
  const instance = useRef<Driver | null>(null);
  const lastDisposable = useRef<ReturnType<typeof when> | null>(null);

  const disposeLast = useCallback(() => {
    lastDisposable.current?.();
  }, []);
  const nextCallBack = useCallback(() => {
    const activeIndex = instance.current?.getActiveIndex();
    if (activeIndex === undefined) return;
    sideEffects[activeIndex]?.({
      driverInstance: instance.current!,
      nextCallBack,
    });
    disposeLast();
    const nextStep = activeIndex + 1;
    if (onceListeners[nextStep]) {
      when(onceListeners[nextStep], () => {
        nextCallBack();
      });
    }
    instance.current?.moveNext();
  }, [disposeLast]);
  const prevCallBack = useCallback(() => {
    const activeIndex = instance.current?.getActiveIndex();
    if (activeIndex === undefined) return;
    undoSideEffects[activeIndex]?.();
    disposeLast();
    const prevStep = activeIndex - 1;
    if (onceListeners[prevStep]) {
      when(onceListeners[prevStep], () => nextCallBack());
    }
    instance.current?.movePrevious();
  }, [disposeLast, nextCallBack]);
  useEffect(() => {
    if (!enabled || instance.current) return;
    const driverInstance = driver({
      showProgress: true,
      allowClose: true,
      animate: true,
      allowKeyboardControl: true,
      disableActiveInteraction: false,
      showButtons: [],
      onNextClick: nextCallBack,
      onPrevClick: prevCallBack,
      steps,
    });
    instance.current = driverInstance;
    instance.current?.drive();
    return () => {
      instance.current?.destroy();
    };
  }, [enabled, nextCallBack, prevCallBack]);
};
