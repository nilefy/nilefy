import { Button } from '../ui/button';
import {
  FormContextType,
  getSubmitButtonOptions,
  RJSFSchema,
  StrictRJSFSchema,
  SubmitButtonProps,
  TranslatableString,
  IconButtonProps,
} from '@rjsf/utils';

import {
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CopyIcon,
  DeleteIcon,
} from 'lucide-react';

export function SubmitButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ uiSchema, registry }: SubmitButtonProps<T, S, F>) {
  const {
    submitText,
    norender,
    props: submitButtonProps,
  } = getSubmitButtonOptions(uiSchema);
  const { isSubmitting } = registry.formContext as { isSubmitting?: boolean };
  if (norender) {
    return null;
  }

  return (
    <Button
      disabled={isSubmitting ?? false}
      type="submit"
      variant="default"
      {...submitButtonProps}
    >
      {isSubmitting ? 'loading....' : submitText}
    </Button>
  );
}

export function CopyButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: IconButtonProps<T, S, F>) {
  const {
    registry: { translateString },
    uiSchema,
    ...rest
  } = props;
  return (
    <Button {...rest} size={'icon'} variant={'outline'}>
      <CopyIcon />
    </Button>
  );
}

export function MoveDownButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: IconButtonProps<T, S, F>) {
  const {
    registry: { translateString },
    uiSchema,
    ...rest
  } = props;
  return (
    <Button {...rest} size={'icon'} variant={'outline'}>
      <ArrowDownIcon />
    </Button>
  );
}

export function MoveUpButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: IconButtonProps<T, S, F>) {
  const {
    registry: { translateString },
    uiSchema,
    ...rest
  } = props;
  return (
    <Button {...rest} size={'icon'} variant={'destructive'}>
      <ArrowUpIcon />
    </Button>
  );
}

export function RemoveButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: IconButtonProps<T, S, F>) {
  const {
    registry: { translateString },
    uiSchema,
    ...rest
  } = props;
  return (
    <Button {...rest} size={'icon'} variant={'destructive'}>
      <DeleteIcon />
    </Button>
  );
}

export function AddButton<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ uiSchema, registry, ...props }: IconButtonProps<T, S, F>) {
  const { translateString } = registry;
  return (
    <Button {...props} variant={'default'}>
      {translateString(TranslatableString.AddItemButton)} <PlusIcon />
    </Button>
  );
}
