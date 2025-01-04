import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Select from 'react-select';

// Cloudinary API Credentials
const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dsriaj7zd/raw/upload';  // Gantilah dengan URL yang benar
const CLOUDINARY_UPLOAD_PRESET = 'bskroi33d';  // Gantilah dengan preset Anda

interface ModalPengajuanProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalPengajuan = ({ isOpen, onClose }: ModalPengajuanProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedDosen, setSelectedDosen] = useState<string>('');
  const [pesan, setPesan] = useState<string>('');
  const [dosenList, setDosenList] = useState<any[]>([]);

  useEffect(() => {
    const fetchDosen = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'dosen'));
      const querySnapshot = await getDocs(q);
      const dosenData: any[] = querySnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().name
      }));
      setDosenList(dosenData);
    };
    fetchDosen();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadToCloudinary = async () => {
    if (!file || !selectedDosen) return alert('Mohon lengkapi data terlebih dahulu!');
    setIsUploading(true);
  
    // Membaca file sebagai FormData untuk dikirim ke Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);  // Pastikan preset benar
    formData.append('folder', 'file');  // Mengatur folder 'file' di Cloudinary
  
    try {
      // Mengunggah file ke Cloudinary
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
      console.log('Cloudinary Response:', data);
  
      if (response.ok && data.secure_url) {
        // Mendapatkan URL file yang diupload
        const fileURL = data.secure_url;
  
        // Menyimpan data pengajuan ke Firestore
        await addDoc(collection(db, 'pengajuan-bimbingan'), {
          dosen: selectedDosen,
          pesan: pesan,
          fileURL: fileURL,
          timestamp: new Date(),
        });
  
        alert('Pengajuan berhasil dikirim!');
        onClose();
      } else {
        console.error('Cloudinary API Error:', data);
        alert(`Gagal mengunggah file ke Cloudinary. Error: ${data.error.message}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Terjadi kesalahan saat mengunggah file.');
    } finally {
      setIsUploading(false);
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold">Pengajuan Bimbingan</h2>

        <div className="mt-4">
          <label className="block text-sm font-medium">Pilih Dosen Pembimbing</label>
          <Select
            options={dosenList}
            onChange={(selectedOption) => setSelectedDosen(selectedOption?.label || '')}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium">Pesan untuk Dosen</label>
          <textarea
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            placeholder="Tuliskan pesan Anda"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium">Unggah File Pengajuan</label>
          <input type="file" onChange={handleFileChange} className="mt-2 w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2">
            Batal
          </button>
          <button
            onClick={handleUploadToCloudinary}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            disabled={isUploading}
          >
            {isUploading ? 'Mengunggah...' : 'Ajukan Bimbingan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPengajuan;
