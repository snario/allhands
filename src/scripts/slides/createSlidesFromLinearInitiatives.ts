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
import InitiativeSlide from "./initiativeSlide";
import {
    fetchAllInitiatives,
    fetchAllProjects,
    InitiativeWithProjects,
    mapProjectsToInitiatives,
} from "../../lib/linear";
import ProjectSlide from "./projectSlide";
import AgendaSlide from "./agendaSlide";
import { insertTextBox, removeShapesAndImages } from "../../lib/googleSlides";
import { TEXT_COLOR_SECONDARY } from "../../constants";

export function createSlidesFromLinearWithProjectSlides() {
    createSlidesFromLinearInitiatives(true);
}

export function createSlidesFromLinearWithoutProjectSlides() {
    createSlidesFromLinearInitiatives(false);
}

function createSlidesFromLinearInitiatives(withProjects = true): void {
    const presentation = SlidesApp.getActivePresentation();

    if (!presentation)
        throw new Error("Active document is not a Google Slides presentation.");

    const apiKey = getOrSetSecretInteractive(SlidesApp, "LINEAR_API_KEY");

    const initiatives = fetchAndPrepareData(apiKey);

    Logger.log(`Presentation URL: ${presentation.getUrl()}`);

    let cache = fetchCacheFromDocumentProperties(presentation);

    cache = generateSlidesAndUpdateCache(
        presentation,
        initiatives,
        cache,
        withProjects,
    );

    Logger.log("Slides created or updated successfully");

    saveCacheToDocumentProperties(presentation, cache);
}

function fetchAndPrepareData(apiKey: string): InitiativeWithProjects[] {
    return mapProjectsToInitiatives(
        fetchAllInitiatives(apiKey),
        fetchAllProjects(apiKey),
    );
}

function generateSlidesAndUpdateCache(
    presentation: GoogleAppsScript.Slides.Presentation,
    initiatives: InitiativeWithProjects[],
    cache: {
        projectSlideMap: Record<string, string>;
        agendaSlideMap: Record<string, string>;
        initiativeSlideMap: Record<string, string>;
    },
    withProjects: boolean,
) {
    const { projectSlideMap, agendaSlideMap, initiativeSlideMap } = cache;

    initiatives.forEach((initiative) => {
        const agendaSlide = getOrCreateSlideWithCache(
            presentation,
            agendaSlideMap,
            initiative.id,
        );
        AgendaSlide.populate(agendaSlide, initiatives, initiative.id);

        const initiativeSlide = getOrCreateSlideWithCache(
            presentation,
            initiativeSlideMap,
            initiative.id,
        );
        InitiativeSlide.populate(initiativeSlide, initiative);
        if (withProjects) {
            initiative.projects.forEach((project) => {
                const projectSlide = getOrCreateSlideWithCache(
                    presentation,
                    projectSlideMap,
                    project.id,
                );
                ProjectSlide.populate(projectSlide, project, initiative);
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
        agendaSlideMap:
            JSON.parse(
                getDocumentProperty(
                    `${AgendaSlide.cacheKey}_${presentation.getId()}`,
                ),
            ) || {},
        initiativeSlideMap:
            JSON.parse(
                getDocumentProperty(
                    `${InitiativeSlide.cacheKey}_${presentation.getId()}`,
                ),
            ) || {},
    };
}

function saveCacheToDocumentProperties(
    presentation: GoogleAppsScript.Slides.Presentation,
    cache: {
        projectSlideMap: Record<string, string>;
        agendaSlideMap: Record<string, string>;
        initiativeSlideMap: Record<string, string>;
    },
) {
    saveDocumentProperty(
        `${ProjectSlide.cacheKey}_${presentation.getId()}`,
        JSON.stringify(cache.projectSlideMap),
    );
    saveDocumentProperty(
        `${AgendaSlide.cacheKey}_${presentation.getId()}`,
        JSON.stringify(cache.agendaSlideMap),
    );
    saveDocumentProperty(
        `${InitiativeSlide.cacheKey}_${presentation.getId()}`,
        JSON.stringify(cache.initiativeSlideMap),
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
        removeShapesAndImages(slide);
    } else {
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
