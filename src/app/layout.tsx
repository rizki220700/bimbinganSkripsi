// src/app/layout.tsx
'use client'

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();

  // Periksa apakah halaman saat ini adalah login
  const isLoginPage = pathname === '/auth/login' || pathname === '/auth/regist'; // Sesuaikan dengan path halaman login Anda

  return (
    <html lang="en">
      <body>
        {!isLoginPage && (
          <nav className="p-4 bg-blue-500 text-white">
            <ul className="flex gap-4">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/auth/login">Login</Link></li>
              <li><Link href="/auth/regist">Regist</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </nav>
        )}
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
};

export default Layout;
