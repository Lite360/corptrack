/**
 * State Code Parser Utility for CorpTrack
 * Format example: OS/26A1/1502
 * Deployment State: OS -> Osun
 * Deployment Year: 26 -> 2026
 * Batch: A
 * Stream: 1
 * Member Number: 1502
 */

export interface ParsedStateCode {
  raw: string;
  isValid: boolean;
  deploymentStateCode?: string;
  deploymentStateName?: string;
  deploymentYear?: string; // "2026"
  batch?: 'A' | 'B' | 'C';
  stream?: '1' | '2';
  batchStream?: string; // "A1"
  memberNumber?: string;
  errorMessage?: string;
}

const STATE_MAP: Record<string, string> = {
  AB: 'Abia', AD: 'Adamawa', AK: 'Akwa Ibom', AN: 'Anambra', BA: 'Bauchi',
  BY: 'Bayelsa', BE: 'Benue', BO: 'Borno', CR: 'Cross River', DE: 'Delta',
  EB: 'Ebonyi', ED: 'Edo', EK: 'Ekiti', EN: 'Enugu', FC: 'FCT Abuja',
  GO: 'Gombe', IM: 'Imo', JI: 'Jigawa', KD: 'Kaduna', KN: 'Kano',
  KT: 'Katsina', KE: 'Kebbi', KO: 'Kogi', KW: 'Kwara', LA: 'Lagos',
  NA: 'Nasarawa', NI: 'Niger', OG: 'Ogun', ON: 'Ondo', OS: 'Osun',
  OY: 'Oyo', PL: 'Plateau', RI: 'Rivers', SO: 'Sokoto', TA: 'Taraba',
  YO: 'Yobe', ZA: 'Zamfara'
};

export function parseStateCode(input: string): ParsedStateCode {
  const cleanInput = input.trim().toUpperCase();
  if (!cleanInput) {
    return { raw: input, isValid: false, errorMessage: 'State code is required' };
  }

  // Regex pattern matching: State (2 letters) / Year (2 digits) Batch (A-C) Stream (1-2) / Member Number (1-6 digits)
  // e.g. OS/26A1/1502 or LA/25B2/0049
  const pattern = /^([A-Z]{2})\/(\d{2})([A-C])([1-2])\/(\d{1,6})$/;
  const match = cleanInput.match(pattern);

  if (!match) {
    return {
      raw: cleanInput,
      isValid: false,
      errorMessage: 'Invalid format. Expected format: XX/YYBS/1234 (e.g. OS/26A1/1502)'
    };
  }

  const [, stateCode, yearDigits, batchLetter, streamDigit, numberDigits] = match;
  const stateName = STATE_MAP[stateCode] || stateCode;
  const fullYear = `20${yearDigits}`;
  const batchStream = `${batchLetter}${streamDigit}`;

  return {
    raw: cleanInput,
    isValid: true,
    deploymentStateCode: stateCode,
    deploymentStateName: stateName,
    deploymentYear: fullYear,
    batch: batchLetter as 'A' | 'B' | 'C',
    stream: streamDigit as '1' | '2',
    batchStream,
    memberNumber: numberDigits
  };
}
