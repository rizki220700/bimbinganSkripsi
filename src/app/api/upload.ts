
import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from '../../lib/cloudinary';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { file } = req.body; // menerima file dari frontend

    if (!file) {
      return res.status(400).json({ error: 'File is required.' });
    }

    try {
      // Upload file ke Cloudinary
      const uploadResponse = await cloudinary.v2.uploader.upload(file, {
        folder: 'your-folder-name', // Optional: Ganti dengan folder yang diinginkan
      });

      // Mengembalikan URL file yang telah diupload
      return res.status(200).json({ fileURL: uploadResponse.secure_url });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Error uploading file to Cloudinary.' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};
