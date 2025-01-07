'use client'

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseconfig';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';

interface PengajuanBimbingan {
  id?: string;
  dosen: string;
  fileURL: string;
  pesan: string;
  status: string;
  timestamp: { seconds: number, nanoseconds: number };
  userId: string;
}

interface User {
  name: string;
  email: string;
  nim: string;
}

const ListMahasiswaBimbingan = () => {
  const [mahasiswaBimbingan, setMahasiswaBimbingan] = useState<PengajuanBimbingan[]>([]);
  const [loading, setLoading] = useState(true);
  const [mahasiswaData, setMahasiswaData] = useState<{ [key: string]: User }>({}); // Menyimpan data mahasiswa berdasarkan userId

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'pengajuan-bimbingan'), where('status', '==', 'Accepted')), 
      (querySnapshot) => {
        const bimbinganData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as PengajuanBimbingan)
        }));

        setMahasiswaBimbingan(bimbinganData);
        setLoading(false);

        // Ambil data lengkap mahasiswa berdasarkan userId
        bimbinganData.forEach(async (item) => {
          if (!mahasiswaData[item.userId]) {
            const userRef = doc(db, 'users', item.userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              setMahasiswaData(prev => ({
                ...prev,
                [item.userId]: userDoc.data() as User,
              }));
            }
          }
        });
      });

    return () => unsubscribe();
  }, [mahasiswaData]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold mb-4">Loading Mahasiswa Bimbingan...</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">List Mahasiswa yang Dibimbing</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold">
              <th className="p-3 border border-gray-300">No</th>
              <th className="p-3 border border-gray-300">Nama Mahasiswa</th>
              <th className="p-3 border border-gray-300">NIM</th>
              <th className="p-3 border border-gray-300">Email</th>
            </tr>
          </thead>
          <tbody>
            {mahasiswaBimbingan.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 transition duration-300 text-sm">
                <td className="p-3 border border-gray-200">{index + 1}</td>
                <td className="p-3 border border-gray-200">{mahasiswaData[item.userId]?.name}</td>
                <td className="p-3 border border-gray-200">{mahasiswaData[item.userId]?.nim}</td>
                <td className="p-3 border border-gray-200">{mahasiswaData[item.userId]?.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListMahasiswaBimbingan;
