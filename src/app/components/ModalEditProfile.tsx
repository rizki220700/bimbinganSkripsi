'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

interface UserProfile {
  name: string;
  email: string;
  nim: string;
  photoURL: string | null;
  userId: string;
}

interface ModalEditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const ModalEditProfile: React.FC<ModalEditProfileProps> = ({
  isOpen,
  onClose,
  userProfile,
  setUserProfile,
}) => {
  const [name, setName] = useState<string>(userProfile?.name || '');
  const [email, setEmail] = useState<string>(userProfile?.email || '');
  const [photoURL, setPhotoURL] = useState<string>(userProfile?.photoURL || '');
  const [password, setPassword] = useState<string>(''); // Password lama
  const [newPassword, setNewPassword] = useState<string>(''); // Password baru
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>(''); // Konfirmasi password baru
  const [error, setError] = useState<string | null>(null);

  const handleSaveChanges = async () => {
    if (userProfile) {
      const userRef = doc(db, 'users', userProfile.userId);
      await updateDoc(userRef, {
        name,
        email,
        photoURL,
      });

      // Update local state and localStorage
      const updatedProfile = { ...userProfile, name, email, photoURL };
      setUserProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      onClose(); // Close modal after saving
    }
  };

  const handleChangePassword = async () => {
    // Validasi jika password baru dan konfirmasi password cocok
    if (newPassword !== confirmNewPassword) {
      setError('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password baru harus minimal 6 karakter');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (user && password && newPassword) {
      try {
        const credential = EmailAuthProvider.credential(user.email || '', password);
        await reauthenticateWithCredential(user, credential); // Reauthenticate the user to change password
        await updatePassword(user, newPassword); // Update the password
        setError(null); // Clear any previous error

        // Update local profile if necessary
        // Set the updated profile information to localStorage
        onClose(); // Close modal after password change
      } catch (error: any) {
        // Menangani error yang mungkin terjadi saat reauthenticate atau update password
        if (error.code === 'auth/wrong-password') {
          setError('Password lama salah. Coba lagi.');
        } else {
          setError('Gagal memperbarui password. Silakan coba lagi.');
        }
      }
    } else {
      setError('Semua field harus diisi.');
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Profil</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Foto Profil</label>
              <input
                type="text"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="URL Foto Profil"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Password Lama</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mt-4">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg w-full"
                onClick={handleChangePassword}
              >
                Ganti Password
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                onClick={onClose}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                onClick={handleSaveChanges}
              >
                Simpan
              </button>
            </div>

            
          </div>
        </div>
      )}
    </>
  );
};

export default ModalEditProfile;
