// src/app/components/Header.tsx
'use client'

import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseconfig'; // Pastikan menggunakan import yang benar
import Link from 'next/link';

const Header = () => {
  const router = useRouter();
  const user = getAuth().currentUser; // Gunakan `getAuth(auth)` untuk mengambil instance auth

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out dari Firebase
      // Hapus authToken, userData, dan userProfile dari localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userProfile');
      router.push('/auth/login'); // Arahkan ke halaman login setelah logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="p-4 bg-blue-500 text-white">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">My App</div>
        <nav>
          <ul className="flex gap-4">
            <li><Link href="/">Home</Link></li>
            {!user ? (
              <>
                <li><Link href="/auth/login">Login</Link></li>
                <li><Link href="/auth/regist">Regist</Link></li>
              </>
            ) : (
              <>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
