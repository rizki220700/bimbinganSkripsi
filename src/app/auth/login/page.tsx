// src/app/pages/auth.tsx
'use client'
import Link from 'next/link';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');  // Menyimpan pesan error
  const router = useRouter();

  const handleLogin = async () => {
    const auth = getAuth();
    setErrorMessage('');  // Reset error message sebelum login

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Cek peran pengguna di Firestore atau dengan custom claims
      const userRole = await fetchUserRole(user.uid);

      if (userRole === 'mahasiswa') {
        router.push('/dashboard/mahasiswa');
      } else if (userRole === 'dosen') {
        router.push('/dashboard/dosen');
      } else if (userRole === 'admin') {
        router.push('/dashboard/admin');
      } else {
        setErrorMessage('Peran pengguna tidak ditemukan.');
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      setErrorMessage('Email atau password salah.');
    }
  };

  const fetchUserRole = async (userId: string): Promise<string> => {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().role;  // return 'mahasiswa', 'dosen', or 'admin'
    } else {
      throw new Error("User not found");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
    <div className="bg-white p-8 rounded-lg shadow-lg w-96">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">Login</h1>
      {errorMessage && (
        <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>
      )}
      <div className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="mb-6">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={handleLogin}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
      >
        Login
      </button>
  
      {/* Tombol untuk registrasi */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Belum punya akun?{' '}
        <Link href="/auth/regist" className="text-blue-500 hover:underline">
          Daftar sekarang!
        </Link>
      </p>
    </div>
  </div>
  
  );
};

export default LoginPage;
