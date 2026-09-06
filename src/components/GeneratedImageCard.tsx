import React, { useState } from 'react';
import {
  Download,
  Maximize2,
  RotateCw,
  Sparkles,
  Copy,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { GeneratedImageData } from '../types';

interface GeneratedImageCardProps {
  image: GeneratedImageData;
  isDark: boolean;
  onRegenerate?: (prompt: string) => void;
}

export const GeneratedImageCard: React.FC<GeneratedImageCardProps> = ({
  image,
  isDark,
  onRegenerate,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(image.prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const filename = `vexa-ai-${image.prompt.slice(0, 24).replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.png`;

      // If it's a data URI, direct download
      if (image.url.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // If remote URL, fetch blob
      const res = await fetch(image.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: open in new tab
      window.open(image.url, '_blank', 'noopener,noreferrer');
    } finally {
      setIsDownloading(false);
    }
  };

  const isWide = image.aspectRatio === '16:9';
  const isTall = image.aspectRatio === '9:16';

  return (
    <>
      <div
        id="generated-image-container"
        className={`mt-3 rounded-2xl overflow-hidden border transition-all shadow-lg ${
          isDark
            ? 'bg-[#1e1e1e] border-[#383838] shadow-black/40'
            : 'bg-white border-gray-200 shadow-gray-200/60'
        } max-w-xl w-full`}
      >
        {/* Image Preview Container */}
        <div
          className={`relative overflow-hidden group cursor-pointer ${
            isWide ? 'aspect-video' : isTall ? 'aspect-[9/16] max-h-[520px]' : 'aspect-square max-h-[460px]'
          } ${isDark ? 'bg-black/60' : 'bg-gray-100'} flex items-center justify-center`}
          onClick={() => setIsZoomed(true)}
        >
          {/* Skeleton while loading */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-pulse bg-gradient-to-r from-indigo-950/20 via-purple-950/30 to-pink-950/20">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-spin [animation-duration:3s] mb-2" />
              <span className="text-xs font-medium text-gray-400">Loading high-resolution render...</span>
            </div>
          )}

          {hasError ? (
            <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-xs text-rose-400 font-medium">Image preview failed to load</span>
              {onRegenerate && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate(image.prompt);
                  }}
                  className="px-3 py-1 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Retry Generation
                </button>
              )}
            </div>
          ) : (
            <img
              src={image.url}
              alt={image.prompt}
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Hover Overlay with Quick Actions */}
          {isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
              <span className="text-xs text-white/90 font-medium truncate max-w-[70%] drop-shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                Click to inspect full view
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(true);
                  }}
                  title="Full View / Zoom"
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  title="Download Image"
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info & Action Bar */}
        <div className={`p-3 border-t ${isDark ? 'border-[#2d2d2d] bg-[#161616]' : 'border-gray-100 bg-gray-50'}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" />
                  {image.modelUsed || 'AI Vexa Image Engine'}
                </span>
                {image.aspectRatio && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium text-gray-400 bg-black/20 border border-white/5">
                    {image.aspectRatio}
                  </span>
                )}
              </div>
              <p className={`text-xs font-medium leading-snug line-clamp-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                "{image.prompt}"
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1 shrink-0 pt-0.5">
              <button
                type="button"
                onClick={handleCopyPrompt}
                title="Copy Prompt"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  isDark ? 'hover:bg-[#2c2c2c] text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-black'
                }`}
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Download Image"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {onRegenerate && (
                <button
                  type="button"
                  onClick={() => onRegenerate(image.prompt)}
                  title="Regenerate this image"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isDark
                      ? 'bg-[#2a2a2a] hover:bg-[#353535] text-gray-300 hover:text-white border border-[#3e3e3e]'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Regenerate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen / Zoom Lightbox Modal */}
      {isZoomed && (
        <div
          id="image-zoom-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6"
          onClick={() => setIsZoomed(false)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div
            className="max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={image.url}
              alt={image.prompt}
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
            <div className="mt-4 text-center max-w-xl">
              <p className="text-sm text-gray-200 font-medium leading-relaxed">"{image.prompt}"</p>
              {image.revisedPrompt && image.revisedPrompt !== image.prompt && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  <span className="text-indigo-400">Enhanced:</span> {image.revisedPrompt}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
