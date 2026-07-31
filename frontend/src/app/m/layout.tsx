import React from 'react';
import { cookies } from 'next/headers';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'tr';

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col relative overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 w-full h-full">
            {children}
        </div>
    </div>
  );
}
