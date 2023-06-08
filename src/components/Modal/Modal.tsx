import {
  ReactNode
} from 'react';
import './Modal.css';

type ModalProps = {
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  onClose?: () => void;
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
  function handleClose() {
    props.onClose && props.onClose();
  }
  return (
    <div className={`modal`} style={styles}>
      <div className="modal-content">
        <button className="modal-close" onClick={handleClose}>&times;</button>
        {props.children}
      </div>
    </div>
  );
};

export default Modal;