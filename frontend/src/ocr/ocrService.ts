import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { analyzeImageForWeights, extractWeightFromAnalysis, getSmartWeightSuggestions } from './clientOcrService';

interface OCRResult {
  text: string;
}

/**
 * OCR.space API with timeout and better handling
 */
async function recognizeWithOCRSpace(base64Image: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2');

    console.log('🌐 Calling OCR.space API...');
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': 'helloworld',
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API response not OK: ${response.status}`);
    }

    const result = await response.json();
    console.log('📥 OCR.space response:', JSON.stringify(result, null, 2));
    
    if (result.ParsedResults?.[0]?.ParsedText) {
      const text = result.ParsedResults[0].ParsedText.trim();
      if (text.length > 0) {
        return text;
      }
    }
    
    if (result.ErrorMessage && result.ErrorMessage !== '') {
      throw new Error(`OCR.space error: ${result.ErrorMessage}`);
    }
    
    throw new Error('No text detected by OCR.space');
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('OCR request timed out');
    }
    console.warn('OCR.space API failed:', error);
    throw error;
  }
}

/**
 * Alternative OCR using Google Cloud Vision API (requires API key)
 */
async function recognizeWithGoogleVision(base64Image: string): Promise<string> {
  // This would require a Google Cloud API key
  // For now, we'll skip this implementation
  throw new Error('Google Vision API not configured');
}

/**
 * Smart weight extraction from OCR text - prioritizes large numbers that look like scale readings
 */
function extractWeightFromText(text: string): string | null {
  console.log('🔍 Analyzing OCR text for weight patterns:', text);
  
  // Clean the text - remove extra whitespace and normalize
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Extract ALL numbers from the text (including multi-digit ones)
  const allNumbers: string[] = cleanText.match(/\d+\.?\d*/g) || [];
  console.log('📊 All detected numbers:', allNumbers);
  
  if (allNumbers.length === 0) {
    return null;
  }
  
  // Convert to numbers and analyze them
  const numberAnalysis = allNumbers.map((numStr: string) => {
    const num = parseFloat(numStr);
    const originalStr: string = numStr;
    
    // Score each number based on likelihood of being a weight
    let score = 0;
    
    // 1. Length scoring - scale displays usually show 4-5 digits
    if (originalStr.length >= 4 && originalStr.length <= 6) {
      score += 50; // High score for typical scale display length
    } else if (originalStr.length >= 2 && originalStr.length <= 3) {
      score += 30; // Medium score for shorter weights
    }
    
    // 2. Value range scoring - reasonable weight ranges
    if (num >= 1 && num <= 99999) {
      score += 30; // Reasonable scale range
    }
    
    // 3. Position scoring - first large numbers are often the main reading
    const position = allNumbers.indexOf(originalStr);
    if (position === 0) {
      score += 20; // Bonus for being first
    }
    
    // 4. Pattern context scoring - avoid obvious non-weight numbers
    const lowerText = cleanText.toLowerCase();
    if (lowerText.includes('since') || lowerText.includes('year') || lowerText.includes('199')) {
      if (originalStr.includes('199')) {
        score -= 100; // Heavy penalty for year-like numbers
      }
    }
    
    // 5. Scale-like context bonus
    if (lowerText.includes('digital sca') || lowerText.includes('weigh') || lowerText.includes('scale')) {
      score += 10;
    }
    
    return {
      original: originalStr,
      value: num,
      score: score,
      formatted: formatScaleReading(originalStr)
    };
  });
  
  console.log('📈 Number analysis:', numberAnalysis);
  
  // Sort by score (highest first)
  const sortedNumbers = numberAnalysis.sort((a, b) => b.score - a.score);
  
  // Take the highest scoring number
  const bestMatch = sortedNumbers[0];
  
  if (bestMatch && bestMatch.score > 0) {
    console.log('✅ Best weight match:', bestMatch);
    return `Weight: ${bestMatch.formatted} kg
Original reading: ${bestMatch.original}
Confidence: ${Math.min(100, Math.round((bestMatch.score / 100) * 100))}%
Method: Smart pattern recognition`;
  }
  
  return null;
}

/**
 * Format scale readings intelligently (handle decimal placement for digital scales)
 */
function formatScaleReading(reading: string): string {
  // Remove any existing decimals first
  const cleanReading = reading.replace(/\./g, '');
  
  // If it's a long number (like 88850), likely needs decimal formatting
  if (cleanReading.length >= 4) {
    // For 4-5 digit numbers, assume last 3 digits are after decimal
    // 88850 -> 88.850
    const integerPart = cleanReading.slice(0, -3);
    const decimalPart = cleanReading.slice(-3);
    return `${integerPart}.${decimalPart}`;
  } 
  // For 3 digit numbers, assume last 1 digit after decimal
  // 125 -> 12.5
  else if (cleanReading.length === 3) {
    const integerPart = cleanReading.slice(0, -1);
    const decimalPart = cleanReading.slice(-1);
    return `${integerPart}.${decimalPart}`;
  }
  // For 1-2 digit numbers, return as is
  else {
    return cleanReading;
  }
}

/**
 * Enhanced mock detection with realistic weight patterns
 */
function detectNumbersInImage(): string {
  // More realistic weight ranges for different scenarios
  const scenarios = [
    { type: 'Personal Item', weights: ['0.5', '1.2', '2.8', '5.1', '7.3'] },
    { type: 'Package', weights: ['10.5', '15.2', '22.8', '28.4', '35.7'] },
    { type: 'Bulk Item', weights: ['45.2', '52.6', '68.9', '73.1', '89.4'] },
  ];
  
  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const randomWeight = randomScenario.weights[Math.floor(Math.random() * randomScenario.weights.length)];
  
  console.log(`📋 Mock detection (${randomScenario.type}): ${randomWeight} kg`);
  
  return `Weight: ${randomWeight} kg
Detected as: ${randomScenario.type}
Confidence: 85%

[DEMO MODE: This is simulated OCR data for testing]`;
}

/**
 * Run OCR on an image and return the extracted text
 * @param uri - Local file URI of the image
 * @returns Extracted text from the image
 */
export async function runOcrOnImage(uri: string): Promise<string> {
  try {
    console.log('🔍 Starting OCR on image:', uri);
    
    // Preprocess image: resize for better OCR
    const manipResult = await manipulateAsync(
      uri,
      [
        { resize: { width: 1000 } }, // Optimal size for API handling
      ],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    console.log('🖼️ Image preprocessed, converting to base64...');

    // Convert to base64
    const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: 'base64' as any,
    });

    console.log(`📏 Base64 length: ${base64.length} characters`);
    
    // Try multiple OCR approaches
    let ocrResult = null;
    
    // 1. Try OCR.space API
    try {
      const rawText = await recognizeWithOCRSpace(base64);
      console.log('✅ OCR.space raw text:', rawText);
      
      // Always try to extract weight from raw OCR text
      const weightText = extractWeightFromText(rawText);
      if (weightText) {
        console.log('✅ Smart weight extraction successful:', weightText);
        return weightText;
      } else {
        console.log('📝 No weight pattern detected, returning raw text:', rawText);
        // Return raw text with a note that it needs manual parsing
        return `Raw OCR Text: ${rawText}

⚠️ No clear weight pattern detected. Please check the manual entry field below.`;
      }
    } catch (ocrError) {
      console.log('⚠️ OCR.space failed:', ocrError.message);
      ocrResult = ocrError.message;
    }
    
    // 2. Try Google Vision API (if configured)
    try {
      const text = await recognizeWithGoogleVision(base64);
      console.log('✅ Google Vision complete:', text);
      return text;
    } catch (visionError) {
      console.log('⚠️ Google Vision failed:', visionError.message);
    }
    
    // 3. Client-side image analysis
    try {
      console.log('🔍 Trying client-side image analysis...');
      const analysis = await analyzeImageForWeights(uri);
      const weightText = extractWeightFromAnalysis(analysis);
      
      if (weightText) {
        console.log('✅ Client-side analysis successful:', weightText);
        return weightText;
      } else {
        console.log('⚠️ No weight detected in client-side analysis');
      }
    } catch (analysisError) {
      console.log('⚠️ Client-side analysis failed:', analysisError.message);
    }
    
    // 4. Enhanced mock detection with suggestions
    console.log('📋 Using enhanced mock detection...');
    const mockText = detectNumbersInImage();
    const suggestions = getSmartWeightSuggestions();
    
    console.log('✅ Mock detection complete with suggestions');
    
    // Include suggestions and error info
    return `${mockText}

📝 QUICK SUGGESTIONS:
${suggestions.join('\n')}

[DEBUG: All OCR methods failed - ${ocrResult}]`;
  } catch (error) {
    console.error('❌ OCR Error:', error);
    throw new Error(`OCR failed: ${error}`);
  }
}

/**
 * Terminate the OCR worker to free up resources (not needed for API-based OCR)
 */
export async function terminateOcrWorker(): Promise<void> {
  console.log('API-based OCR: No cleanup needed');
}