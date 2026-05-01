import type { Transaction } from '@/types/finance'

// Vite uses VITE_ prefix for client-side env vars (not NEXT_PUBLIC_)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.warn('Gemini API key not found. Add VITE_GEMINI_API_KEY to .env.local')
}

// Convert image file to base64 for Gemini API inline_data
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove the data:image/jpeg;base64, prefix — Gemini expects raw base64
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
  })
}

// Detect mime type from file (fallback to jpeg)
export function getMimeType(file: File): string {
  return file.type || 'image/jpeg'
}

export interface BarcodeResult {
  productName: string
  estimatedPrice: number
  category: string
  confidence: 'high' | 'medium' | 'low'
  notes: string
  error?: string
}

export interface ReceiptItem {
  name: string
  price: number
  category: string
  quantity: number
}

export interface ReceiptResult {
  storeName: string
  date: string
  items: ReceiptItem[]
  total: number
  currency: string
  error?: string
}

/**
 * Scan a barcode or product image using Gemini Vision.
 * Sends the image as base64 inline_data to the Gemini 1.5 Flash model,
 * which identifies the product and estimates PKR pricing.
 */
export async function scanBarcode(file: File): Promise<BarcodeResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file')
  }

  const base64 = await fileToBase64(file)
  const mimeType = getMimeType(file)

  // Call Gemini REST API directly with vision capabilities
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a product recognition AI for a Pakistani finance app.
                
Analyze this image carefully. Look for:
- Barcodes (EAN, UPC, QR codes)
- Product packaging
- Price tags
- Product labels

If you find a product or barcode:
1. Identify the product name as specifically as possible
2. Estimate a realistic price in Pakistani Rupees (PKR)
   - Use Pakistani market prices (not US prices)
   - A bottle of water = Rs. 50-80
   - A meal at restaurant = Rs. 300-800  
   - Grocery items = typical Pakistani supermarket prices
3. Choose the most fitting category from ONLY these options:
   Food & Dining, Transportation, Shopping, Entertainment, 
   Healthcare, Utilities, Education, Travel, Other
4. Rate your confidence as high, medium, or low
5. Add any helpful notes

Return ONLY a valid JSON object with NO markdown, NO code blocks, just raw JSON:
{
  "productName": "exact product name",
  "estimatedPrice": 450,
  "category": "Food & Dining",
  "confidence": "high",
  "notes": "any relevant notes"
}

If you cannot detect any product or barcode, return:
{
  "productName": "",
  "estimatedPrice": 0,
  "category": "Other",
  "confidence": "low",
  "notes": "",
  "error": "No product or barcode detected in this image"
}`
              },
              {
                // Gemini inline_data format: send the image directly in the request
                inline_data: {
                  mime_type: mimeType,
                  data: base64
                }
              }
            ]
          }
        ],
        // Low temperature for consistent, deterministic product identification
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 600,
          topP: 0.8,
          topK: 10
        }
      })
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData?.error?.message ||
      `Gemini API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API')
  }

  const rawText = data.candidates[0]?.content?.parts?.[0]?.text || ''

  // Clean the response — Gemini sometimes wraps JSON in markdown code blocks
  const cleanText = rawText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  // Extract the JSON object from the response text
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse AI response. Please try again.')
  }

  const result = JSON.parse(jsonMatch[0]) as BarcodeResult
  return result
}

/**
 * Scan a receipt image using Gemini Vision.
 * Extracts all line items, prices, store name, and date from the receipt.
 * Prices are converted to PKR if in a foreign currency.
 */
export async function scanReceipt(file: File): Promise<ReceiptResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file')
  }

  const base64 = await fileToBase64(file)
  const mimeType = getMimeType(file)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a receipt scanning AI for a Pakistani finance app.

Analyze this receipt image and extract all information.

For each item on the receipt:
- Extract the item name
- Extract the price (convert to PKR if needed)
- Assign a category from ONLY: Food & Dining, Transportation, Shopping, 
  Entertainment, Healthcare, Utilities, Education, Travel, Other
- Note the quantity (default 1 if not shown)

For prices:
- If already in PKR, use as is
- If in USD, multiply by 280
- If in EUR, multiply by 300
- If in GBP, multiply by 350

Return ONLY a valid JSON object with NO markdown, NO code blocks, just raw JSON:
{
  "storeName": "store name or Unknown",
  "date": "YYYY-MM-DD or today's date",
  "items": [
    {
      "name": "item name",
      "price": 450,
      "category": "Food & Dining",
      "quantity": 1
    }
  ],
  "total": 1250,
  "currency": "PKR"
}

If you cannot read the receipt at all, return:
{
  "storeName": "Unknown",
  "date": "",
  "items": [],
  "total": 0,
  "currency": "PKR",
  "error": "Could not read receipt. Please ensure the image is clear and well-lit."
}`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64
                }
              }
            ]
          }
        ],
        // Higher maxOutputTokens for receipts since they can have many items
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000,
          topP: 0.8,
          topK: 10
        }
      })
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      errorData?.error?.message ||
      `Gemini API error: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API')
  }

  const rawText = data.candidates[0]?.content?.parts?.[0]?.text || ''

  const cleanText = rawText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse AI response. Please try again.')
  }

  const result = JSON.parse(jsonMatch[0]) as ReceiptResult
  return result
}
