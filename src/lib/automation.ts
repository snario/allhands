/**
 * Automation utilities for weekly slide generation
 * 
 * This module provides utilities for automated slide generation including
 * presentation management, week identification, and execution logging.
 */

import { getDocumentProperty, saveDocumentProperty } from "./googleAppsScript";

/**
 * Generates a week identifier in the format YYYY-WXX
 * @param date Optional date to generate identifier for (defaults to current date)
 * @returns Week identifier string (e.g., "2024-W35")
 */
export function getWeekIdentifier(date?: Date): string {
    const targetDate = date || new Date();
    
    // Get the year
    const year = targetDate.getFullYear();
    
    // Calculate week number (ISO 8601)
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (targetDate.getTime() - firstDayOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Generates a presentation name for the current week
 * @param weekId Optional week identifier (defaults to current week)
 * @returns Presentation name string
 */
export function generatePresentationName(weekId?: string): string {
    const week = weekId || getWeekIdentifier();
    const date = new Date();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `ETHGlobal All Hands - ${month} ${day}, ${year} | ${week}`;
}

/**
 * Finds existing presentations by name pattern
 * @param namePattern Pattern to search for in presentation names
 * @returns Array of presentation objects with id, name, and url
 */
export function findPresentationsByName(namePattern: string): Array<{id: string, name: string, url: string}> {
    try {
        const presentations: Array<{id: string, name: string, url: string}> = [];
        
        // Search in Drive for presentations
        const files = DriveApp.searchFiles(
            `mimeType='application/vnd.google-apps.presentation' and name contains '${namePattern}' and trashed=false`
        );
        
        while (files.hasNext()) {
            const file = files.next();
            presentations.push({
                id: file.getId(),
                name: file.getName(),
                url: file.getUrl()
            });
        }
        
        // Sort by creation date (newest first)
        presentations.sort((a, b) => {
            const fileA = DriveApp.getFileById(a.id);
            const fileB = DriveApp.getFileById(b.id);
            return fileB.getDateCreated().getTime() - fileA.getDateCreated().getTime();
        });
        
        return presentations;
    } catch (error) {
        Logger.log(`Error searching for presentations: ${error.message}`);
        return [];
    }
}

/**
 * Finds or creates a presentation for the current week
 * @param weekId Optional week identifier
 * @param templateId Optional template presentation ID to copy from
 * @param targetFolderId Optional folder ID to create presentation in
 * @returns Presentation object with id, name, url, and isNew flag
 */
export function findOrCreateWeeklyPresentation(
    weekId?: string, 
    templateId?: string,
    targetFolderId?: string
): {presentation: GoogleAppsScript.Slides.Presentation, isNew: boolean, url: string} {
    const week = weekId || getWeekIdentifier();
    const presentationName = generatePresentationName(week);
    
    Logger.log(`Looking for presentation: ${presentationName}`);
    
    // Try to get target folder if specified
    let targetFolder: GoogleAppsScript.Drive.Folder | null = null;
    if (targetFolderId) {
        try {
            targetFolder = DriveApp.getFolderById(targetFolderId);
            Logger.log(`Using target folder: ${targetFolder.getName()}`);
        } catch (error) {
            Logger.log(`Warning: Could not access folder ${targetFolderId}: ${error.message}`);
        }
    }

    // First, try to find existing presentation (prioritize target folder if specified)
    let existingPresentations: Array<{id: string, name: string, url: string}> = [];
    
    if (targetFolder) {
        // Search within the specific folder
        const files = targetFolder.getFilesByType(MimeType.GOOGLE_SLIDES);
        while (files.hasNext()) {
            const file = files.next();
            if (file.getName().includes(week)) {
                existingPresentations.push({
                    id: file.getId(),
                    name: file.getName(),
                    url: file.getUrl()
                });
            }
        }
    } else {
        // Fallback to global search
        existingPresentations = findPresentationsByName(week);
    }
    
    if (existingPresentations.length > 0) {
        Logger.log(`Found existing presentation: ${existingPresentations[0].name}`);
        const presentation = SlidesApp.openById(existingPresentations[0].id);
        return {
            presentation,
            isNew: false,
            url: existingPresentations[0].url
        };
    }
    
    // Create new presentation
    Logger.log(`Creating new presentation: ${presentationName}`);
    
    let presentation: GoogleAppsScript.Slides.Presentation;
    let presentationFile: GoogleAppsScript.Drive.File;
    
    if (templateId) {
        try {
            // Copy from template
            const templateFile = DriveApp.getFileById(templateId);
            if (targetFolder) {
                presentationFile = templateFile.makeCopy(presentationName, targetFolder);
            } else {
                presentationFile = templateFile.makeCopy(presentationName);
            }
            presentation = SlidesApp.openById(presentationFile.getId());
            Logger.log(`Created presentation from template: ${templateId}`);
        } catch (error) {
            Logger.log(`Error copying from template: ${error.message}, creating blank presentation`);
            presentation = SlidesApp.create(presentationName);
            presentationFile = DriveApp.getFileById(presentation.getId());
            
            // Move to target folder if specified
            if (targetFolder) {
                try {
                    targetFolder.addFile(presentationFile);
                    // Remove from root (if it was created there)
                    const parents = presentationFile.getParents();
                    while (parents.hasNext()) {
                        const parent = parents.next();
                        if (parent.getId() !== targetFolder.getId()) {
                            parent.removeFile(presentationFile);
                        }
                    }
                    Logger.log(`Moved presentation to folder: ${targetFolder.getName()}`);
                } catch (moveError) {
                    Logger.log(`Warning: Could not move presentation to folder: ${moveError.message}`);
                }
            }
        }
    } else {
        // Create blank presentation
        presentation = SlidesApp.create(presentationName);
        presentationFile = DriveApp.getFileById(presentation.getId());
        
        // Move to target folder if specified
        if (targetFolder) {
            try {
                targetFolder.addFile(presentationFile);
                // Remove from root
                const parents = presentationFile.getParents();
                while (parents.hasNext()) {
                    const parent = parents.next();
                    if (parent.getId() !== targetFolder.getId()) {
                        parent.removeFile(presentationFile);
                    }
                }
                Logger.log(`Moved presentation to folder: ${targetFolder.getName()}`);
            } catch (moveError) {
                Logger.log(`Warning: Could not move presentation to folder: ${moveError.message}`);
            }
        }
    }
    
    const url = presentation.getUrl();
    Logger.log(`Created new presentation: ${url}`);
    
    return {
        presentation,
        isNew: true,
        url
    };
}

/**
 * Logs execution details for audit trail
 * @param executionType Type of execution (e.g., 'weekly', 'manual')
 * @param status Execution status ('started', 'completed', 'failed')
 * @param details Additional details to log
 */
export function logExecution(
    executionType: 'weekly' | 'manual', 
    status: 'started' | 'completed' | 'failed', 
    details: {
        weekId?: string;
        presentationId?: string;
        presentationUrl?: string;
        error?: string;
        projectCount?: number;
        teamCount?: number;
    } = {}
): void {
    const timestamp = new Date().toISOString();
    const weekId = details.weekId || getWeekIdentifier();
    
    const logEntry = {
        timestamp,
        executionType,
        status,
        weekId,
        ...details
    };
    
    try {
        // Get existing log
        const existingLog = getDocumentProperty('automation_log') || '[]';
        const log = JSON.parse(existingLog);
        
        // Add new entry
        log.unshift(logEntry); // Add to beginning
        
        // Keep only last 50 entries
        if (log.length > 50) {
            log.splice(50);
        }
        
        // Save updated log
        saveDocumentProperty('automation_log', JSON.stringify(log));
        
        // Also log to console
        Logger.log(`Automation log [${status}]: ${JSON.stringify(logEntry)}`);
        
    } catch (error) {
        Logger.log(`Error saving automation log: ${error.message}`);
    }
}

/**
 * Gets recent execution history
 * @param limit Maximum number of entries to return (default: 10)
 * @returns Array of execution log entries
 */
export function getExecutionHistory(limit: number = 10): Array<any> {
    try {
        const existingLog = getDocumentProperty('automation_log') || '[]';
        const log = JSON.parse(existingLog);
        return log.slice(0, limit);
    } catch (error) {
        Logger.log(`Error retrieving execution history: ${error.message}`);
        return [];
    }
}

/**
 * Clears old execution logs
 * @param daysToKeep Number of days to keep logs for (default: 30)
 */
export function cleanupExecutionLogs(daysToKeep: number = 30): void {
    try {
        const existingLog = getDocumentProperty('automation_log') || '[]';
        const log = JSON.parse(existingLog);
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        
        const filteredLog = log.filter((entry: any) => {
            const entryDate = new Date(entry.timestamp);
            return entryDate > cutoffDate;
        });
        
        saveDocumentProperty('automation_log', JSON.stringify(filteredLog));
        
        Logger.log(`Cleaned up automation logs: ${log.length - filteredLog.length} entries removed`);
        
    } catch (error) {
        Logger.log(`Error cleaning up execution logs: ${error.message}`);
    }
}

export default {
    getWeekIdentifier,
    generatePresentationName,
    findPresentationsByName,
    findOrCreateWeeklyPresentation,
    logExecution,
    getExecutionHistory,
    cleanupExecutionLogs
};