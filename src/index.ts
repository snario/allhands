import ConfigSchema from "./configSchema.json";
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
    const html = HtmlService.createTemplateFromFile("config");
    const output = html.evaluate().setWidth(400).setHeight(300);
    SlidesApp.getUi().showModalDialog(output, "Configuration Settings");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getConfig() {
    return {
        configSchema: ConfigSchema,
        configSettings: getDocumentProperty("configSettings"),
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveConfig(settings: string) {
    saveDocumentProperty("configSettings", settings);
}
