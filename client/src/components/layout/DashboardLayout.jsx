import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Children get access to section management via cloneElement
  return (
    <div className="min-h-screen bg-surface-950">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={children?.props?.activeSection}
        onSectionChange={children?.props?.onSectionChange}
      />
      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
