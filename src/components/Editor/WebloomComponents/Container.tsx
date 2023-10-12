import { useSetDom } from 'hooks/useSetDom';
import { WebloomComponentProps } from '.';
import { Container } from '../Components/Container';
import { useRef } from 'react';
type WebloomContainerProps = WebloomComponentProps<typeof Container>;
const WebloomContainer = (props: WebloomContainerProps) => {
    const ref = useRef<HTMLDivElement>(null);
    useSetDom(ref, props.webloomId);
    return <Container {...props} ref={ref} />;
};
export { WebloomContainer };
