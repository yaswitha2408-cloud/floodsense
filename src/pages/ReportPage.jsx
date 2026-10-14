import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  Layers,
  Car,
  Bike,
  Footprints,
  Info,
  ShieldCheck,
  Check,
  X,
  Sliders,
} from 'lucide-react';
import { PILOT_CONFIG } from '../config';
import { compressImage } from '../utils/imageCompressor';

export default function ReportPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [compressedData, setCompressedData] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Geolocation state
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('locating'); // 'locating' | 'ready' | 'fallback' | 'error'

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Editable preview state (SPEC.md Section 5: depth, passability, note)
  const [depthCm, setDepthCm] = useState(15);
  const [referenceObject, setReferenceObject] = useState('');
  const [passablePedestrian, setPassablePedestrian] = useState(false);
  const [passableBike, setPassableBike] = useState(false);
  const [passableCar, setPassableCar] = useState(true);
  const [note, setNote] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auto-geolocation on mount
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    setLocationStatus('locating');
    if (!navigator.geolocation) {
      setLocationStatus('fallback');
      setLocation(PILOT_CONFIG.center);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
          accuracy: Math.round(pos.coords.accuracy),
        });
        setLocationStatus('ready');
      },
      (err) => {
        console.warn('Geolocation failed or denied, using pilot center fallback', err);
        setLocation(PILOT_CONFIG.center);
        setLocationStatus('fallback');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleImageSelect = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    setAnalysisError(null);
    setAnalysisResult(null);
    setSubmitSuccess(false);

    try {
      setIsCompressing(true);
      // Client-side resize to max ~1024px width/height per SPEC.md
      const compressed = await compressImage(file, 1024, 0.85);
      setCompressedData(compressed);
      setPreviewUrl(compressed.dataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
      // Fallback to raw object URL
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleAnalyze = async () => {
    if (!compressedData?.base64 && !previewUrl) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Send base64 payload to /api/analyze
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: compressedData?.base64,
          mimeType: compressedData?.mimeType || 'image/jpeg',
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setAnalysisError(data.error === 'analysis_failed' ? 'Could not analyze, try another photo' : (data.error || 'Analysis failed'));
        return;
      }

      setAnalysisResult(data);

      // Pre-fill editable preview with AI-detected assessment values
      setDepthCm(Number(data.depth_cm) || 0);
      setReferenceObject(data.reference_object || 'Unknown reference');
      setPassablePedestrian(Boolean(data.passable_for?.pedestrian));
      setPassableBike(Boolean(data.passable_for?.bike));
      setPassableCar(Boolean(data.passable_for?.car));
    } catch (err) {
      console.error('API call failed:', err);
      setAnalysisError('Could not analyze, try another photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Depth color indicator
  const getDepthColor = (depth) => {
    if (depth < PILOT_CONFIG.depthThresholds.greenMax) return 'text-emerald-400 bg-emerald-950/60 border-emerald-700/50';
    if (depth <= PILOT_CONFIG.depthThresholds.amberMax) return 'text-amber-400 bg-amber-950/60 border-amber-700/50';
    return 'text-rose-400 bg-rose-950/60 border-rose-700/50';
  };

  const getDepthLabel = (depth) => {
    if (depth < PILOT_CONFIG.depthThresholds.greenMax) return 'Minor / Safe (<10cm)';
    if (depth <= PILOT_CONFIG.depthThresholds.amberMax) return 'Moderate / Caution (10-30cm)';
    return 'Severe / Hazard (>30cm)';
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Page Header */}
      <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              Report Street Flooding
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Snap a street photo to estimate water depth with Gemini AI.
            </p>
          </div>
        </div>

        {/* Auto Geolocation Status */}
        <div className="mt-3 flex items-center justify-between bg-slate-950/80 rounded-xl px-3 py-2 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <MapPin
              className={`w-4 h-4 ${
                locationStatus === 'ready'
                  ? 'text-emerald-400'
                  : locationStatus === 'locating'
                  ? 'text-cyan-400 animate-spin'
                  : 'text-amber-400'
              }`}
            />
            <div>
              <span className="text-slate-300 font-medium">
                {locationStatus === 'ready' && `GPS: ${location?.lat}, ${location?.lng}`}
                {locationStatus === 'locating' && 'Detecting your coordinates...'}
                {locationStatus === 'fallback' && `Pilot Area: ${location?.lat}, ${location?.lng}`}
                {locationStatus === 'error' && 'Using pilot center coordinates'}
              </span>
              {location?.accuracy && (
                <span className="text-[10px] text-slate-500 ml-1.5 font-normal">
                  (±{location.accuracy}m)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={fetchLocation}
            className="text-cyan-400 hover:text-cyan-300 text-[11px] font-medium flex items-center gap-1 active:scale-95 transition-transform"
            title="Refresh GPS"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Step 1: Camera Capture Section */}
      <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            1. Street Flood Photo
          </label>
          {compressedData && (
            <span className="text-[10px] text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-full">
              Resized: {compressedData.width}x{compressedData.height} ({compressedData.sizeKb} KB)
            </span>
          )}
        </div>

        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black/60 group shadow-inner">
              <img
                id="captured-image-preview"
                src={previewUrl}
                alt="Flood scene preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex items-end p-3 justify-between">
                <span className="text-xs text-slate-200 bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-slate-700">
                  {selectedFile ? selectedFile.name : 'Sample Street Flood Image'}
                </span>
                <label
                  htmlFor="camera-input-retake"
                  className="cursor-pointer text-xs bg-slate-800 hover:bg-slate-700 text-white font-medium px-3 py-1.5 rounded-lg border border-slate-600 shadow transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Retake Photo
                </label>
                <input
                  id="camera-input-retake"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Analyze Button */}
            <button
              id="btn-analyze"
              onClick={handleAnalyze}
              disabled={isAnalyzing || isCompressing}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isAnalyzing
                  ? 'bg-cyan-800 text-white cursor-wait'
                  : 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30 active:scale-[0.99]'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing
                ? 'Analyzing Depth with Gemini AI...'
                : analysisResult
                ? 'Re-Analyze with Gemini AI'
                : 'Analyze with Gemini AI'}
            </button>
          </div>
        ) : (
          <div>
            <label
              htmlFor="camera-input"
              className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-cyan-800/70 hover:border-cyan-400 rounded-2xl p-7 bg-cyan-950/20 hover:bg-cyan-950/30 transition-all text-center group"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white flex items-center justify-center mb-3 shadow-lg shadow-cyan-600/30 group-hover:scale-105 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold text-slate-100">
                Snap or Upload Street Photo
              </span>
              <span className="text-xs text-slate-400 mt-1 max-w-xs">
                Take a photo showing reference objects: car tyres (~65cm), street curb (~15cm), or ankle/knee.
              </span>
              <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[11px] bg-slate-800 text-cyan-300 border border-slate-700">
                <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
                Auto-resized to ~1024px (&lt; 4 MB)
              </span>

              {/* Native camera capture tag explicitly specified in SPEC.md Section 5 */}
              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Analysis Failure State per SPEC.md */}
        {analysisError && (
          <div
            id="analysis-error-banner"
            className="mt-3 p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-200 animate-shake"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">{analysisError}</span>
              <span className="text-[11px] text-rose-300/80">
                Ensure the street scene is clearly visible with water reflections or street objects.
              </span>
            </div>
            <button
              onClick={handleAnalyze}
              className="text-[11px] font-bold text-rose-300 underline hover:text-white"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Editable AI Result Preview (SPEC.md Section 5: depth, passability, note) */}
      <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              2. AI Assessment & Review
            </label>
          </div>
          {analysisResult && (
            <span
              id="ai-confidence-badge"
              className="text-[11px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              {Math.round(analysisResult.confidence * 100)}% Confidence
            </span>
          )}
        </div>

        {/* Non-flood warning if Gemini flags is_flood as false */}
        {analysisResult && !analysisResult.is_flood && (
          <div className="mb-3 p-3 bg-amber-950/40 border border-amber-500/50 rounded-xl flex items-center gap-2 text-xs text-amber-200">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>AI assessed this scene as having <b>no significant flooding</b>. You can still adjust values manually below.</span>
          </div>
        )}

        {/* Reference Object Identified by Gemini */}
        {referenceObject && (
          <div className="mb-3 px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
            <span className="text-slate-400">Reference Used:</span>
            <span id="reference-object-text" className="text-cyan-300 font-semibold">{referenceObject}</span>
          </div>
        )}

        {/* Water Depth Slider & Input */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">Water Depth</span>
            <div className="flex items-center gap-2">
              <input
                id="input-depth-number"
                type="number"
                min="0"
                max="150"
                value={depthCm}
                onChange={(e) => setDepthCm(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs text-slate-400">cm</span>
            </div>
          </div>

          <input
            id="input-depth-slider"
            type="range"
            min="0"
            max="100"
            value={depthCm}
            onChange={(e) => setDepthCm(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />

          {/* Depth status pill */}
          <div className="flex items-center justify-between pt-1">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getDepthColor(depthCm)}`}>
              {getDepthLabel(depthCm)}
            </span>
            <span className="text-[10px] text-slate-500">
              Curb ~15cm | Tyre ~65cm
            </span>
          </div>
        </div>

        {/* Passability Checkboxes (SPEC.md: pedestrian, bike, car) */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 mb-3">
          <span className="text-xs text-slate-300 font-semibold block mb-2.5">
            Passable For (Tap to toggle):
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* Pedestrians */}
            <button
              type="button"
              id="toggle-passable-pedestrian"
              onClick={() => setPassablePedestrian(!passablePedestrian)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                passablePedestrian
                  ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Footprints className="w-4 h-4 mb-1" />
              <span className="text-[11px] font-semibold">Pedestrian</span>
              <span className="text-[10px] font-bold mt-0.5">
                {passablePedestrian ? 'PASSABLE' : 'BLOCKED'}
              </span>
            </button>

            {/* Bicycles */}
            <button
              type="button"
              id="toggle-passable-bike"
              onClick={() => setPassableBike(!passableBike)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                passableBike
                  ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Bike className="w-4 h-4 mb-1" />
              <span className="text-[11px] font-semibold">Bicycle</span>
              <span className="text-[10px] font-bold mt-0.5">
                {passableBike ? 'PASSABLE' : 'BLOCKED'}
              </span>
            </button>

            {/* Cars */}
            <button
              type="button"
              id="toggle-passable-car"
              onClick={() => setPassableCar(!passableCar)}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                passableCar
                  ? 'bg-emerald-950/50 border-emerald-600/60 text-emerald-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Car className="w-4 h-4 mb-1" />
              <span className="text-[11px] font-semibold">Car</span>
              <span className="text-[10px] font-bold mt-0.5">
                {passableCar ? 'PASSABLE' : 'BLOCKED'}
              </span>
            </button>
          </div>
        </div>

        {/* Optional Note Field */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 mb-3">
          <label htmlFor="input-note" className="text-xs text-slate-300 font-semibold block mb-1.5">
            Street Landmark or Note (Optional)
          </label>
          <input
            id="input-note"
            type="text"
            placeholder="e.g. Near Metro Pillar 124, water covering sidewalk"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Submit Button (Step 2: without saving to Supabase yet) */}
        <button
          id="btn-submit-report"
          onClick={() => setSubmitSuccess(true)}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Submit Flood Report
        </button>

        {/* Step 2 notice when submit is clicked */}
        {submitSuccess && (
          <div
            id="submit-success-notice"
            className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-start gap-2 animate-fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Assessment Validated!</span>
              <span className="text-[11px] text-emerald-300/80">
                Step 2 complete: Depth ({depthCm}cm), passability, and location are ready. Supabase database persistence will be connected in Step 3.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
