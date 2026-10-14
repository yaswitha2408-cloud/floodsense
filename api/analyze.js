import dotenv from 'dotenv';
dotenv.config();

export const SYSTEM_PROMPT = `You are a flood assessment assistant. Look at this street photo. Decide if it shows real street flooding. Estimate water depth in cm using reference objects (car tyre ~65cm tall, curb ~15cm, knee ~50cm, ankle ~10cm). Say which reference you used. Say whether pedestrians, bikes and cars could pass. If the image is not a real street scene, looks edited, or is unclear, set is_flood to false and lower the confidence. Return JSON only.`;

export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB per SPEC.md line 52

export const FALLBACK_ANALYSIS_FAILED = Object.freeze({
  is_flood: false,
  confidence: 0,
  error: 'analysis_failed',
});

/**
 * Checks if a base64 encoded image exceeds the size limit (4 MB)
 * @param {string} imageBase64
 * @param {number} [maxBytes]
 * @returns {{ valid: boolean, estimatedBytes: number, error?: string }}
 */
export function checkImageSize(imageBase64, maxBytes = MAX_IMAGE_SIZE_BYTES) {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { valid: false, estimatedBytes: 0, error: 'Missing image data' };
  }
  const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
  const estimatedBytes = Math.round((cleanBase64.length * 3) / 4);

  if (estimatedBytes > maxBytes) {
    return {
      valid: false,
      estimatedBytes,
      error: 'Image exceeds 4 MB limit',
    };
  }

  return { valid: true, estimatedBytes };
}

/**
 * Validates and normalizes Gemini vision output against SPEC.md schema
 * Schema:
 * {
 *   "is_flood": boolean,
 *   "depth_cm": integer,
 *   "reference_object": string,
 *   "passable_for": { "pedestrian": boolean, "bike": boolean, "car": boolean },
 *   "confidence": number
 * }
 * 
 * On any failure, returns { is_flood:false, confidence:0, error:"analysis_failed" }
 * @param {string|object} rawOutput
 * @returns {object}
 */
export function validateAnalyzeOutput(rawOutput) {
  if (!rawOutput) {
    return { ...FALLBACK_ANALYSIS_FAILED };
  }

  let parsed = rawOutput;

  if (typeof rawOutput === 'string') {
    const trimmed = rawOutput.trim();
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      // Attempt to extract JSON from markdown code block or braces
      const match = trimmed.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          return { ...FALLBACK_ANALYSIS_FAILED };
        }
      } else {
        return { ...FALLBACK_ANALYSIS_FAILED };
      }
    }
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ...FALLBACK_ANALYSIS_FAILED };
  }

  // Must have is_flood boolean (or boolean coercible)
  if (typeof parsed.is_flood !== 'boolean' && parsed.is_flood !== 'true' && parsed.is_flood !== 'false') {
    return { ...FALLBACK_ANALYSIS_FAILED };
  }

  const isFlood = parsed.is_flood === true || parsed.is_flood === 'true';

  // depth_cm must be a valid non-negative number
  let depthCm = 0;
  if (parsed.depth_cm !== undefined && parsed.depth_cm !== null) {
    const num = Number(parsed.depth_cm);
    if (!isNaN(num) && num >= 0) {
      depthCm = Math.round(num);
    }
  }

  // reference_object
  const referenceObject = typeof parsed.reference_object === 'string' && parsed.reference_object.trim().length > 0
    ? parsed.reference_object.trim()
    : 'None detected';

  // passable_for must be an object with pedestrian, bike, car
  const passableForRaw = parsed.passable_for;
  const passableFor = {
    pedestrian: Boolean(passableForRaw?.pedestrian),
    bike: Boolean(passableForRaw?.bike),
    car: Boolean(passableForRaw?.car),
  };

  // confidence between 0 and 1
  let confidence = 0;
  if (typeof parsed.confidence === 'number' && !isNaN(parsed.confidence)) {
    confidence = Math.min(Math.max(parsed.confidence, 0), 1);
  } else if (isFlood) {
    confidence = 0.75;
  }

  return {
    is_flood: isFlood,
    depth_cm: depthCm,
    reference_object: referenceObject,
    passable_for: passableFor,
    confidence: Number(confidence.toFixed(2)),
  };
}

export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('Server error: GEMINI_API_KEY is not configured in environment');
    return res.status(500).json({
      ...FALLBACK_ANALYSIS_FAILED,
      error: 'GEMINI_API_KEY is not configured on server',
    });
  }

  try {
    const { imageBase64, mimeType } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        ...FALLBACK_ANALYSIS_FAILED,
        error: 'Missing imageBase64 in request body',
      });
    }

    // Check size limit (4 MB)
    const sizeCheck = checkImageSize(imageBase64, MAX_IMAGE_SIZE_BYTES);
    if (!sizeCheck.valid) {
      return res.status(413).json({
        ...FALLBACK_ANALYSIS_FAILED,
        error: sizeCheck.error,
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    // Determine mimeType
    let detectedMimeType = mimeType || 'image/jpeg';
    if (imageBase64.startsWith('data:image/png')) detectedMimeType = 'image/png';
    else if (imageBase64.startsWith('data:image/webp')) detectedMimeType = 'image/webp';
    else if (imageBase64.startsWith('data:image/jpeg') || imageBase64.startsWith('data:image/jpg')) detectedMimeType = 'image/jpeg';

    // Model selection with fallback support
    const modelsToTry = ['gemini-3.8-flash', 'gemini-2.5-flash'];
    let geminiResponse = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: SYSTEM_PROMPT },
                  {
                    inlineData: {
                      mimeType: detectedMimeType,
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            geminiResponse = candidateText;
            break;
          }
        } else {
          const errText = await response.text();
          const safeErr = errText.replace(new RegExp(apiKey, 'g'), '[REDACTED_KEY]');
          console.warn(`Model ${model} returned HTTP ${response.status}:`, safeErr);
        }
      } catch (callErr) {
        console.warn(`Call to ${model} threw error:`, callErr.message);
      }
    }

    if (!geminiResponse) {
      return res.status(200).json({ ...FALLBACK_ANALYSIS_FAILED });
    }

    const validatedResult = validateAnalyzeOutput(geminiResponse);
    return res.status(200).json(validatedResult);
  } catch (err) {
    console.error('Unhandled error in /api/analyze:', err.message);
    return res.status(200).json({ ...FALLBACK_ANALYSIS_FAILED });
  }
}
