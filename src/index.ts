import EmailScript from "./scripts/email/emailProjectLeadsWithSlides";
import {
    createSlidesFromLinearWithProjectSlides,
    createSlidesFromLinearWithoutProjectSlides,
} from "./scripts/slides/createSlidesFromLinearInitiatives";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onOpen() {
    const ui = SlidesApp.getUi();
    ui.createAddonMenu()
        .addItem("Email Project Leads with Slides", "emailProjectsToUserEmails")
        .addItem(
            "Create Slides from Linear Initiatives (with Project Slides)",
            "createSlidesFromLinearWithProjectSlides",
        )
        .addItem(
            "Create Slides from Linear Initiatives (without Project Slides)",
            "createSlidesFromLinearWithoutProjectSlides",
        )
        .addToUi();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onInstall() {
    onOpen();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Scripts = {
    emailProjectsToUserEmails: EmailScript,
    createSlidesFromLinearWithProjectSlides:
        createSlidesFromLinearWithProjectSlides,
    createSlidesFromLinearWithoutProjectSlides:
        createSlidesFromLinearWithoutProjectSlides,
};
