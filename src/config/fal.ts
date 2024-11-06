import { fal } from '@fal-ai/client';

// Initialize the FAL client with credentials
fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});