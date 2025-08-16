import React from 'react';

import Typography from '@/components/Typography';
import DashboardContent from '@/components/ui/dashboard/DashboardContent';

export async function generateMetadata() {
  return {
    title: 'Dashboard',
  };
}

const Dashboard = () => {
  return (
    <>
      <div className="rounded-lg bg-gradient-to-r from-primary to-secondary px-4 py-3 text-white md:px-8 md:py-6">
        <div className="flex flex-col gap-2 text-xl md:flex-row md:items-center">
          <div className="flex items-center">
            <span className="mr-2 text-[25px]">👋🏻</span>
            <Typography type="title" size="md">
              Welcome!
            </Typography>
          </div>
          <Typography type="body" size="lg" color="#ECECEC">
            {' '}
            Your journey to success starts here.
          </Typography>
        </div>
      </div>

      <DashboardContent />
    </>
  );
};

export default Dashboard;
