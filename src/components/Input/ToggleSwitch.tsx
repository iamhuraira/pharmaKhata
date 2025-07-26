import React from 'react';

type ToggleSwitchProps = {
  value?: boolean;
  onToggle?: () => void;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value = false,
  onToggle,
}) => {
  return (
    <div
      className={`flex h-[24px] w-[40px] cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ${
        value ? 'bg-primary' : 'bg-gray-300'
      }`}
      onClick={onToggle}
    >
      <div
        className={` size-[16px] rounded-full bg-white shadow-md transition-transform 
        duration-300`}
        style={
          value
            ? { transform: 'translateX(16px)' }
            : { transform: 'translateX(0)' }
        }
      >
      </div>
    </div>
  );
};

export default ToggleSwitch;
