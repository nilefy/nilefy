import React, { ReactNode } from 'react';
import { Button, ButtonProps } from "@/components/ui/button";

interface ButtonWithIconProps extends ButtonProps {
  icon?: ReactNode;
  text: string;
}

const ButtonWithIcon: React.FC<ButtonWithIconProps> = ({ icon, text, ...props }) => {
  return (
    <Button {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </Button>
  );
};

export { ButtonWithIcon };
