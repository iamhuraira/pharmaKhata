import type { Metadata } from 'next';

import Card from '@/components/Card';
import Typography from '@/components/Typography';
import SiginForm from '@/components/ui/auth/SiginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
};

const Signin = () => {
  return (
    <>
      <Typography type="title" size="lg" style={{ margin: 0 }}>
        Sign In
      </Typography>
      <Card className="bg-[#FEFEFE]  shadow-none xs:pt-2 md:mt-4 md:min-w-[550px] md:bg-white md:p-11 md:shadow-card ">
        <SiginForm />
      </Card>
    </>
  );
};

export default Signin;
