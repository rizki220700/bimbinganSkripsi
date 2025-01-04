'use client'

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer'; // Jika ada footer yang sudah Anda buat
import './globals.css'; // Pastikan globals.css diimpor di sini

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

 
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="p-6">{children}</main>
        <Footer /> {/* Anda bisa menggunakan Footer jika sudah dibuat */}
      </body>
    </html>
  );
};

export default Layout;
