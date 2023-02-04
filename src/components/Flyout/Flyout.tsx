import {
  ReactNode
} from 'react';
import './Flyout.css';

type FlyoutProps = {
  children: ReactNode;
};

const Flyout = (props: FlyoutProps) => {
  return (
    <div className="flyout">
      {props.children}
    </div>
  );
};

export default Flyout;