import { getEmojiFromJSON } from "../../lib/emoji";
import { HIGHLIGHT_COLOR, rightPad } from "../../lib/formatting";
import { insertTextBox } from "../../lib/googleSlides";
import { Initiative } from "../../lib/linear";

export default {
    cacheKey: "AGENDA-SLIDE" as const,

    populate(
        slide: GoogleAppsScript.Slides.Slide,
        initiatives: Initiative[],
        highlightInitiativeId: string,
    ): void {
        let topPosition = 80;

        initiatives.forEach((initiative: Initiative) => {
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
                    fontSize: 30,
                },
                {
                    left: 220,
                    top: topPosition,
                    width: 250,
                    height: 50,
                },
                `${rightPad(getEmojiFromJSON(initiative.icon))}${initiative.name}`,
            );

            topPosition += 50;
        });
    },
};
