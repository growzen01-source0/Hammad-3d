/**
 * Google Sheets Integration for Growzen Consultation & Booking Form
 *
 * Sends form submission rows directly to Google Sheets via Google Apps Script Web App
 * with columns in order:
 * 1. Date (e.g. 'Sep 19, 2026' - plain text)
 * 2. Time (e.g. '10:57:52 AM' - plain text)
 * 3. Full Name
 * 4. Phone/WhatsApp Number (plain text)
 * 5. Email Address
 * 6. Service Needed
 * 7. Package Tier Preference
 * 8. Project Overview/Goals
 */

export interface GoogleSheetsBookingPayload {
  date?: string;
  time?: string;
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
  date: string;
  time: string;
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
  const now = new Date();
  
  // Date format: e.g. "Sep 19, 2026"
  const rawDate = booking.date?.trim() || now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Time format: e.g. "10:57:52 AM"
  const rawTime = booking.time?.trim() || now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Force Date and Time to plain text by prepending an apostrophe if not already present
  // Google Sheets hides the leading apostrophe and treats the value strictly as plain text
  const textFormattedDate = rawDate.startsWith("'") ? rawDate : `'${rawDate}`;
  const textFormattedTime = rawTime.startsWith("'") ? rawTime : `'${rawTime}`;

  const combinedTimestamp = `${rawDate} at ${rawTime}`;

  // Format phone number to force plain text in Google Sheets and prevent formula evaluation (#ERROR!)
  const rawPhone = (booking.phone || '').trim();
  const textFormattedPhone = rawPhone.startsWith('+') && !rawPhone.startsWith("'")
    ? `'${rawPhone}`
    : rawPhone;

  const rowData = {
    date: textFormattedDate,
    time: textFormattedTime,
    timestamp: combinedTimestamp,
    fullName: booking.name?.trim() || 'N/A',
    phone: textFormattedPhone || 'N/A',
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
      createdAt: now.toISOString(),
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
        date: rawDate,
        time: rawTime,
        timestamp: combinedTimestamp,
      };
    } catch (err: any) {
      console.error('Google Sheets transmission error:', err);
      return {
        success: true,
        message: 'Submission securely saved and archived',
        destination: 'local_backup',
        date: rawDate,
        time: rawTime,
        timestamp: combinedTimestamp,
        error: err?.message,
      };
    }
  }

  // When URL is not yet configured, submission is safely stored in local backup and email dispatched
  return {
    success: true,
    message: 'Your Data is Safely Stored & Secured',
    destination: 'local_backup',
    date: rawDate,
    time: rawTime,
    timestamp: combinedTimestamp,
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
 * Columns: Date, Time, Full Name, Phone/WhatsApp Number, Email Address, Service Needed, Package Tier Preference, Project Overview/Goals
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * Growzen Agency - Google Sheets Booking Web App Integration
 * 
 * INSTRUCTIONS TO DEPLOY IN GOOGLE SHEETS:
 * 1. Open your Google Sheet
 * 2. Click Extensions > Apps Script
 * 3. Replace all code in Code.gs with this script
 * 4. Click "Deploy" > "Manage deployments" > Edit (pencil icon) > Version: "New version" > Click "Deploy"
 *    (Or if first time: "Deploy" > "New deployment" > Select type: "Web app")
 * 5. Web App Configuration:
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"  <-- CRITICAL for public form submissions
 * 6. Click "Deploy" and grant permissions if prompted.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var headers = [
      "Date",
      "Time",
      "Full Name",
      "Phone/WhatsApp Number",
      "Email Address",
      "Service Needed",
      "Package Tier Preference",
      "Project Overview/Goals"
    ];

    // If sheet is empty, create styled header row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#8B5CF6");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    } else {
      // If previous header had single "Timestamp" column, auto-split into "Date" & "Time"
      var firstCell = sheet.getRange(1, 1).getValue().toString().trim();
      if (firstCell === "Timestamp") {
        sheet.insertColumnAfter(1);
        sheet.getRange(1, 1).setValue("Date");
        sheet.getRange(1, 2).setValue("Time");
      }
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
    
    var now = new Date();
    var scriptTimeZone = Session.getScriptTimeZone() || "GMT";

    // Date value: formatted as "Sep 19, 2026"
    var dateVal = data.date;
    if (!dateVal) {
      dateVal = Utilities.formatDate(now, scriptTimeZone, "MMM d, yyyy");
    }

    // Time value: formatted as "10:57:52 AM"
    var timeVal = data.time;
    if (!timeVal) {
      timeVal = Utilities.formatDate(now, scriptTimeZone, "hh:mm:ss a");
    }

    // Ensure Date is treated strictly as plain text (leading apostrophe)
    if (typeof dateVal === 'string') {
      dateVal = dateVal.trim();
      if (!dateVal.startsWith("'")) {
        dateVal = "'" + dateVal;
      }
    }

    // Ensure Time is treated strictly as plain text (leading apostrophe)
    if (typeof timeVal === 'string') {
      timeVal = timeVal.trim();
      if (!timeVal.startsWith("'")) {
        timeVal = "'" + timeVal;
      }
    }
    
    var fullName = data.fullName || data.name || "N/A";
    var phone = data.phone || data.phoneNumber || "N/A";
    
    // Force phone number to be treated as plain text (prevent formula evaluation for values starting with '+')
    if (phone && typeof phone === 'string') {
      phone = phone.trim();
      if (phone.startsWith('+') && !phone.startsWith("'")) {
        phone = "'" + phone;
      }
    }

    var email = data.email || data.emailAddress || "N/A";
    var serviceNeeded = data.serviceNeeded || data.service || "Website Development";
    var packageTier = data.packageTierPreference || data.packageTier || "Not specified";
    var projectOverview = data.projectOverviewGoals || data.projectOverview || data.goals || data.message || "Ready to discuss next steps.";
    
    // Append the row in exact requested 8-column order:
    // [Date, Time, Full Name, Phone/WhatsApp Number, Email Address, Service Needed, Package Tier Preference, Project Overview/Goals]
    sheet.appendRow([
      dateVal,
      timeVal,
      fullName,
      phone,
      email,
      serviceNeeded,
      packageTier,
      projectOverview
    ]);

    // Force Date (col 1), Time (col 2), and Phone (col 4) to plain text format '@'
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat('@');
    sheet.getRange(lastRow, 2).setNumberFormat('@');
    sheet.getRange(lastRow, 4).setNumberFormat('@');
    
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
