import { Button } from './Components';
import { WebloomComponentProps } from '.';

type WebloomButtonProps = WebloomComponentProps<typeof Button>;

const WebloomButton = (props: WebloomButtonProps) => {
  return <Button {...props} />;
};

export { WebloomButton };
