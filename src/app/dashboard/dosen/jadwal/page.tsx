'use client'

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseconfig';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ModalJadwalBimbingan from '@/app/components/ModalJadwalBimbingan'; // Pastikan path benar

interface JadwalBimbingan {
  id?: string;
  dosenId: string;
  mahasiswaId: string;
  jenis: string;
  location: string;
  status: string;
  timestamp: string;
  progress: {
    bab1: boolean;
    bab2: boolean;
    bab3: boolean;
    bab4: boolean;
    bab5: boolean;
  };
}

const JadwalBimbinganPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dosenId, setDosenId] = useState(''); // Sesuaikan dengan dosen yang relevan
  const [jadwal, setJadwal] = useState<JadwalBimbingan[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Ambil dosenId dari localStorage
    const storedDosenId = localStorage.getItem('userProfile');
    if (storedDosenId) {
      const userProfile = JSON.parse(storedDosenId);
      setDosenId(userProfile.userId); // Ambil userId dan set ke dosenId
    }

    // Fetch data jadwal bimbingan
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'jadwal-bimbingan'));
      const jadwalData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as JadwalBimbingan)
      }));
      setJadwal(jadwalData);
    };
    fetchData();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      console.error("ID tidak ditemukan.");
      return;
    }
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'jadwal-bimbingan', id));
      router.refresh(); // Refresh data
    } catch (error) {
      console.error('Terjadi kesalahan saat menghapus jadwal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id?: string) => {
    if (!id) {
      console.error("ID tidak ditemukan.");
      return;
    }
    setLoading(true);
    const jadwalRef = doc(db, 'jadwal-bimbingan', id);
    try {
      await updateDoc(jadwalRef, { /* update data here */ });
      router.refresh(); // Refresh data
    } catch (error) {
      console.error('Terjadi kesalahan saat mengupdate jadwal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Tombol untuk membuka modal */}
      <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Tambah Jadwal Bimbingan
      </button>

      {/* Modal Jadwal Bimbingan */}
      <ModalJadwalBimbingan 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        dosenId={dosenId} // Menggunakan dosenId yang diambil dari localStorage
      />

 
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid black', padding: '8px' }}>Mahasiswa ID</th>
              <th style={{ border: '1px solid black', padding: '8px' }}>Jenis</th>
              <th style={{ border: '1px solid black', padding: '8px' }}>Status</th>
              <th style={{ border: '1px solid black', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jadwal.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid black', padding: '8px' }}>{item.mahasiswaId}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{item.jenis}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{item.status}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>
                  <button onClick={() => handleDelete(item.id)} disabled={loading}>Delete</button>
                  <button onClick={() => handleUpdate(item.id)} disabled={loading}>Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JadwalBimbinganPage;
