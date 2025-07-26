import Card from '@/components/Card';
import Typography from '@/components/Typography';
import SignupForm from '@/components/ui/auth/SignupForm';

export async function generateMetadata() {
  return {
    title: 'Sign Up',
    description: 'Sign up for a new account',
  };
}

const SignUp = () => (
  <>
    <Typography type="title" size="lg" style={{ margin: 0 }}>
      Sign Up
    </Typography>
    <Card className="bg-[#FEFEFE] p-5 shadow-none xs:pt-2 md:mt-4 md:min-w-[550px] md:bg-white md:p-11 md:shadow-card ">
      <SignupForm />
    </Card>
  </>
);

export default SignUp;
