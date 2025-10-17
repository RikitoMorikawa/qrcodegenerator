-- Add original_prompt column to store user's original input
ALTER TABLE generated_images ADD COLUMN original_prompt TEXT;