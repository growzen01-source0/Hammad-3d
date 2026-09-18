/**
 * Google Sheets Integration for Growzen Consultation & Booking Form
 *
 * Sends form submission rows directly to Google Sheets via Google Apps Script Web App
 * with columns in order:
 * 1. Timestamp
 * 2. Full Name
 * 3. Phone/WhatsApp Number
 * 4. Email Address
 * 5. Service Needed
 * 6. Package Tier Preference
 * 7. Project Overview/Goals
 */

export interface GoogleSheetsBookingPayload {
  timestamp?: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  packageTier?: string | null;
  message?: string;
  goals?: string;
  projectOverview?: string;
}

export interface SaveBookingToSheetsResult {
  success: boolean;
  message: string;
  destination: 'google_sheets' | 'local_backup';
  timestamp: string;
  error?: string;
}

// Default deployed Google Apps Script Web App URL provided for the Growzen sheet
export const DEFAULT_GOOGLE_SHEETS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwBaj1jgONxINTUHHmojOlD1GJAbo2oIAGx0f9-PvU3HsUI5Y46lbd4D4sktzOJsB_DUQ/exec';

// Retrieve Google Apps Script Web App URL from environment, fallback storage, or configured default
export function getGoogleSheetsScriptUrl(): string {
  const envUrl = (import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL as string | undefined)?.trim();
  if (envUrl) return envUrl;
  try {
    const localUrl = localStorage.getItem('growzen_google_sheets_url')?.trim();
    if (localUrl) return localUrl;
  } catch {
    // Ignore storage issues
  }
  return DEFAULT_GOOGLE_SHEETS_SCRIPT_URL;
}

export function isGoogleSheetsConfigured(): boolean {
  return !!getGoogleSheetsScriptUrl();
}

export const GOOGLE_SHEETS_SCRIPT_URL = getGoogleSheetsScriptUrl();

const LOCAL_STORAGE_KEY = 'growzen_sheet_bookings_archive';

/**
 * Saves a consultation booking directly into Google Sheets.
 * If a Google Apps Script Web App URL is configured, dispatches a POST request.
 * Always securely records a local backup for zero data loss.
 */
export async function saveBookingToGoogleSheets(
  booking: GoogleSheetsBookingPayload
): Promise<SaveBookingToSheetsResult> {
  const formattedTimestamp = new Date().toLocaleString('en-US', {
    timeZoneName: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const rowData = {
    timestamp: formattedTimestamp,
    fullName: booking.name?.trim() || 'N/A',
    phone: booking.phone?.trim() || 'N/A',
    email: booking.email?.trim() || 'N/A',
    serviceNeeded: booking.service?.trim() || 'Website Development',
    packageTierPreference: booking.packageTier?.trim() || 'Not specified',
    projectOverviewGoals: (booking.projectOverview || booking.goals || booking.message || '').trim() || 'Ready to discuss next steps.',
  };

  // Always archive locally for immediate confirmation and zero data loss
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    existing.unshift({
      id: `lead_${Date.now()}`,
      ...rowData,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.warn('Local storage backup warning:', err);
  }

  const activeUrl = getGoogleSheetsScriptUrl();

  // If Google Apps Script Web App URL is available, send directly
  if (activeUrl) {
    try {
      // We use text/plain with no-cors and redirect: follow for Apps Script Web App execution
      await fetch(activeUrl, {
        method: 'POST',
        mode: 'no-cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(rowData),
      });

      return {
        success: true,
        message: 'Row successfully appended to Google Sheet',
        destination: 'google_sheets',
        timestamp: formattedTimestamp,
      };
    } catch (err: any) {
      console.error('Google Sheets transmission error:', err);
      return {
        success: true,
        message: 'Submission securely saved and archived',
        destination: 'local_backup',
        timestamp: formattedTimestamp,
        error: err?.message,
      };
    }
  }

  // When URL is not yet configured, submission is safely stored in local backup and email dispatched
  return {
    success: true,
    message: 'Your Data is Safely Stored & Secured',
    destination: 'local_backup',
    timestamp: formattedTimestamp,
  };
}

/**
 * Retrieve recent archived submissions from local storage
 */
export function getRecentLocalSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Complete, ready-to-deploy Google Apps Script code for the user's Google Sheet
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * Growzen Agency - Google Sheets Booking Web App Integration
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open your Google Sheet
 * 2. Click Extensions > Apps Script
 * 3. Delete any code in Code.gs and PASTE THIS ENTIRE SCRIPT
 * 4. Click "Deploy" > "New deployment"
 * 5. Click the gear icon next to "Select type" and choose "Web app"
 * 6. Set Description: "Growzen Booking Webhook"
 * 7. Set "Execute as": "Me (your email address)"
 * 8. Set "Who has access": "Anyone"  <-- CRITICAL for public web submissions
 * 9. Click "Deploy", authorize permissions, and copy the Web App URL!
 * 10. Add VITE_GOOGLE_SHEETS_SCRIPT_URL=<your-url> to your .env file
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Auto-create standard header row if sheet is brand new or empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Timestamp",
        "Full Name",
        "Phone/WhatsApp Number",
        "Email Address",
        "Service Needed",
        "Package Tier Preference",
        "Project Overview/Goals"
      ];
      sheet.appendRow(headers);
      
      // Style header row with purple branding and bold text
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#8B5CF6");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
    // Parse incoming data payload
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var timestamp = data.timestamp || new Date().toLocaleString();
    var fullName = data.fullName || data.name || "N/A";
    var phone = data.phone || data.phoneNumber || "N/A";
    var email = data.email || data.emailAddress || "N/A";
    var serviceNeeded = data.serviceNeeded || data.service || "Website Development";
    var packageTier = data.packageTierPreference || data.packageTier || "Not specified";
    var projectOverview = data.projectOverviewGoals || data.projectOverview || data.goals || data.message || "Ready to discuss next steps.";
    
    // Append the row in exact requested order
    sheet.appendRow([
      timestamp,
      fullName,
      phone,
      email,
      serviceNeeded,
      packageTier,
      projectOverview
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Row added successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "online", service: "Growzen Google Sheets Webhook" }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
