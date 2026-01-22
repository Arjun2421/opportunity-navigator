// Centralized Data Collection Service
// All data fetching, parsing, and KPI calculations happen here

export interface TenderData {
  id: string;
  refNo: string;
  tenderType: string;
  client: string;
  tenderName: string;
  rfpReceivedDate: string | null;
  lead: string;
  value: number;
  avenirStatus: string;
  tenderResult: string;
  tenderStatusRemark: string;
  remarksReason: string;
  isSubmissionNear: boolean;
  year: string;
  rawDateReceived: string;
}

export interface KPIStats {
  activeTenders: number;        // In Progress + Submitted + Awarded
  totalActiveValue: number;     // Sum of value for Awarded
  awardedCount: number;
  awardedValue: number;
  lostCount: number;
  lostValue: number;
  regrettedCount: number;
  regrettedValue: number;
  workingCount: number;
  workingValue: number;
  toStartCount: number;
  toStartValue: number;
  ongoingCount: number;
  ongoingValue: number;
  submissionNearCount: number;
}

export interface FunnelData {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
}

export interface ClientData {
  name: string;
  count: number;
  value: number;
}

// Google Sheets configuration
const GOOGLE_API_KEY = 'AIzaSyCrcexNBXPTaclKhCzkONVwCngRij837j0';
const SPREADSHEET_ID = '1DrnoJDytUd3_2uL5C3yyHT4yX4kleonTXaxiLgPCYK4';
const SHEET_NAME = 'MASTER TENDER LIST AVENIR';

// Column indices (0-based, starting from column B which is index 1)
// Data starts from row 4, column B
const COLUMN_MAP: Record<string, number> = {
  // We'll determine these dynamically from headers
};

// Parse date from Year column and Date Tender Recd column
function parseDate(year: string | null, dateStr: string | null): string | null {
  if (!dateStr || dateStr === '' || dateStr === '-' || dateStr === 'undefined') return null;
  if (!year || year === '' || year === '-') year = new Date().getFullYear().toString();
  
  const cleanDate = dateStr.toString().trim();
  const cleanYear = year.toString().trim();
  
  // Handle various date formats like "6-May", "15-Jul", "23 May", "May 6"
  const monthMap: Record<string, string> = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12'
  };
  
  // Try DD-Mon or DD Mon format (e.g., "6-May", "15 Jul")
  const dayMonthMatch = cleanDate.match(/^(\d{1,2})[\s-](\w+)$/i);
  if (dayMonthMatch) {
    const day = dayMonthMatch[1].padStart(2, '0');
    const monthKey = dayMonthMatch[2].toLowerCase();
    const month = monthMap[monthKey] || monthMap[monthKey.substring(0, 3)];
    if (month) {
      return `${cleanYear}-${month}-${day}`;
    }
  }
  
  // Try Mon DD format (e.g., "May 6", "Jul 15")
  const monthDayMatch = cleanDate.match(/^(\w+)[\s-](\d{1,2})$/i);
  if (monthDayMatch) {
    const monthKey = monthDayMatch[1].toLowerCase();
    const month = monthMap[monthKey] || monthMap[monthKey.substring(0, 3)];
    const day = monthDayMatch[2].padStart(2, '0');
    if (month) {
      return `${cleanYear}-${month}-${day}`;
    }
  }
  
  // Try DD/MM or MM/DD format
  const slashMatch = cleanDate.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (slashMatch) {
    const first = parseInt(slashMatch[1]);
    const second = parseInt(slashMatch[2]);
    // Assume DD/MM if first > 12
    if (first > 12) {
      return `${cleanYear}-${second.toString().padStart(2, '0')}-${first.toString().padStart(2, '0')}`;
    }
    // Otherwise assume MM/DD
    return `${cleanYear}-${first.toString().padStart(2, '0')}-${second.toString().padStart(2, '0')}`;
  }
  
  return null;
}

// Check if submission is near (within 7 days of received date)
function isSubmissionNear(rfpDate: string | null): boolean {
  if (!rfpDate) return false;
  
  const received = new Date(rfpDate);
  const today = new Date();
  const oneWeekAfterReceived = new Date(received);
  oneWeekAfterReceived.setDate(received.getDate() + 7);
  
  // If today is within a week after received date
  const diffDays = Math.ceil((oneWeekAfterReceived.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
}

// Normalize status values
function normalizeStatus(status: string | null): string {
  if (!status) return '';
  return status.toString().trim().toUpperCase();
}

// Get unique status (handle duplicate AVENIR STATUS and TENDER RESULT)
function getUniqueStatus(avenirStatus: string, tenderResult: string): { avenir: string; tender: string } {
  const normalAvenir = normalizeStatus(avenirStatus);
  const normalTender = normalizeStatus(tenderResult);
  
  // If they are the same, count only one
  if (normalAvenir === normalTender) {
    return { avenir: normalAvenir, tender: '' };
  }
  
  return { avenir: normalAvenir, tender: normalTender };
}

// Fetch data from Google Sheets
export async function fetchGoogleSheetsData(): Promise<TenderData[]> {
  try {
    // Fetch data starting from row 4 (index 3), including headers from row 3
    const range = `${SHEET_NAME}!A3:Z1000`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheets data: ${response.statusText}`);
    }
    
    const data = await response.json();
    const rows: string[][] = data.values || [];
    
    if (rows.length < 2) {
      console.warn('No data found in Google Sheet');
      return [];
    }
    
    // First row is headers (row 3 in sheet)
    const headers = rows[0].map(h => h?.toString().trim().toUpperCase() || '');
    
    // Find column indices
    const findColumn = (keywords: string[]): number => {
      return headers.findIndex(h => keywords.some(k => h.includes(k.toUpperCase())));
    };
    
    const colIndices = {
      tenderNo: findColumn(['TENDER NO', 'TENDER NUMBER', 'REF NO', 'REF. NO']),
      tenderType: findColumn(['TENDER TYPE', 'TYPE']),
      client: findColumn(['CLIENT']),
      tenderName: findColumn(['TENDER NAME', 'NAME', 'DESCRIPTION']),
      year: findColumn(['YEAR']),
      dateReceived: findColumn(['DATE TENDER RECD', 'DATE RECEIVED', 'RFP RECEIVED', 'TENDER RECEIVED']),
      lead: findColumn(['LEAD', 'INTERNAL LEAD', 'ASSIGNED']),
      value: findColumn(['TENDER VALUE', 'VALUE', 'OPPORTUNITY VALUE']),
      avenirStatus: findColumn(['AVENIR STATUS']),
      tenderResult: findColumn(['TENDER RESULT']),
      tenderStatus: findColumn(['TENDER STATUS']),
      remarks: findColumn(['REMARKS', 'REASON', 'REMARKS/REASON']),
    };
    
    console.log('Column indices found:', colIndices);
    console.log('Headers:', headers);
    
    // Parse data rows (starting from index 1, which is row 4 in sheet)
    const tenders: TenderData[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      // Skip empty rows
      const hasContent = row.some(cell => cell && cell.toString().trim() !== '');
      if (!hasContent) continue;
      
      const getValue = (colIdx: number): string => {
        if (colIdx < 0 || colIdx >= row.length) return '';
        return row[colIdx]?.toString().trim() || '';
      };
      
      const getNumericValue = (colIdx: number): number => {
        const val = getValue(colIdx).replace(/[^0-9.-]/g, '');
        return parseFloat(val) || 0;
      };
      
      const year = getValue(colIndices.year);
      const dateReceived = getValue(colIndices.dateReceived);
      const rfpReceivedDate = parseDate(year, dateReceived);
      
      const tender: TenderData = {
        id: `tender-${i}`,
        refNo: getValue(colIndices.tenderNo),
        tenderType: getValue(colIndices.tenderType),
        client: getValue(colIndices.client),
        tenderName: getValue(colIndices.tenderName),
        rfpReceivedDate,
        lead: getValue(colIndices.lead),
        value: getNumericValue(colIndices.value),
        avenirStatus: getValue(colIndices.avenirStatus),
        tenderResult: getValue(colIndices.tenderResult),
        tenderStatusRemark: getValue(colIndices.tenderStatus),
        remarksReason: getValue(colIndices.remarks),
        isSubmissionNear: isSubmissionNear(rfpReceivedDate),
        year,
        rawDateReceived: dateReceived,
      };
      
      // Only include rows that have at least a reference number or client
      if (tender.refNo || tender.client || tender.tenderName) {
        tenders.push(tender);
      }
    }
    
    console.log(`Parsed ${tenders.length} tenders from Google Sheets`);
    return tenders;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

// Calculate KPI statistics from tender data
export function calculateKPIStats(data: TenderData[]): KPIStats {
  const stats: KPIStats = {
    activeTenders: 0,
    totalActiveValue: 0,
    awardedCount: 0,
    awardedValue: 0,
    lostCount: 0,
    lostValue: 0,
    regrettedCount: 0,
    regrettedValue: 0,
    workingCount: 0,
    workingValue: 0,
    toStartCount: 0,
    toStartValue: 0,
    ongoingCount: 0,
    ongoingValue: 0,
    submissionNearCount: 0,
  };
  
  // Track counted items to avoid double counting
  const countedForActive = new Set<string>();
  
  data.forEach(tender => {
    const { avenir, tender: tenderResult } = getUniqueStatus(tender.avenirStatus, tender.tenderResult);
    
    // Active Tenders = In Progress + Submitted + Awarded (from AVENIR STATUS or TENDER RESULT)
    const isInProgress = avenir === 'WORKING' || avenir === 'ONGOING' || tenderResult === 'ONGOING';
    const isSubmitted = avenir === 'SUBMITTED';
    const isAwarded = avenir === 'AWARDED' || tenderResult === 'AWARDED';
    
    if (isInProgress || isSubmitted || isAwarded) {
      if (!countedForActive.has(tender.id)) {
        stats.activeTenders++;
        countedForActive.add(tender.id);
      }
    }
    
    // Total Active Value = Sum of value for AWARDED
    if (isAwarded) {
      stats.totalActiveValue += tender.value;
    }
    
    // Count by status - AVENIR STATUS
    switch (avenir) {
      case 'AWARDED':
        stats.awardedCount++;
        stats.awardedValue += tender.value;
        break;
      case 'LOST':
        stats.lostCount++;
        stats.lostValue += tender.value;
        break;
      case 'REGRETTED':
        stats.regrettedCount++;
        stats.regrettedValue += tender.value;
        break;
      case 'WORKING':
        stats.workingCount++;
        stats.workingValue += tender.value;
        break;
      case 'TO START':
        stats.toStartCount++;
        stats.toStartValue += tender.value;
        break;
    }
    
    // Count ONGOING from TENDER RESULT if not already counted in AVENIR STATUS
    if (tenderResult === 'ONGOING' && avenir !== 'WORKING' && avenir !== 'ONGOING') {
      stats.ongoingCount++;
      stats.ongoingValue += tender.value;
    } else if (avenir === 'ONGOING' || avenir === 'WORKING') {
      // Combine WORKING and ONGOING as ONGOING
      stats.ongoingCount++;
      stats.ongoingValue += tender.value;
      // Reduce from working if we counted it there
      if (avenir === 'WORKING') {
        stats.workingCount--;
        stats.workingValue -= tender.value;
      }
    }
    
    // Submission Near
    if (tender.isSubmissionNear) {
      stats.submissionNearCount++;
    }
  });
  
  // Ensure no negative counts
  stats.workingCount = Math.max(0, stats.workingCount);
  stats.workingValue = Math.max(0, stats.workingValue);
  
  return stats;
}

// Calculate funnel data
export function calculateFunnelData(data: TenderData[]): FunnelData[] {
  const stages = ['TO START', 'WORKING', 'SUBMITTED', 'AWARDED'];
  const stageData: Record<string, { count: number; value: number }> = {};
  
  stages.forEach(stage => {
    stageData[stage] = { count: 0, value: 0 };
  });
  
  data.forEach(tender => {
    const status = normalizeStatus(tender.avenirStatus);
    
    if (status === 'TO START') {
      stageData['TO START'].count++;
      stageData['TO START'].value += tender.value;
    } else if (status === 'WORKING' || status === 'ONGOING') {
      stageData['WORKING'].count++;
      stageData['WORKING'].value += tender.value;
    } else if (status === 'SUBMITTED') {
      stageData['SUBMITTED'].count++;
      stageData['SUBMITTED'].value += tender.value;
    } else if (status === 'AWARDED') {
      stageData['AWARDED'].count++;
      stageData['AWARDED'].value += tender.value;
    }
  });
  
  // Calculate conversion rates
  const funnel: FunnelData[] = stages.map((stage, index) => {
    const current = stageData[stage];
    const previous = index > 0 ? stageData[stages[index - 1]] : null;
    const conversionRate = previous && previous.count > 0 
      ? Math.round((current.count / previous.count) * 100) 
      : 100;
    
    return {
      stage,
      count: current.count,
      value: current.value,
      conversionRate,
    };
  });
  
  return funnel;
}

// Get client leaderboard data
export function getClientData(data: TenderData[]): ClientData[] {
  const clientMap: Record<string, { count: number; value: number }> = {};
  
  data.forEach(tender => {
    if (!tender.client) return;
    
    if (!clientMap[tender.client]) {
      clientMap[tender.client] = { count: 0, value: 0 };
    }
    
    clientMap[tender.client].count++;
    clientMap[tender.client].value += tender.value;
  });
  
  return Object.entries(clientMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

// Get submission near tenders
export function getSubmissionNearTenders(data: TenderData[]): TenderData[] {
  return data
    .filter(t => t.isSubmissionNear)
    .sort((a, b) => {
      const dateA = a.rfpReceivedDate ? new Date(a.rfpReceivedDate).getTime() : 0;
      const dateB = b.rfpReceivedDate ? new Date(b.rfpReceivedDate).getTime() : 0;
      return dateA - dateB;
    })
    .slice(0, 8);
}

// Convert TenderData to legacy Opportunity format for compatibility
export function convertToOpportunityFormat(tender: TenderData): any {
  return {
    id: tender.id,
    opportunityRefNo: tender.refNo,
    tenderNo: tender.refNo,
    tenderName: tender.tenderName,
    clientName: tender.client,
    clientType: '',
    clientLead: tender.lead,
    opportunityClassification: tender.tenderType,
    opportunityStatus: tender.avenirStatus,
    canonicalStage: tender.avenirStatus,
    qualificationStatus: '',
    groupClassification: '',
    domainSubGroup: '',
    internalLead: tender.lead,
    opportunityValue: tender.value,
    opportunityValue_imputed: false,
    opportunityValue_imputation_reason: '',
    probability: 0,
    probability_imputed: false,
    probability_imputation_reason: '',
    expectedValue: tender.value,
    dateTenderReceived: tender.rfpReceivedDate,
    tenderPlannedSubmissionDate: null,
    tenderPlannedSubmissionDate_imputed: false,
    tenderPlannedSubmissionDate_imputation_reason: '',
    tenderSubmittedDate: null,
    lastContactDate: null,
    lastContactDate_imputed: false,
    lastContactDate_imputation_reason: '',
    daysSinceTenderReceived: 0,
    daysToPlannedSubmission: 0,
    agedDays: 0,
    willMissDeadline: false,
    isAtRisk: tender.isSubmissionNear,
    partnerInvolvement: false,
    partnerName: '',
    country: '',
    remarks: tender.remarksReason,
    awardStatus: tender.tenderResult,
    // New fields for display
    avenirStatus: tender.avenirStatus,
    tenderResult: tender.tenderResult,
    tenderStatusRemark: tender.tenderStatusRemark,
    remarksReason: tender.remarksReason,
  };
}
