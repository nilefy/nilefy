import {
  FormContextType,
  TitleFieldProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { Separator } from '@/components/ui/separator';

// TODO: remove this after PR https://github.com/z-grad-pr-sh/frontend/pull/90
export function TypographyH2({ title }: { title: string }) {
  return (
    <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      {title}
    </h2>
  );
}

/** The `TitleField` is the template to use to render the title of a field
 *
 * @param props - The `TitleFieldProps` for this component
 */
export default function TitleField<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({ id, title }: TitleFieldProps<T, S, F>) {
  return (
    <div id={id} className="my-1">
      <TypographyH2 title={title} />
      <Separator />
    </div>
  );
}
