import { WebloomComponentProps } from '../..';
import { Container } from '../../_Components/Container';

type WebloomContainerProps = WebloomComponentProps<typeof Container>;
const WebloomContainer = (props: WebloomContainerProps) => {
  return <Container {...props} />;
};
export { WebloomContainer };
