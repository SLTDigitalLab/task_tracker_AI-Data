const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Upload a file to Supabase Storage (bucket: 'documents')
 * Automatically falls back to local disk if Supabase keys are not set.
 *
 * @param {Object} file - Multer file object
 * @returns {Promise<{ filePath: string, filename: string }>}
 */
async function uploadToStorage(file) {
  const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${Date.now()}-${sanitizedOriginal}`;

  // 1. Try uploading to Supabase Storage if configured
  if (supabase) {
    try {
      const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
      if (!buffer) {
        throw new Error('No file buffer available for cloud upload');
      }

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filename, buffer, {
          contentType: file.mimetype || 'application/octet-stream',
          upsert: true
        });

      if (error) {
        console.error('Supabase storage upload error:', error.message);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filename);

      console.log('File successfully uploaded to Supabase Storage:', publicUrlData.publicUrl);
      return {
        filePath: publicUrlData.publicUrl,
        filename
      };
    } catch (err) {
      console.warn('Falling back to local disk storage:', err.message);
    }
  }

  // 2. Local Fallback: write to local uploads/ directory
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const localFilePath = path.join(uploadDir, filename);
  if (file.buffer) {
    fs.writeFileSync(localFilePath, file.buffer);
  } else if (file.path && file.path !== localFilePath) {
    fs.copyFileSync(file.path, localFilePath);
  }

  return {
    filePath: `uploads/${filename}`,
    filename
  };
}

module.exports = { supabase, uploadToStorage };
