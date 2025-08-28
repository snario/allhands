/**
 * Remote execution function for automated slide generation
 * 
 * This function is designed to be called via clasp from GitHub Actions
 * and handles the complete automation workflow.
 */

import { getOrSetSecretInteractive } from "../../lib/googleAppsScript";
import { 
    findOrCreateWeeklyPresentation, 
    logExecution, 
    getWeekIdentifier,
    cleanupExecutionLogs 
} from "../../lib/automation";
import { ALL_HANDS_FOLDER_ID } from "../../constants";
import {
    fetchAllProjects,
    groupProjectsByTeam,
    sortProjectsWithinTeam,
    getRandomizedTeamOrder,
    Project,
} from "../../lib/linear";
import ProjectSlide from "../slides/projectSlide";
import { getOrCreateSlideWithCache } from "../slides/createSlidesFromLinearInitiatives";

/**
 * Main automation function that can be called remotely
 * This function handles the complete weekly slide generation workflow
 */
export function executeSlideGeneration(): {
    success: boolean;
    presentationUrl?: string;
    presentationId?: string;
    weekId: string;
    projectCount?: number;
    teamCount?: number;
    error?: string;
} {
    const weekId = getWeekIdentifier();
    
    try {
        logExecution('weekly', 'started', { weekId });
        
        // Clean up old logs periodically
        cleanupExecutionLogs(30);
        
        Logger.log(`Starting automated slide generation for week: ${weekId}`);
        
        // Get Linear API key
        const apiKey = getOrSetSecretInteractive(SlidesApp, "LINEAR_API_KEY");
        if (!apiKey) {
            throw new Error("LINEAR_API_KEY not found in script properties");
        }
        
        // Find or create presentation for this week in the All-Hands folder
        const { presentation, isNew, url } = findOrCreateWeeklyPresentation(
            weekId, 
            undefined, // no template ID for now
            ALL_HANDS_FOLDER_ID
        );
        
        Logger.log(`Using presentation: ${url} (${isNew ? 'new' : 'existing'})`);
        
        // Fetch projects from Linear
        const projects = fetchAllProjects(apiKey);
        Logger.log(`Fetched ${projects.length} projects from Linear`);
        
        if (projects.length === 0) {
            Logger.log("No projects found, creating presentation with placeholder message");
            
            logExecution('weekly', 'completed', { 
                weekId,
                presentationId: presentation.getId(),
                presentationUrl: url,
                projectCount: 0,
                teamCount: 0
            });
            
            return {
                success: true,
                presentationUrl: url,
                presentationId: presentation.getId(),
                weekId,
                projectCount: 0,
                teamCount: 0
            };
        }
        
        // Generate slides
        const result = generateProjectSlides(presentation, projects);
        
        Logger.log(`Generated slides for ${result.projectCount} projects across ${result.teamCount} teams`);
        
        logExecution('weekly', 'completed', { 
            weekId,
            presentationId: presentation.getId(),
            presentationUrl: url,
            projectCount: result.projectCount,
            teamCount: result.teamCount
        });
        
        return {
            success: true,
            presentationUrl: url,
            presentationId: presentation.getId(),
            weekId,
            projectCount: result.projectCount,
            teamCount: result.teamCount
        };
        
    } catch (error) {
        const errorMessage = error.message || 'Unknown error occurred';
        Logger.log(`Automation failed: ${errorMessage}`);
        
        logExecution('weekly', 'failed', { 
            weekId,
            error: errorMessage
        });
        
        return {
            success: false,
            weekId,
            error: errorMessage
        };
    }
}

/**
 * Generate project slides using the same logic as the manual process
 */
function generateProjectSlides(
    presentation: GoogleAppsScript.Slides.Presentation,
    projects: Project[]
): { projectCount: number; teamCount: number } {
    
    // Get existing cache or create empty one
    const cache = {
        projectSlideMap: JSON.parse(
            PropertiesService.getDocumentProperties().getProperty(
                `PROJECT-SLIDE_${presentation.getId()}`
            )
        ) || {}
    };
    
    // Default configuration
    const config = {
        withAssigneeAvatars: true  // Default to showing avatars
    };
    
    // Group and sort projects by team
    const groupedProjects = groupProjectsByTeam(projects);
    const teamOrder = getRandomizedTeamOrder();
    
    Logger.log(`Processing teams in order: ${teamOrder.join(', ')}`);
    
    let totalProjectCount = 0;
    let activeTeamCount = 0;
    
    teamOrder.forEach((team) => {
        if (groupedProjects[team]) {
            activeTeamCount++;
            const sortedProjects = sortProjectsWithinTeam(groupedProjects[team]);
            
            Logger.log(`Processing ${sortedProjects.length} projects for team ${team}`);
            
            sortedProjects.forEach((project) => {
                const projectSlide = getOrCreateSlideWithCache(
                    presentation,
                    cache.projectSlideMap,
                    project.id,
                );
                
                ProjectSlide.populate(projectSlide, project, config);
                totalProjectCount++;
                
                Logger.log(`Generated slide for project: ${project.name} (${team} team)`);
            });
        }
    });
    
    // Save updated cache
    PropertiesService.getDocumentProperties().setProperty(
        `PROJECT-SLIDE_${presentation.getId()}`,
        JSON.stringify(cache.projectSlideMap)
    );
    
    return {
        projectCount: totalProjectCount,
        teamCount: activeTeamCount
    };
}

/**
 * Function to manually trigger slide generation (for testing or manual runs)
 */
export function manualSlideGeneration(): any {
    const weekId = getWeekIdentifier();
    
    try {
        logExecution('manual', 'started', { weekId });
        
        Logger.log(`Starting manual slide generation for week: ${weekId}`);
        Logger.log(`Target folder ID: ${ALL_HANDS_FOLDER_ID}`);
        
        const result = executeSlideGeneration();
        
        if (result.success) {
            logExecution('manual', 'completed', { 
                weekId: result.weekId,
                presentationId: result.presentationId,
                presentationUrl: result.presentationUrl,
                projectCount: result.projectCount,
                teamCount: result.teamCount
            });
        }
        
        return result;
        
    } catch (error) {
        const errorMessage = error.message || 'Unknown error occurred';
        Logger.log(`Manual execution failed: ${errorMessage}`);
        
        logExecution('manual', 'failed', { 
            weekId,
            error: errorMessage
        });
        
        return {
            success: false,
            weekId,
            error: errorMessage
        };
    }
}

export default {
    executeSlideGeneration,
    manualSlideGeneration
};