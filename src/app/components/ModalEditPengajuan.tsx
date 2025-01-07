'use client';

import { useState, useEffect } from 'react';

interface Pengajuan {
    id: string;
    dosen: string;
    fileURL: string;
    pesan: string;
    status: string;
    timestamp: string;
    userId: string;
}

interface ModalEditPengajuanProps {
    pengajuan: Pengajuan | null;
    closeModal: () => void;
    updatePengajuan: (updatedPengajuan: Pengajuan) => void;
}

const ModalEditPengajuan: React.FC<ModalEditPengajuanProps> = ({ pengajuan, closeModal, updatePengajuan }) => {
    const [formData, setFormData] = useState<Pengajuan>({
        id: '',
        dosen: '',
        fileURL: '',
        pesan: '',
        status: '',
        timestamp: '',
        userId: '',
    });

    useEffect(() => {
        if (pengajuan) {
            setFormData({ ...pengajuan });
        } else {
            setFormData({
                id: '',
                dosen: '',
                fileURL: '',
                pesan: '',
                status: '',
                timestamp: '',
                userId: '',
            });
        }
    }, [pengajuan]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData: Pengajuan) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.dosen || !formData.pesan || !formData.status) {
            alert('Harap isi semua data.');
            return;
        }

        updatePengajuan(formData);
        closeModal();
    };

    return (
        <div className="modal fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
            <div className="modal-content bg-white p-6 rounded-lg w-96 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Edit Pengajuan Bimbingan</h2>

                <label className="block mb-2">Dosen</label>
                <input
                    type="text"
                    name="dosen"
                    value={formData.dosen}
                    onChange={handleChange}
                    className="w-full border p-2 mb-4"
                />

                <label className="block mb-2">Pesan</label>
                <input
                    type="text"
                    name="pesan"
                    value={formData.pesan}
                    onChange={handleChange}
                    className="w-full border p-2 mb-4"
                />

                <label className="block mb-2">Status</label>
                <input
                    type="text"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border p-2 mb-4"
                />

                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
                >
                    Simpan
                </button>
                <button
                    onClick={closeModal}
                    className="bg-gray-500 text-white py-2 px-4 rounded"
                >
                    Tutup
                </button>
            </div>
        </div>
    );
};

export default ModalEditPengajuan;
