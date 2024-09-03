import schema from "./graphql/schema.graphql";

export type Initiative = {
    id: string;
    name: string;
    description: string;
    targetDate: string; // 2022-01-01
    status: "Planned" | "In Progress" | "Completed" | "Canceled";
    icon: string;
    color: string;
    url: string;
    owner: User;
};

export type User = {
    email: string;
    name: string;
    avatarUrl: string;
};

export type Project = {
    id: string;
    name: string;
    startDate: string; // 2022-01-01
    targetDate: string; // 2022-01-01
    description: string;
    icon: string;
    color: string;
    url: string;
    status: { name: "Planned" | "In Progress" | "Completed" | "Canceled" };
    projectUpdates: { nodes: ProjectUpdate[] };
    initiatives: { nodes: { id: string }[] };
    lead: User;
    health: "atRisk" | "offTrack" | "onTrack" | "unknown";
};

export type InitiativeWithProjects = Initiative & {
    projects: Project[];
};

export type ProjectUpdate = {
    body: string;
    createdAt: string;
    user: { name: string };
};

const LINEAR_API_URL = "https://api.linear.app/graphql";

const HealthIconUrls = {
    AT_RISK: "https://liamhorne.com/assets/img/icons/atrisk.png",
    OFF_TRACK: "https://liamhorne.com/assets/img/icons/offtrack.png",
    ON_TRACK: "https://liamhorne.com/assets/img/icons/ontrack.png",
    UNKNOWN: "https://liamhorne.com/assets/img/icons/unknown.png",
};

// Enums for external resources
const StatusIconUrls = {
    PLANNED: "https://liamhorne.com/assets/img/icons/planned.png",
    IN_PROGRESS: "https://liamhorne.com/assets/img/icons/progress.png",
    COMPLETED: "https://liamhorne.com/assets/img/icons/completed.png",
    CANCELED: "https://liamhorne.com/assets/img/icons/canceled.png",
};

export function isProjectOverdue(targetDate: string) {
    const now = new Date();
    const date = new Date(targetDate);
    return date < now;
}

export function isProjectDueSoon(targetDate: string) {
    const now = new Date();
    const date = new Date(targetDate).getTime();
    const daysUntilDue = Math.floor(
        (date - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilDue <= 7 && daysUntilDue >= 0;
}

export function getHealthText(health: Project["health"]) {
    switch (health) {
        case "atRisk":
            return "At Risk";
        case "offTrack":
            return "Off Track";
        case "onTrack":
            return "On Track";
        default:
            return "Unknown";
    }
}

export function getHealthIconUrl(health: Project["health"]) {
    switch (health) {
        case "atRisk":
            return HealthIconUrls.AT_RISK;
        case "offTrack":
            return HealthIconUrls.OFF_TRACK;
        case "onTrack":
            return HealthIconUrls.ON_TRACK;
        default:
            return HealthIconUrls.UNKNOWN;
    }
}

export function getStatusIconUrl(health: Initiative["status"]) {
    switch (health) {
        case "Planned":
            return StatusIconUrls.PLANNED;
        case "In Progress":
            return StatusIconUrls.IN_PROGRESS;
        case "Completed":
            return StatusIconUrls.COMPLETED;
        case "Canceled":
            return StatusIconUrls.CANCELED;
        default:
            return StatusIconUrls.PLANNED;
    }
}

export const countProjectHealth = (initiative: InitiativeWithProjects) =>
    initiative.projects.reduce(
        (statusCount, project) => {
            switch (project.health) {
                case "onTrack":
                    statusCount.onTrack++;
                    break;
                case "atRisk":
                    statusCount.atRisk++;
                    break;
                case "offTrack":
                    statusCount.offTrack++;
                    break;
                default:
                    statusCount.unknown++;
            }
            return statusCount;
        },
        { onTrack: 0, atRisk: 0, offTrack: 0, unknown: 0 },
    );

export function isProjectCompleted(project: Project) {
    return project.status.name === "Completed";
}

export function isInitiativeCompleted(initiative: Initiative) {
    return initiative.status === "Completed";
}

export function mapProjectsToInitiatives(
    initiatives: Initiative[],
    projects: Project[],
): InitiativeWithProjects[] {
    const tmp: Record<string, InitiativeWithProjects> = {};

    initiatives.forEach((initiative) => {
        tmp[initiative.id] = { ...initiative, projects: [] };
    });

    projects.forEach((project) => {
        project.initiatives.nodes.forEach((initiative) => {
            if (tmp[initiative.id]) {
                tmp[initiative.id].projects.push(project);
            }
        });
    });

    return Object.values(tmp).sort(
        (a, b) => Date.parse(a.targetDate) - Date.parse(b.targetDate),
    );
}

export function fetchInitiative(apiKey: string, initiativeId: string) {
    const resp = fetchLinearData(apiKey, "GetInitiative", { id: initiativeId });
    return resp.data.initiative;
}

export function fetchProject(apiKey: string, projectId: string) {
    const resp = fetchLinearData(apiKey, "GetProject", { id: projectId });
    return resp.data.project;
}

export function fetchAllInitiatives(apiKey: string) {
    const data = fetchLinearData(apiKey, "GetInitiatives");
    return data.data.initiatives.nodes;
}

export function fetchAllProjects(apiKey: string) {
    let allProjects: Project[] = [];
    let hasNextPage = true;
    let endCursor = null;

    while (hasNextPage) {
        const more = fetchLinearData(apiKey, "GetProjects", { endCursor });

        const projects = more.data.projects.nodes;
        const pageInfo = more.data.projects.pageInfo;

        allProjects = allProjects.concat(projects);

        hasNextPage = pageInfo.hasNextPage;
        endCursor = pageInfo.endCursor;
    }

    allProjects = allProjects.sort(
        (a, b) =>
            new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime(),
    );

    return allProjects.filter((obj) => obj.initiatives.nodes.length > 0);
}

export function fetchLinearData(
    apiKey: string,
    operationName: string,
    variables = {},
) {
    const response = UrlFetchApp.fetch(LINEAR_API_URL, {
        method: "post",
        contentType: "application/json",
        headers: {
            Authorization: apiKey,
            "public-file-urls-expire-in": "60", // 1 min expiry
        },
        payload: JSON.stringify({
            query: schema.loc.source.body,
            operationName,
            variables,
        }),
    });
    return JSON.parse(response.getContentText());
}

export default {
    isProjectOverdue,
    isProjectDueSoon,
    getHealthText,
    getHealthIconUrl,
    getStatusIconUrl,
    isProjectCompleted,
    isInitiativeCompleted,
    mapProjectsToInitiatives,
    fetchAllInitiatives,
    fetchAllProjects,
};
