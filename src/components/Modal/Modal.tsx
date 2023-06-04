import {
  ReactNode
} from 'react';
import './Modal.css';

type ModalProps = {
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
};

const Modal = (props: ModalProps) => {
  const styles = {} as any;
  if (props.size && props.size === 'large') {
    styles['--modal-width'] = `80%`;
  } else if (props.size && props.size === 'small') {
    styles['--modal-width'] = `40%`;
  } else {
    styles['--modal-width'] = `60%`;
  }
  return (
    <div className={`modal`} style={styles}>
      {props.children}
    </div>
  );
};

export default Modal;