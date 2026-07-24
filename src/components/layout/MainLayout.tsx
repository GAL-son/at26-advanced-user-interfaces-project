"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import TopBarMenu from "../menu/TopBarMenu";
import DrawerMenu from "../menu/DrawerMenu";
import Footer from "./Footer";

import { Users, Calendar, ArrowLeftRight } from "lucide-react";

const navItems = [
  { label: "drivers", path: "/drivers", icon: <Users className="w-5 h-5 mr-2" /> },
  { label: "events", path: "/championships", icon: <Calendar className="w-5 h-5 mr-2" /> },
  { label: "compare", path: "/drivers/compare", icon: <ArrowLeftRight className="w-5 h-5 mr-2" /> },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-brand-navy-dark,#070b16)]"> 
      
      <div data-section="menu">
        <TopBarMenu
          navItems={navItems}
          pathname={pathname}
          onDrawerToggle={handleDrawerToggle}
        />
      </div>

      <DrawerMenu
        navItems={navItems}
        pathname={pathname}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
      />
      <main className="flex-grow w-full max-w-[1280px] mx-auto pt-0 mt-0 px-4 md:px-8 pb-8 md:pb-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}