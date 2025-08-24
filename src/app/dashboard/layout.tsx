import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <BaseTemplate>
      <div className=" flex max-h-screen w-full !overflow-hidden bg-lightBg ">
        <Sidebar />

        <div className="max-h-full w-full overflow-auto">
          <Header />

          <main className="mx-3 md:mx-5">{props.children}</main>
        </div>
      </div>
    </BaseTemplate>
  );
}

export const dynamic = 'force-dynamic';
