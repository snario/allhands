import {
    formatDate,
    rightPad,
    getDateFormatting,
    applyTextFormatting,
} from "../../lib/formatting";
import { TEXT_COLOR_SECONDARY } from "../../constants";
import { getEmojiFromJSON } from "../../lib/emoji";
import {
    isProjectCompleted,
    Project,
    InitiativeWithProjects,
    getHealthIconUrl,
    getStatusIconUrl,
} from "../../lib/linear";
import { insertImage, insertTextBox } from "../../lib/googleSlides";

export default {
    cacheKey: "INITIATIVE-SLIDE",

    populate(
        slide: GoogleAppsScript.Slides.Slide,
        initiative: InitiativeWithProjects,
    ) {
        insertTextBox(
            slide,
            { alignment: SlidesApp.ContentAlignment.MIDDLE, fontSize: 60 },
            {
                left: 30,
                top: 90,
                width: 50,
                height: 50,
            },
            getEmojiFromJSON(initiative.icon) || "?",
        );

        insertTextBox(
            slide,
            { bold: true, fontSize: 30 },
            {
                left: 30,
                top: 150,
                width: 350,
                height: 50,
            },
            initiative.name,
        );

        insertTextBox(
            slide,
            { fontColor: TEXT_COLOR_SECONDARY, fontSize: 14 },
            {
                left: 30,
                top: 200,
                width: 330,
                height: 50,
            },
            initiative.description || "No description",
        );

        let topPosition = 190 - initiative.projects.length * 20;

        initiative.projects.forEach((project: Project) => {
            createProjectItem(slide, project, topPosition);
            topPosition += 45;
        });
    },
};

function createProjectItem(
    slide: GoogleAppsScript.Slides.Slide,
    project: Project,
    topPosition: number,
) {
    const projectEmoji = rightPad(getEmojiFromJSON(project.icon));
    const startDate = formatDate(project.startDate);
    const targetDate = formatDate(project.targetDate);

    const projectTextBox = insertTextBox(
        slide,
        { fontSize: 12 },
        {
            left: 410,
            top: topPosition - 10,
            width: 250,
            height: 30,
        },
        `${projectEmoji}${project.name}\n${startDate} -> ${targetDate}`,
    );

    const textRange = projectTextBox.getText();
    textRange
        .getRange(0, textRange.asString().indexOf("\n"))
        .getTextStyle()
        .setBold(true);

    const { backgroundColor, fontColor, bold } = getDateFormatting(
        project.targetDate,
        isProjectCompleted(project),
    );

    const textStyle = textRange
        .getRange(textRange.asString().indexOf("\n") + 1, textRange.getLength())
        .getTextStyle();

    applyTextFormatting(textStyle, {
        backgroundColor,
        fontColor,
        bold,
    });

    insertImage(
        slide,
        { left: 655, top: topPosition, width: 20, height: 20 },
        getStatusIconUrl(project.status.name),
    );

    insertImage(
        slide,
        { left: 680, top: topPosition, width: 20, height: 20 },
        getHealthIconUrl(project.health),
    );
}
