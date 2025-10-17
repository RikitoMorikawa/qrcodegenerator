-- Add qr_details column to store QR code specific information
ALTER TABLE generated_images ADD COLUMN qr_details JSONB;