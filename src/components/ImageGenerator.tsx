import React, { useState } from 'react';
import { fal } from '@fal-ai/client';
import { Sparkles, Image as ImageIcon, Settings, Loader2 } from 'lucide-react';

type GenerationOptions = {
  imageSize: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  inferenceSteps: number;
  seed?: number;
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

fal.config({
  credentials: import.meta.env.VITE_FAL_KEY,
});

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<GenerationOptions>({
    imageSize: 'square_hd',
    inferenceSteps: 4,
  });

  const generateImage = async () => {
    if (!prompt) return;
    
    setLoading(true);
    try {
      const result = await fal.subscribe("fal-ai/fast-lightning-sdxl", {
        input: {
          prompt,
          image_size: options.imageSize,
          num_inference_steps: options.inferenceSteps,
          seed: options.seed,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });
      
      setResult(result.data.images[0].url);
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
    </div>
  );
}