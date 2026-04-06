// @ts-ignore - pdf-parse has no types
import pdfParse from 'pdf-parse';
import { encoding_for_model } from 'tiktoken';

interface AIReport {
  fileType: string;
  pageCount?: number;
  wordCount: number;
  characterCount: number;
  fileSize: number;
  containsText: boolean;
  preview: string;
  riskScore: number;
  keywords: string[];
  suggestedPrice?: number;
  fileName?: string;
}

export const aiVerification = async (fileBuffer: Buffer, filename: string): Promise<AIReport> => {
  const fileExtension = filename.split('.').pop()?.toLowerCase();
  let text = '';
  let pageCount = 0;
  
  try {
    // Extract text based on file type
    if (fileExtension === 'pdf') {
      const pdfData = await pdfParse(fileBuffer);
      text = pdfData.text;
      pageCount = pdfData.numpages;
    } else if (['txt', 'md', 'json', 'xml', 'csv'].includes(fileExtension || '')) {
      text = fileBuffer.toString('utf-8');
    } else {
      // For binary files, just get metadata
      text = '';
    }
  } catch (error) {
    console.error('Error parsing file:', error);
    text = '';
  }
  
  // Calculate word count
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const characterCount = text.length;
  
  // Extract keywords
  const keywords = extractKeywords(text);
  
  // Calculate risk score
  const riskScore = calculateRiskScore(text, filename);
  
  // Generate preview
  const preview = text.substring(0, 200) + (text.length > 200 ? '...' : '');
  
  // Estimate suggested price based on content
  const suggestedPrice = estimatePrice(wordCount, keywords, fileExtension || '');
  
  return {
    fileType: fileExtension || 'unknown',
    pageCount: pageCount || undefined,
    wordCount,
    characterCount,
    fileSize: fileBuffer.length,
    containsText: text.length > 0,
    preview: preview || 'No preview available',
    riskScore,
    keywords,
    suggestedPrice,
    fileName: filename
  };
};

const extractKeywords = (text: string): string[] => {
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their'
  ]);
  
  const words = text.toLowerCase().split(/\W+/);
  const frequency: Record<string, number> = {};
  
  words.forEach(word => {
    if (word.length > 3 && !commonWords.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
};

const calculateRiskScore = (text: string, filename: string): number => {
  let riskScore = 0;
  
  // Check for scam indicators
  const scamKeywords = [
    'password', 'credit card', 'ssn', 'bank account', 
    'crack', 'hack', 'cvv', 'paypal', 'bitcoin',
    'crypto', 'wallet seed', 'private key'
  ];
  
  scamKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) {
      riskScore += 15;
    }
  });
  
  // Check filename
  const suspiciousNames = ['password', 'secret', 'confidential', 'private'];
  suspiciousNames.forEach(name => {
    if (filename.toLowerCase().includes(name)) {
      riskScore += 10;
    }
  });
  
  // Empty file is suspicious
  if (text.length === 0 && filename.match(/\.(txt|pdf|doc|docx)$/i)) {
    riskScore += 20;
  }
  
  // Too many special characters
  const specialCharCount = (text.match(/[!@#$%^&*()]/g) || []).length;
  if (specialCharCount > 100) {
    riskScore += 10;
  }
  
  return Math.min(riskScore, 100);
};

const estimatePrice = (wordCount: number, keywords: string[], fileType: string): number => {
  let basePrice = 0;
  
  if (fileType === 'pdf') {
    basePrice = Math.ceil(wordCount / 500) * 10; // $10 per 500 words
  } else if (fileType === 'txt' || fileType === 'md') {
    basePrice = Math.ceil(wordCount / 1000) * 5;
  } else if (fileType === 'doc' || fileType === 'docx') {
    basePrice = Math.ceil(wordCount / 500) * 12;
  } else if (fileType === 'jpg' || fileType === 'png' || fileType === 'zip') {
    basePrice = 25; // Default for images or archives
  } else {
    basePrice = 20; // Default for binary files
  }
  
  // Premium for certain keywords
  const premiumKeywords = [
    'contract', 'agreement', 'license', 'source code', 
    'blueprint', 'proposal', 'business plan', 'patent'
  ];
  const hasPremium = keywords.some(k => premiumKeywords.includes(k));
  if (hasPremium) {
    basePrice = basePrice * 1.5;
  }
  
  // Cap the price
  return Math.max(5, Math.min(basePrice, 500));
};