/**
 * Enhanced weight parsing that works with smart OCR detection
 * @param text - OCR result text (may already contain formatted weight)
 * @returns Parsed weight value or null if no valid weight found
 */
export function parseWeight(text: string): number | null {
  if (!text) return null;

  console.log('🔢 Parsing weight from text:', text);

  // Check if text already contains formatted weight from smart OCR
  const smartWeightMatch = text.match(/Weight:\s*(\d+\.?\d*)\s*kg/i);
  if (smartWeightMatch) {
    const weight = parseFloat(smartWeightMatch[1]);
    console.log('✅ Found smart OCR weight:', weight, 'from:', smartWeightMatch[0]);
    return isNaN(weight) ? null : weight;
  }

  // Check for explicit weight patterns
  const explicitPatterns = [
    /(\d+\.?\d*)\s*kg/gi,
    /(\d+\.?\d*)\s*kilograms?/gi,
    /weight[:\s]*(\d+\.?\d*)/gi,
    /(\d+\.?\d*)\s*lbs?/gi,
  ];

  for (const pattern of explicitPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const numberMatch = matches[0].match(/(\d+\.?\d*)/);
      if (numberMatch) {
        const weight = parseFloat(numberMatch[1]);
        console.log('✅ Found explicit weight pattern:', weight);
        return isNaN(weight) ? null : weight;
      }
    }
  }

  // Fallback: extract all numbers and use smart scoring
  const allNumbers = text.match(/\d+\.?\d*/g);
  if (!allNumbers || allNumbers.length === 0) {
    console.log('❌ No numbers found in text');
    return null;
  }

  console.log('🔍 All detected numbers:', allNumbers);

  // Score each number based on weight likelihood
  const scoredNumbers = allNumbers.map(numStr => {
    const num = parseFloat(numStr);
    let score = 0;

    // Skip invalid numbers
    if (isNaN(num) || num <= 0) return { num, score: -100 };

    // Length scoring - digital scales often show specific patterns
    if (numStr.length >= 4 && numStr.length <= 6) {
      score += 50; // 4-6 digits common for precise scales
    } else if (numStr.length >= 2 && numStr.length <= 3) {
      score += 30; // 2-3 digits for simple weights
    }

    // Range scoring - reasonable weight ranges
    if (num >= 0.1 && num <= 1000) {
      score += 40; // Most common weight range
    } else if (num > 1000 && num <= 99999) {
      score += 20; // High precision scales (need decimal formatting)
    }

    // Decimal presence
    if (numStr.includes('.')) {
      score += 20; // Explicit decimal is likely a weight
    }

    return { num, score, original: numStr };
  });

  // Filter and sort by score
  const validNumbers = scoredNumbers
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  console.log('📊 Scored numbers:', validNumbers);

  if (validNumbers.length === 0) {
    console.log('❌ No valid weight candidates found');
    return null;
  }

  const bestCandidate = validNumbers[0];
  console.log('✅ Best weight candidate:', bestCandidate);

  return bestCandidate.num;
}

/**
 * Format weight for display with smart precision
 * @param weight - Weight value
 * @param unit - Unit of measurement (default: "kg")
 * @returns Formatted weight string
 */
export function formatWeight(weight: number | null, unit: string = "kg"): string {
  if (weight === null || weight === undefined) return "N/A";
  
  // Smart formatting based on value
  if (weight < 10) {
    return `${weight.toFixed(3)} ${unit}`; // 3 decimal places for small weights
  } else if (weight < 100) {
    return `${weight.toFixed(2)} ${unit}`; // 2 decimal places for medium weights
  } else {
    return `${weight.toFixed(1)} ${unit}`; // 1 decimal place for large weights
  }
}