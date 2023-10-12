import { useRef } from 'react';
import { Button } from '../Components';
import { useSetDom } from 'hooks/useSetDom';
import { WebloomComponentProps } from '.';

type WebloomButtonProps = WebloomComponentProps<typeof Button>;

const WebloomButton = (props: WebloomButtonProps) => {
    const { webloomId, ...rest } = props;
    const componentRef = useRef<HTMLButtonElement>(null);
    useSetDom(componentRef, webloomId);
    return <Button {...rest} ref={componentRef} />;
};

export { WebloomButton };
