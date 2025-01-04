'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseconfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import ProgressSkripsi from '@/app/components/ProgressBar';
import ModalPengajuan from '@/app/components/ModalPengajuan';
import ModalRiwayat from '@/app/components/ModalRiwayat';
import ModalEditProfile from '@/app/components/ModalEditProfile';  // Import komponen modal edit profil

interface Mentorship {
  dosen: string;
  status: 'belum mengajukan' | 'pending' | 'diterima';
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
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRiwayatModalOpen, setIsRiwayatModalOpen] = useState<boolean>(false); // State untuk Modal Riwayat
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false); // Modal Edit Profil

  useEffect(() => {
    const storedUserProfile = localStorage.getItem('userProfile');
    if (storedUserProfile) {
      setUserProfile(JSON.parse(storedUserProfile));
      setLoading(false);
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
            console.error('User data not found');
          }
        }
        setLoading(false);
      };
      fetchUserData();
    }

    setActiveMentorship({
      dosen: 'Dr. John Doe',
      status: 'belum mengajukan',
    });
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenRiwayatModal = () => {
    setIsRiwayatModalOpen(true);  // Buka Modal Riwayat
  };

  const handleCloseRiwayatModal = () => {
    setIsRiwayatModalOpen(false); // Tutup Modal Riwayat
  };

  const handleOpenEditProfileModal = () => {
    setIsEditProfileModalOpen(true); // Buka Modal Edit Profil
  };

  const handleCloseEditProfileModal = () => {
    setIsEditProfileModalOpen(false); // Tutup Modal Edit Profil
  };

  const handleCancelSubmission = async () => {
    setActiveMentorship((prev) => prev ? { ...prev, status: 'belum mengajukan' } : null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold">Loading...</div>;
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Mahasiswa</h1>
      </header>

      {/* Profil Mahasiswa */}
      <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
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
          <button
            className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg"
            onClick={handleOpenEditProfileModal} // Buka modal edit profil
          >
            Edit Profil
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Bimbingan Aktif</h2>
          {activeMentorship ? (
            <p className="text-base sm:text-lg">{activeMentorship.dosen} - {activeMentorship.status}</p>
          ) : (
            <p className="text-base sm:text-lg text-gray-500">Tidak ada bimbingan aktif.</p>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Pengajuan</h2>
          <p className="text-base sm:text-lg">
            Status: {activeMentorship?.status}
          </p>
          {activeMentorship?.status === 'belum mengajukan' && (
            <button
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg w-full"
              onClick={handleOpenModal}
            >
              Ajukan Bimbingan
            </button>
          )}
          {activeMentorship?.status === 'pending' && (
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg w-full"
              onClick={handleCancelSubmission}
            >
              Batalkan Pengajuan
            </button>
          )}
        </div>

        <ProgressSkripsi userId={userProfile?.userId || ''} />
      </section>

      {/* Tombol untuk membuka Modal Riwayat */}
      <button
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
        onClick={handleOpenRiwayatModal}
      >
        Lihat Riwayat Bimbingan
      </button>

      {/* ModalRiwayat */}
      <ModalRiwayat 
        isOpen={isRiwayatModalOpen} 
        onClose={handleCloseRiwayatModal} 
        userId={userProfile?.userId || ''}  // Pastikan userId ada sebelum dikirim
      />

      {/* Modal Edit Profil */}
      <ModalEditProfile 
        isOpen={isEditProfileModalOpen} 
        onClose={handleCloseEditProfileModal} 
        userProfile={userProfile} 
        setUserProfile={setUserProfile} 
      />

      <ModalPengajuan isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default DashboardMahasiswa;
