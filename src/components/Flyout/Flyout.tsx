import {
  ReactNode
} from 'react';
import './Flyout.css';

type FlyoutProps = {
  children: ReactNode;
  vertical?: number;
  horizontal?: number;
};

const Flyout = (props: FlyoutProps) => {
  const styles = {} as any;
  let direction = 'vertical';
  if (props.vertical) {
    styles['--flyout-vertical'] = `${props.vertical}rem`;
  }
  if (props.horizontal) {
    direction = 'horizontal';
    styles['--flyout-horizontal'] = `${props.horizontal}rem`;
  }
  return (
    <div className={`flyout flyout-${direction}`} style={styles}>
      {props.children}
    </div>
  );
};

export default Flyout;