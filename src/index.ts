import EmailScript from "./scripts/email/emailProjectLeadsWithSlides";
import SlidesScript from "./scripts/slides/createSlidesFromLinearInitiatives";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onOpen() {
    const ui = SlidesApp.getUi();
    ui.createAddonMenu()
        .addItem("Email Project Leads with Slides", "emailProjectsToUserEmails")
        .addItem(
            "Create Slides from Linear Initiatives",
            "createSlidesFromLinearInitiatives",
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
    createSlidesFromLinearInitiatives: SlidesScript,
};
