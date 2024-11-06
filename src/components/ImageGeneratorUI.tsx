import React from 'react';
import { Sparkles, Image as ImageIcon, Settings, Loader2, History } from 'lucide-react';
import { GenerationOptions, ImageSize, ModelId, IMAGE_SIZE_LABELS, MODEL_LABELS, GeneratedImage } from './ImageGenerator';

interface ImageGeneratorUIProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  loading: boolean;
  generateImage: () => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  options: GenerationOptions;
  setOptions: (options: GenerationOptions) => void;
  result: string | null;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  imageHistory: GeneratedImage[];
}

export function ImageGeneratorUI({
  prompt,
  setPrompt,
  loading,
  generateImage,
  showAdvanced,
  setShowAdvanced,
  options,
  setOptions,
  result,
  showHistory,
  setShowHistory,
  imageHistory,
}: ImageGeneratorUIProps) {
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