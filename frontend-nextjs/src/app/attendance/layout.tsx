'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Live View',
      href: '/attendance',
      icon: 'videocam',
    },
    {
      label: 'Face Registration',
      href: '/attendance/register',
      icon: 'person_add',
    },
    {
      label: 'Attendance History',
      href: '/attendance/history',
      icon: 'history',
    },
    {
      label: 'Settings',
      href: '#',
      icon: 'settings',
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-outline-variant shadow-sm z-50 flex flex-col p-lg">
        <div className="mb-xl">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Smart Vision</h1>
          <p className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase font-semibold">
            Face Attendance System
          </p>
        </div>

        <nav className="flex-1 space-y-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-md rounded-lg px-md py-sm transition-all duration-200 ease-in-out active:scale-95 ${
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-medium'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>
                  {item.icon}
                </span>
                <span className="font-body-md text-body-md">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Section at bottom */}
        <div className="mt-auto pt-lg border-t border-outline-variant flex items-center gap-md">
          <img
            alt="Admin User Profile"
            className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuART2EHoa25pjFMIFEOlRJAI4Mxonp7QAV1iQsi3nbDKyCAtMe4n-JacW3lWkKEXsuWyudNWOJ6_LiUXFxl3-XZaHVTesChzy8eHVFjDG_-dx78-AqtTwFIAjgE48HwrJbQa46VdfSXTnS4_Hd26pVU3Wm-9dx0Tc9dKjbLbjVfsD4wU_NCCmyurvXk5yrZqhkzxyiv10B146UFqWTvj77f9EdofOv3ZUdms6FWCV7vfpSMWNaILOyV6N81qFzSxobvt1xGnmIAKnI"
          />
          <div className="overflow-hidden">
            <p className="font-body-md text-body-md font-bold truncate text-on-surface">Administrator</p>
            <p className="font-label-caps text-[10px] text-on-surface-variant truncate font-semibold">
              System Overlord
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-[280px] flex-1 flex flex-col h-full bg-background overflow-hidden">
        {children}
      </div>
    </div>
  );
}
