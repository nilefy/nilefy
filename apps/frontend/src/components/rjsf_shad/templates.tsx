import ObjectFieldTemplate from './objectFieldTemplate';
import FieldTemplate from './fieldTemplate';
import WrapIfAdditionalTemplate from './wrapIfAdditionalTemplate';
import ArrayFieldItemTemplate from './arrayFieldItemTemplate';
import ArrayFieldTemplate from './arrayFieldTemplate';
import FieldErrorTemplate from './fieldErrorTemplate';
import FieldHelpTemplate from './fieldHelpTemplate';
import DescriptionField from './descriptionField';
import {
  CopyButton,
  MoveDownButton,
  MoveUpButton,
  RemoveButton,
  SubmitButton,
  AddButton,
} from './buttons';
import BaseInputTemplate from './input';
import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  TemplatesType,
} from '@rjsf/utils';
import TitleField from './titleField';

export function generateTemplates<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(): Partial<TemplatesType<T, S, F>> {
  return {
    BaseInputTemplate,
    ButtonTemplates: {
      CopyButton,
      AddButton,
      MoveDownButton,
      MoveUpButton,
      RemoveButton,
      SubmitButton,
    },
    TitleFieldTemplate: TitleField,
    FieldHelpTemplate,
    FieldErrorTemplate,
    ArrayFieldItemTemplate,
    ArrayFieldTemplate,
    DescriptionFieldTemplate: DescriptionField,
    WrapIfAdditionalTemplate,
    FieldTemplate,
    ObjectFieldTemplate,
  };
}

export default generateTemplates();
