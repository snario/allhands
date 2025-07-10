import {
    formatDate,
    rightPad,
    getDateFormatting,
    applyFormattingToTextStyle,
    TextFormatting,
    getHealthFormatting,
} from "../../lib/formatting";
import { DEFAULT_AVATAR_URL, EMPTY_STRING, TEXT_COLOR_SECONDARY } from "../../constants";
import { getEmojiFromJSON } from "../../lib/emoji";
import {
    isProjectCompleted,
    Project,
    InitiativeWithProjects,
    getHealthIconUrl,
    getStatusIconUrl,
    isInitiativeCompleted,
    getHealthText,
} from "../../lib/linear";
import {
    insertImage,
    insertTextBox,
    removeShapesAndImages,
} from "../../lib/googleSlides";

export default {
    cacheKey: "INITIATIVE-SLIDE",

    populate(
        slide: GoogleAppsScript.Slides.Slide,
        initiative: InitiativeWithProjects,
        config: { withAssigneeAvatars: boolean },
    ) {
        removeShapesAndImages(slide);

        if (config.withAssigneeAvatars) {
            insertImage(
                slide,
                { left: 35, top: 90, width: 55, height: 55 },
                initiative.owner?.avatarUrl || DEFAULT_AVATAR_URL,
            );
        } else {
            insertTextBox(
                slide,
                {
                    alignment: SlidesApp.ContentAlignment.MIDDLE,
                    fontSize: 50,
                },
                {
                    left: 30,
                    top: 90,
                    width: 200,
                    height: 50,
                },
                `${getEmojiFromJSON(initiative.icon)}`,
            );
        }

        insertTextBox(
            slide,
            {
                alignment: SlidesApp.ContentAlignment.MIDDLE,
                fontSize: 24,
                bold: true,
            },
            {
                left: 30,
                top: 170,
                width: 350,
                height: 50,
            },
            `${config.withAssigneeAvatars ? rightPad(getEmojiFromJSON(initiative.icon)) : ""}${initiative.name}`,
        );

        // Date | Health
        buildSubtitleTextBox(
            insertTextBox(
                slide,
                { fontSize: 14 },
                {
                    left: 30,
                    top: 205,
                    width: 350,
                    height: 24,
                },
                EMPTY_STRING
            ),
            initiative
        );

        insertTextBox(
            slide,
            { fontColor: TEXT_COLOR_SECONDARY, fontSize: 14 },
            {
                left: 30,
                top: 240,
                width: 350,
                height: 50,
            },
            `${initiative.description || "No description"}`,
        );

        let topPosition = 190 - initiative.projects.length * 20;

        initiative.projects.forEach((project: Project) => {
            createProjectItem(slide, project, topPosition, config);
            topPosition += 45;
        });
    },
};

type SubtitleSectionStyle = Pick<
    TextFormatting,
    "backgroundColor" | "fontColor" | "bold"
>;

function buildSubtitleTextBox(
    textBox: GoogleAppsScript.Slides.Shape,
    initiative: InitiativeWithProjects,
) {
    const separator = " | ";
    const separatorStyle: SubtitleSectionStyle = {
        backgroundColor: null,
        fontColor: TEXT_COLOR_SECONDARY,
    };

    const sections: { text: string; style: TextFormatting }[] = [];

    if (initiative.targetDate) {
        sections.push(
            {
                text: `Target -> ${formatDate(initiative.targetDate)}`,
                style: getDateFormatting(initiative.targetDate, isInitiativeCompleted(initiative)),
            },
            { text: separator, style: separatorStyle }
        );
    }

    sections.push(
        {
            text: getHealthText(initiative.health),
            style: getHealthFormatting(initiative.health)
        }
    );

    textBox.getText().clear();

    sections.forEach((section) => {
        const start = textBox.getText().getLength();

        textBox.getText().appendText(section.text);

        const textRange = textBox
            .getText()
            .getRange(Math.max(0, start - 1), start + section.text.length);

        applyFormattingToTextStyle(textRange.getTextStyle(), section.style);
    });

    return textBox;
}

function createProjectItem(
    slide: GoogleAppsScript.Slides.Slide,
    project: Project,
    topPosition: number,
    config: { withAssigneeAvatars: boolean },
) {
    const projectEmoji = rightPad(getEmojiFromJSON(project.icon));
    const startDate = formatDate(project.startDate);
    const targetDate = formatDate(project.targetDate);

    if (config.withAssigneeAvatars) {
        insertImage(
            slide,
            { left: 384, top: topPosition, width: 26, height: 26 },
            project.lead?.avatarUrl || DEFAULT_AVATAR_URL,
        );
    }

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

    applyFormattingToTextStyle(textStyle, {
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
