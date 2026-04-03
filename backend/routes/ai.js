// routes/ai.js
const express = require('express');
const multer  = require('multer');
const OpenAI  = require('openai');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Store images in memory (base64 for OpenAI)
const storage = multer.memoryStorage();
const upload  = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// ---- POST /api/ai/analyze-food ----
router.post('/analyze-food', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file && !req.body.imageBase64) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Check if OpenAI key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-your')) {
      // Return mock data for testing when OpenAI key is not configured
      return res.json({
        detected: true,
        items: [
          { name: 'Grilled Chicken Breast', calories: 165, protein: 31, carbs: 0,  fat: 3.6, quantity: 150, unit: 'g', confidence: 0.92 },
          { name: 'Brown Rice',             calories: 216, protein: 5,  carbs: 45, fat: 1.8, quantity: 200, unit: 'g', confidence: 0.88 },
          { name: 'Steamed Broccoli',       calories: 55,  protein: 4,  carbs: 11, fat: 0.6, quantity: 150, unit: 'g', confidence: 0.95 },
        ],
        alternatives: [
          'Try quinoa instead of rice for more protein',
          'Add a sprinkle of seeds for healthy fats',
        ],
        totalEstimate: { calories: 436, protein: 40, carbs: 56, fat: 6 },
        note: 'Demo mode: Configure OPENAI_API_KEY for real food detection',
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Convert image to base64
    let imageBase64;
    let mimeType;
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      mimeType    = req.file.mimetype;
    } else {
      // Handle base64 string sent directly
      const match  = req.body.imageBase64.match(/^data:(.+);base64,(.+)$/);
      mimeType     = match ? match[1] : 'image/jpeg';
      imageBase64  = match ? match[2] : req.body.imageBase64;
    }

    const prompt = `Analyze this food image and respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "detected": true,
  "items": [
    {
      "name": "Food Name",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "quantity": 0,
      "unit": "g or piece or ml",
      "confidence": 0.95
    }
  ],
  "alternatives": ["healthier alternative suggestion 1", "suggestion 2"],
  "totalEstimate": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  }
}

Be as accurate as possible with portion sizes. Include all visible food items. Confidence should be 0-1.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}`, detail: 'high' } },
        ],
      }],
    });

    const content = response.choices[0].message.content.trim();

    // Parse JSON response
    let result;
    try {
      result = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
    } catch {
      return res.status(500).json({ message: 'AI returned invalid response, please try again' });
    }

    res.json(result);
  } catch (error) {
    console.error('AI analyze error:', error);
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ message: 'OpenAI quota exceeded. Please check your billing.' });
    }
    res.status(500).json({ message: 'AI analysis failed. Please try again.' });
  }
});

module.exports = router;
