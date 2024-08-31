import {
    getDocumentProperty,
    saveDocumentProperty,
} from "./lib/googleAppsScript";
import EmailScript from "./scripts/email/emailProjectLeadsWithSlides";
import {
    createSlidesFromLinear,
    updateExistingProjectSlide,
} from "./scripts/slides/createSlidesFromLinearInitiatives";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onOpen() {
    const ui = SlidesApp.getUi();
    ui.createAddonMenu()
        .addItem("Email Project Leads with Slides", "emailProjectsToUserEmails")
        .addItem("Create Linear Slides", "createSlidesFromLinear")
        .addItem("Update Project Slide", "updateExistingProjectSlide")
        .addItem("Show Configuration", "showConfigDialog")
        .addToUi();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onInstall() {
    onOpen();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Scripts = {
    emailProjectsToUserEmails: EmailScript,
    createSlidesFromLinear: createSlidesFromLinear,
    updateExistingProjectSlide: updateExistingProjectSlide,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showConfigDialog() {
    const settings = loadConfigFromDocumentProperties();

    const html = HtmlService.createTemplateFromFile("config");

    // Pass the settings to the template
    html.withAssigneeAvatars = settings.withAssigneeAvatars;
    html.includeProjectSlides = settings.includeProjectSlides;
    html.includeAgendaSlide = settings.includeAgendaSlide;

    const output = html.evaluate().setWidth(400).setHeight(300);
    SlidesApp.getUi().showModalDialog(output, "Configuration Settings");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveConfigToDocumentProperties(settings: {
    withAssigneeAvatars: string;
    includeProjectSlides: string;
    includeAgendaSlide: string; // new property
}) {
    saveDocumentProperty("configSettings", JSON.stringify(settings));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function loadConfigFromDocumentProperties() {
    // Get the JSON string from the properties and parse it back into an object
    return JSON.parse(getDocumentProperty("configSettings") || "{}");
}
