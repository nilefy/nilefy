import { useWebloomSelection } from '@/lib/Editor/hooks';

export const WithSelection = <P extends { id: string }>(
  WrappedComponent: React.FC<P>,
) => {
  const SelectableComponent: React.FC<P> = (props) => {
    useWebloomSelection(props.id);
    return <WrappedComponent {...props} />;
  };
  return SelectableComponent;
};
