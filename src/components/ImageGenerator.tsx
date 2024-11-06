import React, { useState, useEffect } from 'react';
import { fal } from '@fal-ai/client';
import { ImageGeneratorUI } from './ImageGeneratorUI';

export type ImageSize = 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
export type ModelId = 'fal-ai/flux/schnell' | 'fal-ai/fast-lightning-sdxl' | 'fal-ai/flux/dev';

export type GenerationOptions = {
  imageSize: ImageSize;
  inferenceSteps: number;
  seed?: number;
  model: ModelId;
};

export const IMAGE_SIZE_LABELS: Record<ImageSize, string> = {
  square_hd: 'Square HD',
  square: 'Square',
  portrait_4_3: 'Portrait (4:3)',
  portrait_16_9: 'Portrait (16:9)',
  landscape_4_3: 'Landscape (4:3)',
  landscape_16_9: 'Landscape (16:9)',
};

export const MODEL_LABELS: Record<ModelId, string> = {
  'fal-ai/flux/schnell': 'Flux Schnell (High Quality)',
  'fal-ai/fast-lightning-sdxl': 'Fast Lightning SDXL (Fastest)',
  'fal-ai/flux/dev': 'Flux Dev (Best Quality and Expensive)',
};

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  options: GenerationOptions;
}

fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [options, setOptions] = useState<GenerationOptions>({
    imageSize: 'portrait_4_3',
    inferenceSteps: 4,
    model: 'fal-ai/fast-lightning-sdxl',
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('imageHistory');
    if (savedHistory) {
      setImageHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (imageUrl: string) => {
    const newImage: GeneratedImage = {
      url: imageUrl,
      prompt,
      timestamp: Date.now(),
      options,
    };
    
    const updatedHistory = [newImage, ...imageHistory].slice(0, 50);
    setImageHistory(updatedHistory);
    localStorage.setItem('imageHistory', JSON.stringify(updatedHistory));
  };

  const generateImage = async () => {
    if (!prompt) return;
    
    setLoading(true);
    try {
      const result = await fal.subscribe(options.model, {
        input: {
          prompt,
          image_size: options.imageSize,
          num_inference_steps: options.inferenceSteps,
          seed: options.seed,
          enable_safety_checker: false,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });
      
      let imageUrl: string;
      if (Array.isArray(result.data.images)) {
        imageUrl = result.data.images[0].url;
      } else if (typeof result.data.image === 'string') {
        imageUrl = result.data.image;
      } else if (result.data.images && typeof result.data.images.url === 'string') {
        imageUrl = result.data.images.url;
      } else {
        console.error('Unexpected response format:', result.data);
        throw new Error('Unexpected response format from model');
      }

      setResult(imageUrl);
      saveToHistory(imageUrl);
      
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageGeneratorUI
      prompt={prompt}
      setPrompt={setPrompt}
      loading={loading}
      generateImage={generateImage}
      showAdvanced={showAdvanced}
      setShowAdvanced={setShowAdvanced}
      options={options}
      setOptions={setOptions}
      result={result}
      showHistory={showHistory}
      setShowHistory={setShowHistory}
      imageHistory={imageHistory}
    />
  );
}