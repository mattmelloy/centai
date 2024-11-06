import React from 'react';
import { Sparkles } from 'lucide-react';
import ImageGenerator from './components/ImageGenerator';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <header className="border-b border-purple-100 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                CentAI
              </span>
            </div>
            <nav>
              <a
                href="https://fal.ai/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                API Docs
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Amazing Images with AI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your ideas into stunning visuals using state-of-the-art Stable Diffusion technology.
            Just describe what you want to see, and watch the magic happen.
          </p>
        </div>

        <ImageGenerator />
      </main>

      <footer className="border-t border-purple-100 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>Powered by FAL.ai Stable Diffusion</p>
        </div>
      </footer>
    </div>
  );
}

export default App;