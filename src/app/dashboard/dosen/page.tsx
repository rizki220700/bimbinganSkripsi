// src/app/pages/dashboard/dosen.tsx
'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseconfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ModalEditProfile from '@/app/components/ModalEditProfile';
import ModalRiwayat from '@/app/components/ModalRiwayat';

interface UserProfile {
  name: string;
  email: string;
  nim: string;
  photoURL: string | null;
  userId: string;
}

interface Mahasiswa {
  id: string;
  name: string;
  nim: string;
  email: string;
  photoURL: string | null;
}

const DosenDashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);
  const [isRiwayatModalOpen, setIsRiwayatModalOpen] = useState<boolean>(false);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserProfile({
            name: userData.name,
            email: userData.email,
            nim: userData.nim,
            photoURL: userData.photoURL || null,
            userId: user.uid,
          });
        } else {
          console.error('User data not found');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchMahasiswaData = async () => {
      if (userProfile?.userId) {
        const q = query(collection(db, 'mahasiswa'), where('dosenId', '==', userProfile.userId));
        const querySnapshot = await getDocs(q);
        const mahasiswaData: Mahasiswa[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          mahasiswaData.push({
            id: doc.id,
            name: data.name,
            nim: data.nim,
            email: data.email,
            photoURL: data.photoURL || null,
          });
        });
        setMahasiswaList(mahasiswaData);
      }
    };

    fetchMahasiswaData();
  }, [userProfile]);

  const handleOpenEditProfileModal = () => {
    setIsEditProfileModalOpen(true);
  };

  const handleCloseEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
  };

  const handleOpenRiwayatModal = () => {
    setIsRiwayatModalOpen(true);
  };

  const handleCloseRiwayatModal = () => {
    setIsRiwayatModalOpen(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Dosen</h1>
      </header>

      {/* Profil Dosen */}
      <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Profil Dosen</h2>
        <div className="flex items-center space-x-4">
          <img 
            src={userProfile?.photoURL || '/default-profile.png'} 
            alt="Profile Picture" 
            className="w-16 h-16 rounded-full object-cover" 
          />
          <div>
            <p className="text-lg font-medium">{userProfile?.name}</p>
            <p className="text-sm text-gray-500">{userProfile?.nim}</p>
            <p className="text-sm text-gray-500">{userProfile?.email}</p>
          </div>
        </div>
        <button
          className="mt-4 sm:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg"
          onClick={handleOpenEditProfileModal}
        >
          Edit Profil
        </button>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Daftar Mahasiswa yang Dibimbing */}
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Daftar Mahasiswa yang Dibimbing</h2>
          <ul>
            {mahasiswaList.length > 0 ? (
              mahasiswaList.map((mahasiswa) => (
                <li key={mahasiswa.id} className="text-base sm:text-lg text-gray-500">
                  {mahasiswa.name} ({mahasiswa.nim})
                </li>
              ))
            ) : (
              <p className="text-base sm:text-lg text-gray-500">Belum ada mahasiswa yang dibimbing.</p>
            )}
          </ul>
        </div>

        {/* Modal Riwayat Bimbingan */}
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
          onClick={handleOpenRiwayatModal}
        >
          Lihat Riwayat Bimbingan
        </button>
      </section>

      {/* Modal Edit Profil */}
      <ModalEditProfile 
        isOpen={isEditProfileModalOpen} 
        onClose={handleCloseEditProfileModal} 
        userProfile={userProfile} 
        setUserProfile={setUserProfile} 
      />

      {/* Modal Riwayat */}
      <ModalRiwayat 
        isOpen={isRiwayatModalOpen} 
        onClose={handleCloseRiwayatModal} 
        userId={userProfile?.userId || ''} 
      />
    </div>
  );
};

export default DosenDashboard;
