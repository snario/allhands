import { DEFAULT_AVATAR_URL } from "../../constants";
import { getEmojiFromJSON } from "../../lib/emoji";
import {
    formatDate,
    getDateFormatting,
    HIGHLIGHT_COLOR,
    rightPad,
} from "../../lib/formatting";
import { insertImage, insertTextBox } from "../../lib/googleSlides";
import { Initiative, isInitiativeCompleted } from "../../lib/linear";

export default {
    cacheKey: "AGENDA-SLIDE" as const,

    populate(
        slide: GoogleAppsScript.Slides.Slide,
        initiatives: Initiative[],
        highlightInitiativeId: string,
    ): void {
        let topPosition = 50;

        initiatives.forEach((initiative: Initiative) => {
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

            if (initiative.targetDate) {
                insertTextBox(
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
                        left: 500,
                        top: topPosition,
                        width: 200,
                        height: 20,
                    },
                    formatDate(initiative.targetDate),
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
                    width: 420,
                    height: 20,
                },
                `${rightPad(getEmojiFromJSON(initiative.icon))}${initiative.name}`,
            );

            topPosition += 25;
        });
    },
};
