'use client'

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseconfig';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ModalJadwalBimbingan from '@/app/components/ModalJadwalBimbingan';
import { FaTrash, FaEdit } from 'react-icons/fa';

interface JadwalBimbingan {
  id?: string;
  dosenId: string;
  mahasiswaId: string;
  jenis: string;
  location: string;
  status: string;
  timestamp: { seconds: number, nanoseconds: number };
  keterangan: string;
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
  const [dosenId, setDosenId] = useState('');
  const [jadwal, setJadwal] = useState<JadwalBimbingan[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedDosenId = localStorage.getItem('userProfile');
    if (storedDosenId) {
      const userProfile = JSON.parse(storedDosenId);
      setDosenId(userProfile.userId);
    }

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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleDelete = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'jadwal-bimbingan', id));
      router.refresh();
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'jadwal-bimbingan', id), {});
      router.refresh();
    } catch (error) {
      console.error('Error updating:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 mb-4">
        Tambah Jadwal Bimbingan
      </button>

      <ModalJadwalBimbingan isOpen={isModalOpen} onClose={handleCloseModal} dosenId={dosenId} />

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold">
              <th className="p-3 border border-gray-300">No</th>
              <th className="p-3 border border-gray-300">Mahasiswa ID</th>
              <th className="p-3 border border-gray-300">Jenis</th>
              <th className="p-3 border border-gray-300">Waktu/Tanggal</th>
              <th className="p-3 border border-gray-300">Location</th>
              <th className="p-3 border border-gray-300">Progress</th>
              <th className="p-3 border border-gray-300">Keterangan</th>
              <th className="p-3 border border-gray-300">Status</th>
              <th className="p-3 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jadwal.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 transition duration-300 text-sm">
                <td className="p-3 border border-gray-200">{index + 1}</td>
                <td className="p-3 border border-gray-200">{item.mahasiswaId}</td>
                <td className="p-3 border border-gray-200">{item.jenis}</td>
                <td className="p-3 border border-gray-200">{item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleString() : 'N/A'}</td>
                <td className="p-3 border border-gray-200">{item.location}</td>
                <td className="p-3 border border-gray-200">
                  {Object.entries(item.progress)
                    .filter(([_, status]) => status)
                    .map(([bab]) => bab)
                    .join(', ')}
                </td>
                <td className="p-3 border border-gray-200">{item.keterangan}</td>
                <td className="p-3 border border-gray-200">{item.status}</td>
                <td className="p-3 border border-gray-200 flex gap-2 text-lg">
                  <FaTrash onClick={() => handleDelete(item.id)} className="text-red-500 cursor-pointer hover:text-red-700 transition duration-300" />
                  <FaEdit onClick={() => handleUpdate(item.id)} className="text-blue-500 cursor-pointer hover:text-blue-700 transition duration-300" />
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