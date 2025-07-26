import 'react-loading-skeleton/dist/skeleton.css';

import { SkeletonTheme } from 'react-loading-skeleton';

const BaseTemplate = (props: {
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <SkeletonTheme baseColor="#ECF1F4" highlightColor="#D4D4D4">
      {props.children}
    </SkeletonTheme>
  );
};

export { BaseTemplate };
