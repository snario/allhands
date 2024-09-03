import { DEFAULT_AVATAR_URL, EMPTY_STRING } from "../../constants";
import { getEmojiFromJSON } from "../../lib/emoji";
import {
    applyFormattingToTextStyle,
    BACKGROUND_COLOR_AT_RISK,
    BACKGROUND_COLOR_OFF_TRACK,
    BACKGROUND_COLOR_ON_TRACK,
    BACKGROUND_COLOR_UNKNOWN_HEALTH,
    FONT_COLOR_AT_RISK,
    FONT_COLOR_OFF_TRACK,
    FONT_COLOR_ON_TRACK,
    FONT_COLOR_UNKNOWN_HEALTH,
    formatDate,
    getDateFormatting,
    HIGHLIGHT_COLOR,
    rightPad,
    TextFormatting,
} from "../../lib/formatting";
import {
    insertImage,
    insertTextBox,
    removeShapesAndImages,
} from "../../lib/googleSlides";
import {
    countProjectHealth,
    InitiativeWithProjects,
    isInitiativeCompleted,
} from "../../lib/linear";

export default {
    cacheKey: "AGENDA-SLIDE" as const,

    populate(
        slide: GoogleAppsScript.Slides.Slide,
        initiatives: InitiativeWithProjects[],
        highlightInitiativeId: string,
        config: { withAssigneeAvatars: boolean },
    ): void {
        removeShapesAndImages(slide);

        let topPosition = 50;

        initiatives.forEach((initiative: InitiativeWithProjects) => {
            if (config.withAssigneeAvatars) {
                insertImage(
                    slide,
                    {
                        left: 50,
                        top: topPosition,
                        width: 20,
                        height: 20,
                    },
                    initiative.owner?.avatarUrl || DEFAULT_AVATAR_URL,
                );
            }

            if (initiative.targetDate) {
                const datebox = insertTextBox(
                    slide,
                    {
                        fontSize: 14,
                        alignment: SlidesApp.ContentAlignment.MIDDLE,
                        ...getDateFormatting(
                            initiative.targetDate,
                            isInitiativeCompleted(initiative),
                        ),
                    },
                    {
                        left: 400,
                        top: topPosition,
                        width: 75,
                        height: 20,
                    },
                    formatDate(initiative.targetDate),
                );
                datebox
                    .getText()
                    .getParagraphStyle()
                    .setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
            }

            if (!isInitiativeCompleted(initiative)) {
                buildStatusTextBox(
                    insertTextBox(
                        slide,
                        {
                            fontSize: 14,
                            alignment: SlidesApp.ContentAlignment.MIDDLE,
                        },
                        {
                            left: 485,
                            top: topPosition,
                            width: 160,
                            height: 20,
                        },
                        EMPTY_STRING,
                    ),
                    countProjectHealth(initiative),
                );
            }

            // Single list of initiatives with emoji
            // Highlighted if the initiative is the next slide
            insertTextBox(
                slide,
                {
                    backgroundColor:
                        initiative.id === highlightInitiativeId
                            ? HIGHLIGHT_COLOR
                            : undefined,
                    bold: false,
                    alignment: SlidesApp.ContentAlignment.MIDDLE,
                    fontSize: 14,
                },
                {
                    left: 90,
                    top: topPosition,
                    width: 300,
                    height: 20,
                },
                `${rightPad(getEmojiFromJSON(initiative.icon))}${initiative.name}`,
            );

            topPosition += 25;
        });
    },
};

function buildStatusTextBox(
    textbox: GoogleAppsScript.Slides.Shape,
    statusCount: {
        onTrack: number;
        atRisk: number;
        offTrack: number;
        unknown: number;
    },
) {
    const emtpySpace = { text: "   ", style: { backgroundColor: null } };
    const sections: ({ text: string; style: TextFormatting } | false)[] = [
        statusCount.onTrack > 0 && {
            text: `🟢 ${statusCount.onTrack}`,
            style: {
                backgroundColor: BACKGROUND_COLOR_ON_TRACK,
                fontColor: FONT_COLOR_ON_TRACK,
            },
        },
        statusCount.onTrack > 0 && emtpySpace,
        statusCount.atRisk > 0 && {
            text: `🟡 ${statusCount.atRisk}`,
            style: {
                backgroundColor: BACKGROUND_COLOR_AT_RISK,
                fontColor: FONT_COLOR_AT_RISK,
            },
        },
        statusCount.atRisk > 0 && emtpySpace,
        statusCount.offTrack > 0 && {
            text: `🔴 ${statusCount.offTrack}`,
            style: {
                backgroundColor: BACKGROUND_COLOR_OFF_TRACK,
                fontColor: FONT_COLOR_OFF_TRACK,
            },
        },
        statusCount.offTrack > 0 && emtpySpace,
        statusCount.unknown > 0 && {
            text: `⚫ ${statusCount.unknown}`,
            style: {
                backgroundColor: BACKGROUND_COLOR_UNKNOWN_HEALTH,
                fontColor: FONT_COLOR_UNKNOWN_HEALTH,
            },
        },
    ];

    textbox.getText().clear();

    sections.forEach((section) => {
        if (!section) return;

        const start = textbox.getText().getLength();

        textbox.getText().appendText(section.text);

        const textRange = textbox
            .getText()
            .getRange(Math.max(0, start - 1), start + section.text.length);

        applyFormattingToTextStyle(textRange.getTextStyle(), section.style);
    });

    return textbox;
}
