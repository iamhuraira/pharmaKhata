import React from 'react';

import Button from './Button/Button';
import Modal from './Modal';

type IProps = {
  toggleAlert: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  onConfirm?: () => void;
  type?: 'delete';
  btn1Text?: string;
  btn2Text?: string;
};

const Alert = ({
  children,
  toggleAlert,
  isLoading = false,
  onConfirm,
  btn1Text,
  btn2Text,
}: IProps) => {
  return (
    <Modal size="xs" toggleModal={toggleAlert} className="!px-6 !py-7">
      {children}
      <div className="mt-5 flex items-center justify-end gap-3">
        <Button loading={isLoading} onClick={onConfirm}>
          {btn1Text || 'Confirm'}
        </Button>
        <Button outlined onClick={toggleAlert}>
          {btn2Text || 'Cancel'}
        </Button>
      </div>
    </Modal>
  );
};

export default Alert;
