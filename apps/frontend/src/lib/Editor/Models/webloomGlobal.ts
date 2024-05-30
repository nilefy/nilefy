import { toast } from '@/components/ui/use-toast';
import { Entity } from './entity';
import { ToastProps } from '@/components/ui/toast';
import { WorkerBroker } from './workerBroker';
import { EDITOR_CONSTANTS } from '@webloom/constants';

export type WebloomGlobalData = {
  currentUser: string;
  currentPageName: string;
};

export const WebloomGlobalsActions = {
  alert: {
    type: 'SIDE_EFFECT',
    name: 'alert',
    fn: async (
      _: WebloomGlobal,
      message: string,
      variant: ToastProps['variant'] = 'default',
    ) => {
      toast({ description: message, variant: variant });
    },
  },
};

export class WebloomGlobal extends Entity {
  constructor({
    globals,
    workerBroker,
  }: {
    globals: WebloomGlobalData;
    workerBroker: WorkerBroker;
  }) {
    super({
      id: EDITOR_CONSTANTS.GLOBALS_ID,
      rawValues: globals,
      entityType: 'globals',
      workerBroker,
      //todo add the correct public api
      publicAPI: {
        alert: {
          type: 'function',
          args: [
            {
              name: 'message',
              type: 'string',
            },
            {
              name: 'variant',
              type: '"default" | "destructive"',
              optional: true,
            },
          ],
        },
        currentUser: {
          description: 'Current user',
          type: 'static',
          typeSignature: 'string',
        },
        currentPageName: {
          description: 'Current page name',
          type: 'static',
          typeSignature: 'string',
        },
      },
      // @ts-expect-error fn is not defined in the type
      entityActionConfig: WebloomGlobalsActions,
    });
  }
}
