import React, { useState, useEffect } from 'react';
import { fal } from '@fal-ai/client';
import { Sparkles, Image as ImageIcon, Settings, Loader2, ChevronDown, ChevronUp, History } from 'lucide-react';

type GenerationOptions = {
  imageSize: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  inferenceSteps: number;
  seed?: number;
  model: ModelId;
};

type ImageSize = 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';

const IMAGE_SIZE_LABELS: Record<ImageSize, string> = {
  square_hd: 'Square HD',
  square: 'Square',
  portrait_4_3: 'Portrait (4:3)',
  portrait_16_9: 'Portrait (16:9)',
  landscape_4_3: 'Landscape (4:3)',
  landscape_16_9: 'Landscape (16:9)',
};

type ModelId = 'fal-ai/flux/schnell' | 'fal-ai/fast-lightning-sdxl' | 'fal-ai/flux/dev';

const MODEL_LABELS: Record<ModelId, string> = {
  'fal-ai/flux/schnell': 'Flux Schnell (High Quality)',
  'fal-ai/fast-lightning-sdxl': 'Fast Lightning SDXL (Fastest)',
  'fal-ai/flux/dev': 'Flux Dev (Best Quality and Expensive)',
};

fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  options: GenerationOptions;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [options, setOptions] = useState<GenerationOptions>({
    imageSize: 'square_hd',
    inferenceSteps: 4,
    model: 'fal-ai/fast-lightning-sdxl',
  });

  // Load history on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('imageHistory');
    if (savedHistory) {
      setImageHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save new image to history
  const saveToHistory = (imageUrl: string) => {
    const newImage: GeneratedImage = {
      url: imageUrl,
      prompt,
      timestamp: Date.now(),
      options,
    };
    
    const updatedHistory = [newImage, ...imageHistory].slice(0, 50); // Keep last 50 images
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
      
      // Handle different response formats from different models
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
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full p-4 pr-12 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white/50 backdrop-blur-sm min-h-[120px] resize-none"
          />
          <button
            onClick={generateImage}
            disabled={loading || !prompt}
            className="absolute right-4 bottom-4 p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </button>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-purple-50/50 rounded-lg">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                  AI Model
                </label>
                <select
                  id="model"
                  value={options.model}
                  onChange={(e) => setOptions({ ...options, model: e.target.value as ModelId })}
                  className="block w-full rounded-lg border-0 py-1.5 bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
                >
                  {Object.entries(MODEL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {options.model === 'fal-ai/flux/schnell' && 'Optimized for speed, good for rapid prototyping. Use 4 steps.'}
                  {options.model === 'fal-ai/fast-lightning-sdxl' && 'Best balance of speed and quality. Use 4 steps.'}
                  {options.model === 'fal-ai/flux/dev' && 'Latest experimental features. Use 28 steps.'}
                </p>
              </div>

              <div>
                <label htmlFor="imageSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Image Size
                </label>
                <select
                  id="imageSize"
                  value={options.imageSize}
                  onChange={(e) => setOptions({ ...options, imageSize: e.target.value as ImageSize })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  {Object.entries(IMAGE_SIZE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inference Steps</label>
                <input
                  type="number"
                  value={options.inferenceSteps}
                  onChange={(e) => setOptions({ ...options, inferenceSteps: parseInt(e.target.value) })}
                  className="w-full p-2 rounded border border-gray-200 focus:border-purple-500"
                  min={1}
                  max={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seed (Optional)</label>
                <input
                  type="number"
                  value={options.seed || ''}
                  onChange={(e) => setOptions({ ...options, seed: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full p-2 rounded border border-gray-200 focus:border-purple-500"
                  placeholder="Random"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="relative group">
          <img
            src={result}
            alt="Generated image"
            className="w-full h-auto rounded-lg shadow-lg"
          />
          <a
            href={result}
            download="generated-image.png"
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
          >
            <div className="bg-white p-3 rounded-full">
              <ImageIcon className="w-6 h-6 text-gray-900" />
            </div>
          </a>
        </div>
      )}

      <div className="mt-12">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <History className="w-5 h-5" />
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
        
        {showHistory && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imageHistory.map((image, index) => (
              <div key={image.timestamp} className="space-y-2">
                <div className="relative group">
                  <img
                    src={image.url}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <a
                    href={image.url}
                    download={`generated-image-${image.timestamp}.png`}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                  >
                    <div className="bg-white p-3 rounded-full">
                      <ImageIcon className="w-6 h-6 text-gray-900" />
                    </div>
                  </a>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium truncate">{image.prompt}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(image.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Size: {IMAGE_SIZE_LABELS[image.options.imageSize]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}