'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebaseconfig';
import Link from 'next/link';
import { FaSignInAlt, FaUser, FaSignOutAlt, FaRegUser } from 'react-icons/fa';

const Header = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Memantau perubahan status login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Mengupdate status user jika login/logout
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userProfile');
      router.push('/auth/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="p-4 bg-blue-600 text-white">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold flex items-center">
          <span>Bimbingan-Online-App</span>
        </div>

        <div className="hidden md:flex space-x-6">
          <nav>
            <ul className="flex gap-6">
              {!user ? (
                <>
                  <li><Link href="/auth/login" className="hover:text-gray-300"><FaSignInAlt /> Login</Link></li>
                  <li><Link href="/auth/regist" className="hover:text-gray-300"><FaRegUser /> Regist</Link></li>
                </>
              ) : (
                <>
           
                  <li>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      <FaSignOutAlt /> Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white">
          <FaUser className="text-2xl" />
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-700 text-white mt-4 p-4 rounded">
          <nav>
            <ul className="flex flex-col gap-4">
              {!user ? (
                <>
                  <li><Link href="/auth/login" className="hover:text-gray-300"><FaSignInAlt /> Login</Link></li>
                  <li><Link href="/auth/regist" className="hover:text-gray-300"><FaRegUser /> Regist</Link></li>
                </>
              ) : (
                <>
                 
                  <li>
                    <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                      <FaSignOutAlt /> Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
