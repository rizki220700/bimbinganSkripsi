'use client'

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseconfig';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const [jadwal, setJadwal] = useState<JadwalBimbingan[]>([]);
  const [formData, setFormData] = useState<JadwalBimbingan>({
    dosenId: '',
    mahasiswaId: '',
    jenis: '',
    location: '',
    status: '',
    timestamp: new Date().toISOString(),
    progress: { bab1: false, bab2: false, bab3: false, bab4: false, bab5: false }
  });
  const router = useRouter();

  useEffect(() => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('progress')) {
      const progressKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        progress: { ...prev.progress, [progressKey]: checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dosenId || !formData.mahasiswaId || !formData.jenis || !formData.status) {
      console.error('Semua field harus diisi!');
      return;
    }
    await addDoc(collection(db, 'jadwal-bimbingan'), formData);
    router.push('/jadwal-bimbingan');  // Atau gunakan router.refresh() jika perlu
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      console.error("ID tidak ditemukan.");
      return;
    }
    await deleteDoc(doc(db, 'jadwal-bimbingan', id));
    router.push('/jadwal-bimbingan');  // Refresh halaman
  };

  const handleUpdate = async (id?: string) => {
    if (!id) {
      console.error("ID tidak ditemukan.");
      return;
    }
    const jadwalRef = doc(db, 'jadwal-bimbingan', id);
    await updateDoc(jadwalRef, { ...formData } as Partial<JadwalBimbingan>);
    router.push('/jadwal-bimbingan');  // Refresh halaman
  };

  return (
    <div>

<div>
      {/* Tombol untuk membuka modal */}
      <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Tambah Jadwal Bimbingan
      </button>

      {/* Modal Jadwal Bimbingan */}
      <ModalJadwalBimbingan 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        dosenId={dosenId} 
      />
    </div>
      <h1>CRUD Jadwal Bimbingan</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input name="dosenId" placeholder="Dosen ID" value={formData.dosenId} onChange={handleChange} />
        <input name="mahasiswaId" placeholder="Mahasiswa ID" value={formData.mahasiswaId} onChange={handleChange} />
        <input name="jenis" placeholder="Jenis Bimbingan" value={formData.jenis} onChange={handleChange} />
        <input name="location" placeholder="Lokasi" value={formData.location} onChange={handleChange} />
        <input name="status" placeholder="Status" value={formData.status} onChange={handleChange} />
        <button type="submit">Tambah Jadwal</button>
      </form>

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
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                  <button onClick={() => handleUpdate(item.id)}>Update</button>
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
