import dotenv from 'dotenv';
dotenv.config();

const SYSTEM_PROMPT = `You are a flood assessment assistant. Look at this street photo. Decide if it shows real street flooding. Estimate water depth in cm using reference objects (car tyre ~65cm tall, curb ~15cm, knee ~50cm, ankle ~10cm). Say which reference you used. Say whether pedestrians, bikes and cars could pass. If the image is not a real street scene, looks edited, or is unclear, set is_flood to false and lower the confidence. Return JSON only.`;

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
      is_flood: false,
      confidence: 0,
      error: 'GEMINI_API_KEY is not configured on server',
    });
  }

  try {
    const { imageBase64, mimeType } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({
        is_flood: false,
        confidence: 0,
        error: 'Missing imageBase64 in request body',
      });
    }

    // Reject images over 4 MB per SPEC.md line 52
    // Base64 size estimation: (length * 3) / 4 bytes
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    const estimatedSizeBytes = (cleanBase64.length * 3) / 4;
    const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

    if (estimatedSizeBytes > MAX_SIZE_BYTES) {
      return res.status(413).json({
        is_flood: false,
        confidence: 0,
        error: 'Image exceeds 4 MB limit',
      });
    }

    // Determine mimeType
    let detectedMimeType = mimeType || 'image/jpeg';
    if (imageBase64.startsWith('data:image/png')) detectedMimeType = 'image/png';
    else if (imageBase64.startsWith('data:image/webp')) detectedMimeType = 'image/webp';
    else if (imageBase64.startsWith('data:image/jpeg') || imageBase64.startsWith('data:image/jpg')) detectedMimeType = 'image/jpeg';

    // Model selection with fallback support
    const modelsToTry = ['gemini-3.8-flash', 'gemini-2.5-flash'];
    let geminiResponse = null;
    let lastError = null;

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
          // Never log or print the API key
          const safeErr = errText.replace(new RegExp(apiKey, 'g'), '[REDACTED_KEY]');
          console.warn(`Model ${model} returned HTTP ${response.status}:`, safeErr);
          lastError = safeErr;
        }
      } catch (callErr) {
        console.warn(`Call to ${model} threw error:`, callErr.message);
        lastError = callErr.message;
      }
    }

    if (!geminiResponse) {
      console.error('All Gemini model calls failed or returned empty text');
      return res.status(200).json({
        is_flood: false,
        confidence: 0,
        error: 'analysis_failed',
      });
    }

    // Parse structured JSON response
    let parsed;
    try {
      parsed = JSON.parse(geminiResponse.trim());
    } catch (parseErr) {
      console.warn('Failed to parse Gemini output as JSON:', parseErr.message);
      // Attempt to extract JSON substring if wrapped in markdown
      const match = geminiResponse.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          return res.status(200).json({
            is_flood: false,
            confidence: 0,
            error: 'analysis_failed',
          });
        }
      } else {
        return res.status(200).json({
          is_flood: false,
          confidence: 0,
          error: 'analysis_failed',
        });
      }
    }

    // Validate required schema per SPEC.md:
    // {
    //   "is_flood": boolean,
    //   "depth_cm": integer,
    //   "reference_object": string,
    //   "passable_for": { "pedestrian": boolean, "bike": boolean, "car": boolean },
    //   "confidence": number
    // }
    if (typeof parsed !== 'object' || parsed === null) {
      return res.status(200).json({
        is_flood: false,
        confidence: 0,
        error: 'analysis_failed',
      });
    }

    const validatedResult = {
      is_flood: Boolean(parsed.is_flood),
      depth_cm: Number.isInteger(parsed.depth_cm)
        ? parsed.depth_cm
        : Math.round(Number(parsed.depth_cm) || 0),
      reference_object: typeof parsed.reference_object === 'string' ? parsed.reference_object : 'None detected',
      passable_for: {
        pedestrian: Boolean(parsed.passable_for?.pedestrian),
        bike: Boolean(parsed.passable_for?.bike),
        car: Boolean(parsed.passable_for?.car),
      },
      confidence: typeof parsed.confidence === 'number'
        ? Math.min(Math.max(parsed.confidence, 0), 1)
        : (parsed.is_flood ? 0.75 : 0.2),
    };

    return res.status(200).json(validatedResult);
  } catch (err) {
    console.error('Unhandled error in /api/analyze:', err.message);
    return res.status(200).json({
      is_flood: false,
      confidence: 0,
      error: 'analysis_failed',
    });
  }
}
