import { WebloomComponentProps } from '.';
import { Container } from './Components/Container';
type WebloomContainerProps = WebloomComponentProps<typeof Container>;
const WebloomContainer = (props: WebloomContainerProps) => {
  return <Container {...props} />;
};
export { WebloomContainer };
