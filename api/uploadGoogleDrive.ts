import { NowRequest, NowResponse } from '@vercel/node';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Gantilah dengan API Key dan Folder ID yang Anda miliki
const GOOGLE_DRIVE_API_KEY = 'AIzaSyAIXGEpUS28X6uBFd64taEg3OfZ2Bj7Bpw';
const GOOGLE_DRIVE_FOLDER_ID = '1nU8L80ZDcGZLD3vyIcpMNaYRcJ39JTik';

// Mendefinisikan tipe untuk respons dari Google Drive API
interface GoogleDriveResponse {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
}

export default async (req: NowRequest, res: NowResponse) => {
  if (req.method === 'POST') {
    const { file, metadata } = req.body; // menerima file dan metadata dari frontend

    // Cek jika file dan metadata tersedia
    if (!file || !metadata) {
      return res.status(400).json({ error: 'File dan metadata diperlukan.' });
    }

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    try {
      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${GOOGLE_DRIVE_API_KEY}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      // Menggunakan type assertion untuk memastikan response JSON sesuai dengan tipe yang diinginkan
      const data = (await response.json()) as GoogleDriveResponse; 
      console.log('Google Drive Response:', data);

      if (response.ok && data.id) {
        // Berikan file URL jika sukses
        return res.status(200).json({ fileURL: `https://drive.google.com/file/d/${data.id}/view` });
      } else {
        return res.status(400).json({ error: 'Gagal mengunggah file ke Google Drive.' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Terjadi kesalahan saat mengunggah file.' });
    }
  } else {
    // Mengembalikan error jika method selain POST digunakan
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};
