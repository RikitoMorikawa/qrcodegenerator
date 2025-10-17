-- Add columns for artistic QR code support
ALTER TABLE generated_images
ADD COLUMN IF NOT EXISTS is_artistic_qr BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS qr_text TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_generated_images_is_artistic_qr
ON generated_images(is_artistic_qr)
WHERE is_artistic_qr = true;

-- Add comment for documentation
COMMENT ON COLUMN generated_images.is_artistic_qr IS 'Whether this is an artistic QR code (true) or a regular AI-generated logo (false)';
COMMENT ON COLUMN generated_images.qr_text IS 'The URL/text encoded in the QR code (for artistic QR codes)';
