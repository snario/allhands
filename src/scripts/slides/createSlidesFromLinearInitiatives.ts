/**
 * Script to create a Google Slides presentation from Linear initiatives.
 *
 * Author: @snario <liam@liamhorne.com>
 * Date: August 25 2024
 *
 * What it does:
 *   - Fetches initiatives and projects from Linear API.
 *   - Creates slides for each initiative and project.
 *     - One slide for the initiative TOC (list of initiatives).
 *     - One slide for each initiative summary.
 *     - One slide for each project in an initiative.
 */

import {
    getDocumentProperty,
    getOrSetSecretInteractive,
    saveDocumentProperty,
} from "../../lib/googleAppsScript";
import {
    fetchAllProjects,
    fetchProject,
    groupProjectsByTeam,
    sortProjectsWithinTeam,
    getRandomizedTeamOrder,
    Project,
} from "../../lib/linear";
import ProjectSlide from "./projectSlide";
import { insertTextBox } from "../../lib/googleSlides";
import { TEXT_COLOR_SECONDARY } from "../../constants";

export function createSlidesFromLinear(): void {
    const presentation = SlidesApp.getActivePresentation();

    if (!presentation)
        throw new Error("Active document is not a Google Slides presentation.");

    const apiKey = getOrSetSecretInteractive(SlidesApp, "LINEAR_API_KEY");

    const projects = fetchAllProjects(apiKey);
    
    Logger.log(`Presentation URL: ${presentation.getUrl()}`);

    let cache = fetchCacheFromDocumentProperties(presentation);

    const config = JSON.parse(getDocumentProperty("configSettings")) || {};

    cache = generateProjectSlidesAndUpdateCache(
        presentation,
        projects,
        cache,
        config,
    );

    Logger.log("Project slides created or updated successfully");

    saveCacheToDocumentProperties(presentation, cache);
}

export function updateExistingProjectSlide() {
    const presentation = SlidesApp.getActivePresentation();

    if (!presentation)
        throw new Error("Active document is not a Google Slides presentation.");

    const apiKey = getOrSetSecretInteractive(SlidesApp, "LINEAR_API_KEY");

    const projectSlideMap: Record<string, string> = JSON.parse(
        getDocumentProperty(`${ProjectSlide.cacheKey}_${presentation.getId()}`),
    );

    if (!projectSlideMap)
        throw new Error("No cache found for this presentation.");

    const slideId = presentation.getSelection().getCurrentPage().getObjectId();

    const projectId = Object.keys(projectSlideMap).find(
        (projectId) => slideId === projectSlideMap[projectId],
    );

    if (!projectId) {
        throw new Error("No project slide found on the current slide.");
    }

    const project = fetchProject(apiKey, projectId);

    const projectSlide = getOrCreateSlideWithCache(
        presentation,
        projectSlideMap,
        project.id,
    );

    const config = JSON.parse(getDocumentProperty("configSettings"));

    ProjectSlide.populate(projectSlide, project, config);
}

function generateProjectSlidesAndUpdateCache(
    presentation: GoogleAppsScript.Slides.Presentation,
    projects: Project[],
    cache: {
        projectSlideMap: Record<string, string>;
    },
    config: {
        withAssigneeAvatars: boolean;
    },
) {
    const { projectSlideMap } = cache;

    const groupedProjects = groupProjectsByTeam(projects);
    const teamOrder = getRandomizedTeamOrder();

    teamOrder.forEach((team) => {
        if (groupedProjects[team]) {
            const sortedProjects = sortProjectsWithinTeam(groupedProjects[team]);
            
            sortedProjects.forEach((project) => {
                const projectSlide = getOrCreateSlideWithCache(
                    presentation,
                    projectSlideMap,
                    project.id,
                );
                ProjectSlide.populate(projectSlide, project, config);
            });
        }
    });

    return cache;
}

function fetchCacheFromDocumentProperties(
    presentation: GoogleAppsScript.Slides.Presentation,
) {
    return {
        projectSlideMap:
            JSON.parse(
                getDocumentProperty(
                    `${ProjectSlide.cacheKey}_${presentation.getId()}`,
                ),
            ) || {},
    };
}

function saveCacheToDocumentProperties(
    presentation: GoogleAppsScript.Slides.Presentation,
    cache: {
        projectSlideMap: Record<string, string>;
    },
) {
    saveDocumentProperty(
        `${ProjectSlide.cacheKey}_${presentation.getId()}`,
        JSON.stringify(cache.projectSlideMap),
    );
}

interface SlideCache {
    [id: string]: ReturnType<GoogleAppsScript.Slides.Slide["getObjectId"]>;
}

export function getOrCreateSlideWithCache(
    presentation: GoogleAppsScript.Slides.Presentation,
    cache: SlideCache,
    id: string,
): GoogleAppsScript.Slides.Slide {
    let slide;

    if (cache[id]) {
        slide = presentation.getSlideById(cache[id]);
    }

    if (!slide) {
        slide = presentation.appendSlide();
        cache[id] = slide.getObjectId();
    }

    const timestampOptions: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
    };

    const timestamp = new Date().toLocaleDateString("en-US", timestampOptions);

    // Insert a timestamp on the slide for easy reference
    insertTextBox(
        slide,
        {
            paragraphAlignment: SlidesApp.ParagraphAlignment.END,
            fontSize: 7,
            fontColor: TEXT_COLOR_SECONDARY,
        },
        {
            top: presentation.getPageHeight() - 20,
            left: presentation.getPageWidth() - 200,
            width: 200,
            height: 20,
        },
        `Slide generated on ${timestamp}`,
    );

    return slide;
}
