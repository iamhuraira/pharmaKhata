import type { Metadata } from 'next';
import React from 'react';

import VerifyTFAForm from '@/components/ui/auth/VerifyTFAForm';

export const metadata: Metadata = {
  title: 'Verify Two Factor Authentication',
  description: 'Verify Two Factor Authentication',
};

const VerifyTFAPage = () => {
  return (
    <>
      <VerifyTFAForm />
    </>
  );
};

export default VerifyTFAPage;
