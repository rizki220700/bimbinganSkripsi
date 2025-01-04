// src/app/dashboard/mahasiswa/dashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';
import ProgressSkripsi from '@/app/components/ProgressBar';
import ModalPengajuan from '@/app/components/ModalPengajuan'; // Import modal pengajuan

interface Mentorship {
  dosen: string;
  status: string;
}

interface UserProfile {
  name: string;
  email: string;
  nim: string;
  photoURL: string | null;
  userId: string;
}

const DashboardMahasiswa: React.FC = () => {
  const router = useRouter();
  const [activeMentorship, setActiveMentorship] = useState<Mentorship | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Track loading state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // State to control modal visibility

  useEffect(() => {
    const storedUserProfile = localStorage.getItem('userProfile');
    if (storedUserProfile) {
      setUserProfile(JSON.parse(storedUserProfile));
      setLoading(false); // Set loading to false when user profile is loaded from localStorage
    } else {
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

            localStorage.setItem('userProfile', JSON.stringify({
              name: userData.name,
              email: userData.email,
              nim: userData.nim,
              photoURL: userData.photoURL || null,
              userId: user.uid,
            }));
          } else {
            // Handle case when user data does not exist
            console.error('User data not found');
          }
        }
        setLoading(false); // Set loading to false after fetch completes
      };

      fetchUserData();
    }

    setActiveMentorship({
      dosen: 'Dr. John Doe',
      status: 'active',
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show loading message while data is being fetched
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard Mahasiswa</h1>

      {/* Profile Section */}
      <div className="mt-6 flex items-center space-x-6">
        <img
          src={userProfile?.photoURL || '/default-avatar.png'}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold">{userProfile?.name}</h2>
          <p className="text-sm text-gray-500">{userProfile?.email}</p>
          <p className="text-sm text-gray-500">NIM: {userProfile?.nim}</p>
          <button
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
            onClick={() => router.push('/dashboard/mahasiswa/edit-profile')}
          >
            Edit Profil
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card: Bimbingan Aktif */}
        <div className="p-4 bg-blue-500 text-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Bimbingan Aktif</h2>
          {activeMentorship ? (
            <div>
              <p>{activeMentorship.dosen}</p>
              <p>Status: {activeMentorship.status}</p>
            </div>
          ) : (
            <p>Tidak ada bimbingan aktif.</p>
          )}
        </div>

        {/* Card: Pengajuan */}
        <div className="p-4 bg-green-500 text-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold">Pengajuan</h2>
          <p>Status: Menunggu persetujuan</p>
          {/* Button to open modal */}
          <button
            onClick={handleOpenModal}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Ajukan Bimbingan
          </button>
        </div>
      </div>

      {/* Komponen Progress Skripsi */}
      {userProfile && (
        <ProgressSkripsi userId={userProfile.userId} />
      )}

      {/* CTA Section */}
      <div className="mt-6">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          onClick={() => router.push('/dashboard/mahasiswa/pengajuan')}
        >
          Ajukan Dosen Pembimbing
        </button>
        <button
          className="ml-4 px-4 py-2 bg-gray-600 text-white rounded-lg"
          onClick={() => router.push('/dashboard/mahasiswa/riwayat')}
        >
          Lihat Riwayat Bimbingan
        </button>
      </div>

      {/* Modal Pengajuan */}
      <ModalPengajuan isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default DashboardMahasiswa;
