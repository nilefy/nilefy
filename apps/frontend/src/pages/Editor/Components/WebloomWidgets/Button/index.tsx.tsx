import { WebloomComponentProps } from '../..';
import { Button } from '../../_Components';

type WebloomButtonProps = WebloomComponentProps<typeof Button>;

const WebloomButton = (props: WebloomButtonProps) => {
  return <Button {...props} />;
};

export { WebloomButton };
