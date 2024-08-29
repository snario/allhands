/**
 * Script to email users with slide reminders.
 *
 * Author: @snario <liam@liamhorne.com>
 * Date: August 25 2024
 *
 * What it does:
 *   - Fetches projects from Linear API.
 *   - Sends emails to users with slide reminders.
 */

import {
    getOrSetSecretInteractive,
    getDocumentProperty,
} from "../../lib/googleAppsScript";
import {
    fetchAllProjects,
    isProjectDueSoon,
    isProjectOverdue,
    Project,
    User,
} from "../../lib/linear";
import ProjectSlide from "../slides/projectSlide";

import { getSlideUrl } from "../../lib/googleSlides";
import { formatDate } from "../../lib/formatting";

export default function emailProjectLeadsWithSlides(): void {
    const presentation = SlidesApp.getActivePresentation();

    if (!presentation)
        throw new Error("Active document is not a Google Slides presentation.");

    const apiKey = getOrSetSecretInteractive(SlidesApp, "LINEAR_API_KEY");

    Logger.log(`Found existing presentation: ${presentation.getName()}`);

    const projectSlideMap = JSON.parse(
        getDocumentProperty(`${ProjectSlide.cacheKey}_${presentation.getId()}`),
    );
    if (projectSlideMap === null) {
        Logger.log("No project slide map found in cache.");
        return;
    }

    const projects = fetchAllProjects(apiKey);
    if (projects.length === 0) {
        Logger.log("No projects found. Cannot send emails.");
        return;
    }

    const projectSlideUrlMap: Record<Project["id"], string> = {};
    Object.keys(projectSlideMap).forEach((projectId) => {
        const slideId = projectSlideMap[projectId];
        const slideUrl = getSlideUrl(slideId, presentation);
        projectSlideUrlMap[projectId] = slideUrl;
    });

    sendEmailsForAllUsers(projects, projectSlideUrlMap);

    Logger.log("Emails sent successfully.");
}

export function sendEmailsForAllUsers(
    projects: Project[],
    projectSlideUrlMap: Record<Project["id"], string>,
): void {
    const projectsGroupedByUser: Record<
        User["email"],
        { user: User; projects: Project[] }
    > = {};

    projects.forEach((project) => {
        const user = project.lead;
        if (!user) return;

        if (typeof projectsGroupedByUser[user.email] === "undefined")
            projectsGroupedByUser[user.email] = { user, projects: [] };

        projectsGroupedByUser[user.email].projects.push(project);
    });

    // Send an email to each user with their grouped projects
    for (const userEmail in projectsGroupedByUser) {
        const { user, projects } = projectsGroupedByUser[userEmail];
        const emailContent = generateEmailContentForUser(
            user,
            projects,
            projectSlideUrlMap,
        );
        MailApp.sendEmail({
            to: user.email,
            subject: `SLIDES ASSIGNED: ${projects.length} Projects`,
            htmlBody: emailContent,
        });
    }
}

type ProjectSlideData = {
    name: string;
    slideUrl: string;
    promptText: string;
};

function generateEmailContentForUser(
    user: User,
    userProjects: Project[],
    projectSlideUrlMap: Record<Project["id"], string>,
) {
    const userProjectsData: ProjectSlideData[] = userProjects.map((project) => {
        const slideUrl = projectSlideUrlMap[project.id];
        const targetDateFormatted = formatDate(project.targetDate);

        // Check if the project is overdue or due soon using helper functions
        const isOverdue = isProjectOverdue(project.targetDate);
        const isDueThisWeek = isProjectDueSoon(project.targetDate);

        // Determine if the project is completed or canceled
        const isCompleted = project.status.name === "Completed";
        const isCanceled = project.status.name === "Canceled";

        let promptText = "";

        if (!isCompleted && !isCanceled) {
            if (isOverdue) {
                promptText += `Project overdue since ${targetDateFormatted}. Update slide with new deadline and issues.<br/><br/>`;
            }

            if (isDueThisWeek) {
                promptText += `Project due this week (${targetDateFormatted}). Update slide with current status and confidence.<br/><br/>`;
            }

            if (project.health === "offTrack") {
                promptText += `Project off track. Explain issues and recovery plan.<br/><br/>`;
            }

            if (project.health === "atRisk") {
                promptText += `Project at risk. Explain risks and mitigation plan.<br/><br/>`;
            }
        }

        if (isCompleted) {
            promptText += `Project completed. Summarize outcomes and learnings.<br/><br/>`;
        }

        if (isCanceled) {
            promptText += `Project canceled. Explain reasons and next steps.<br/><br/>`;
        }

        return { ...project, slideUrl, promptText };
    });

    const emailContent = template(user, userProjectsData);

    return emailContent;
}

const template = (user: User, userProjects: ProjectSlideData[]) => `
    <!DOCTYPE html>
    <html>
    <body>
        <p>Hey ${user.name},</p>
        <p>You have multiple slides to fill out for the upcoming All Hands meeting!</p>
        <table>
            ${userProjects
                .map(
                    (project) => `
                <tr>
                    <td style="width: 200px;">
                        <a href="${project.slideUrl}" style="text-decoration:none;">${project.name}</a>
                    </td>
                    <td style="width: 400px;">
                        ${project.promptText}
                    </td>
                </tr>
            `,
                )
                .join("")}
        </table>
    </body>
    </html>
`;
