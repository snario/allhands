import {
    DEFAULT_AVATAR_URL,
    EMPTY_STRING,
    TEXT_COLOR_SECONDARY,
} from "../../constants";
import { getEmojiFromJSON } from "../../lib/emoji";
import {
    adjustFontSizeToFit,
    applyTextFormatting,
    formatDate,
    getDateFormatting,
    getFirstName,
    getHealthFormatting,
    getStatusFormatting,
    rightPad,
    TextFormatting,
} from "../../lib/formatting";
import { insertImage, insertTextBox } from "../../lib/googleSlides";
import {
    getHealthIconUrl,
    getHealthText,
    Initiative,
    isProjectCompleted,
    Project,
} from "../../lib/linear";
import { parseMarkdownIntoTextBox } from "../../lib/markdown";

export default {
    cacheKey: "PROJECT-SLIDE",

    populate(
        slide: GoogleAppsScript.Slides.Slide,
        project: Project,
        initiative: Initiative,
    ) {
        const initiativeEmoji = getEmojiFromJSON(initiative.icon);

        // Small bold title for the initiative with emoji above project title
        insertTextBox(
            slide,
            { fontColor: TEXT_COLOR_SECONDARY, fontSize: 12 },
            {
                left: 50,
                top: 30,
                width: 600,
                height: 20,
            },
            `${rightPad(initiativeEmoji)}${initiative.name}`,
        );

        // Big bold title for the project with emoji
        insertTextBox(
            slide,
            { bold: true, fontSize: 24 },
            {
                left: 50,
                top: 48,
                width: 600,
                height: 40,
            },
            `${rightPad(getEmojiFromJSON(project.icon))}${project.name}`,
        );

        // Description for the project
        insertTextBox(
            slide,
            { fontColor: TEXT_COLOR_SECONDARY, fontSize: 12 },
            {
                left: 50,
                top: 105,
                width: 600,
                height: 20,
            },
            project.description || "No Description",
        );

        // Date | Owner | Status | Health
        buildSubtitleTextBox(
            insertTextBox(
                slide,
                {},
                {
                    left: 50,
                    top: 82,
                    width: 600,
                    height: 20,
                },
                EMPTY_STRING,
            ),
            project,
        );

        // Health icon from Linear in the top right
        insertImage(
            slide,
            {
                left: 635,
                top: 40,
                width: 60,
                height: 60,
            },
            getHealthIconUrl(project.health),
        );

        // Avatar of the lead
        insertImage(
            slide,
            {
                left: 560,
                top: 40,
                width: 60,
                height: 60,
            },
            project.lead?.avatarUrl || DEFAULT_AVATAR_URL,
        );

        if (project.projectUpdates.nodes.length > 0) {
            const { body, createdAt, user } = project.projectUpdates.nodes[0];

            // Markdown body of the latest update autosized to fit the slide
            adjustFontSizeToFit(
                parseMarkdownIntoTextBox(
                    slide,
                    body,
                    { left: 50, top: 140, width: 600, height: 255 },
                    { fontSize: 20 },
                ),
                20,
            );

            // A note on who wrote the update
            insertTextBox(
                slide,
                {
                    fontColor: TEXT_COLOR_SECONDARY,
                    paragraphAlignment: SlidesApp.ParagraphAlignment.END,
                    fontSize: 10,
                },
                {
                    left: 480,
                    top: 105,
                    width: 220,
                    height: 20,
                },
                `Written by ${getFirstName(user.name)} written on ${formatDate(createdAt)}`,
            );
        }

        return slide;
    },
};

type SubtitleSectionStyle = Pick<
    TextFormatting,
    "backgroundColor" | "fontColor" | "bold"
>;

function buildSubtitleTextBox(
    textBox: GoogleAppsScript.Slides.Shape,
    project: Project,
) {
    const separator = " | ";
    const separatorStyle: SubtitleSectionStyle = {
        backgroundColor: null,
        fontColor: TEXT_COLOR_SECONDARY,
    };

    const sections: { text: string; style: TextFormatting }[] = [];

    if (project.status.name !== "Canceled") {
        sections.push({
            text: `${formatDate(project.startDate)} -> ${formatDate(project.targetDate)}`,
            style: getDateFormatting(
                project.targetDate,
                isProjectCompleted(project),
            ),
        });

        if (project.status.name !== "Completed") {
            sections.push(
                { text: separator, style: separatorStyle },
                {
                    text: getHealthText(project.health),
                    style: getHealthFormatting(project.health),
                },
            );
        }

        sections.push(
            { text: separator, style: separatorStyle },
            {
                text: project.status.name,
                style: getStatusFormatting(project.status.name),
            },
        );
    } else {
        sections.push({
            text: project.status.name,
            style: getStatusFormatting(project.status.name),
        });
    }

    textBox.getText().clear();

    sections.forEach((section) => {
        const start = textBox.getText().getLength();

        textBox.getText().appendText(section.text);

        const textRange = textBox
            .getText()
            .getRange(Math.max(0, start - 1), start + section.text.length);

        applyTextFormatting(textRange.getTextStyle(), section.style);
    });

    return textBox;
}
