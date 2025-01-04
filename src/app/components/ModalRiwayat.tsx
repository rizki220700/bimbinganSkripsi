'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseconfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface RiwayatBimbingan {
  id: string;
  tanggal: string;
  dosen: string;
  status: string;
  keterangan: string;
}

interface ModalRiwayatProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const ModalRiwayat: React.FC<ModalRiwayatProps> = ({ isOpen, onClose, userId }) => {
  const [riwayat, setRiwayat] = useState<RiwayatBimbingan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      if (!userId) return;
      setLoading(true);
      const q = query(collection(db, 'riwayatBimbingan'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const fetchedRiwayat = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as RiwayatBimbingan[];
      setRiwayat(fetchedRiwayat);
      setLoading(false);
    };

    if (isOpen) {
      fetchRiwayat();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Riwayat Bimbingan</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-4 max-h-80 overflow-y-auto">
            {riwayat.length > 0 ? (
              riwayat.map((item) => (
                <li key={item.id} className="p-4 bg-gray-100 rounded-lg shadow">
                  <p><strong>Tanggal:</strong> {item.tanggal}</p>
                  <p><strong>Dosen:</strong> {item.dosen}</p>
                  <p><strong>Status:</strong> {item.status}</p>
                  <p><strong>Keterangan:</strong> {item.keterangan}</p>
                </li>
              ))
            ) : (
              <p>Tidak ada riwayat ditemukan.</p>
            )}
          </ul>
        )}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRiwayat;
