import { TEXT_COLOR_SECONDARY } from "../constants";
import Linear, { Initiative, Project } from "./linear";

export const HIGHLIGHT_COLOR = "#FFFF99";

// Define colors for health statuses
export const BACKGROUND_COLOR_AT_RISK = "#f6eacb";
export const FONT_COLOR_AT_RISK = "#d9a800";

export const BACKGROUND_COLOR_OFF_TRACK = "#f3cece";
export const FONT_COLOR_OFF_TRACK = "#d24044";

export const BACKGROUND_COLOR_ON_TRACK = "#c8e1ca";
export const FONT_COLOR_ON_TRACK = "#009030";

export const BACKGROUND_COLOR_UNKNOWN_HEALTH = "#d6d6d6";
export const FONT_COLOR_UNKNOWN_HEALTH = "#a0a0a2";

// Define colors for project statuses
export const BACKGROUND_COLOR_COMPLETED = "#aac4fd";
export const FONT_COLOR_COMPLETED = "#5d6ad2";

export const BACKGROUND_COLOR_IN_PROGRESS = "#f6eacb";
export const FONT_COLOR_IN_PROGRESS = "#d9a800";

export const BACKGROUND_COLOR_PLANNED = "#d9d9d9";
export const FONT_COLOR_PLANNED = "#666666";

export const BACKGROUND_COLOR_CANCELED = "#000000";
export const FONT_COLOR_CANCELED = "#ea9999";

export const FONT_COLOR_UNKNOWN_STATUS = "#595959";

export function rightPad(str?: string | null) {
    return str ? str + " " : "";
}

export type HexColor = `#${string}`;

export function getFirstName(name: string) {
    return name.split(" ")[0];
}

export function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "GMT",
        month: "short",
        day: "2-digit",
    }).format(new Date(date));
}

function defaultFormatting(): TextFormatting {
    return {
        fontFamily: "Inter",
    };
}

export function applyFormattingToTextStyle(
    textStyle: GoogleAppsScript.Slides.TextStyle,
    formatting: Omit<
        TextFormatting,
        "alignment" | "paragraphAlignment"
    > = defaultFormatting(),
) {
    const {
        fontFamily,
        fontColor,
        backgroundColor,
        fontSize,
        bold,
        italic,
        highlightColor,
    } = formatting;
    if (!textStyle) return textStyle;
    if (fontFamily) textStyle.setFontFamily(fontFamily);
    if (fontSize) textStyle.setFontSize(fontSize);
    if (bold) textStyle.setBold(true);
    if (italic) textStyle.setItalic(true);
    if (fontColor) textStyle.setForegroundColor(fontColor);
    if (backgroundColor) textStyle.setBackgroundColor(backgroundColor);
    if (backgroundColor === null) textStyle.setBackgroundColorTransparent();
    if (highlightColor) textStyle.setBackgroundColor(highlightColor);
    return textStyle;
}

export function getHealthFormatting(
    healthStatus: Project["health"],
): TextFormatting {
    switch (healthStatus) {
        case "atRisk":
            return {
                backgroundColor: BACKGROUND_COLOR_AT_RISK,
                fontColor: FONT_COLOR_AT_RISK,
            };
        case "offTrack":
            return {
                backgroundColor: BACKGROUND_COLOR_OFF_TRACK,
                fontColor: FONT_COLOR_OFF_TRACK,
            };
        case "onTrack":
            return {
                backgroundColor: BACKGROUND_COLOR_ON_TRACK,
                fontColor: FONT_COLOR_ON_TRACK,
            };
        default:
            return {
                backgroundColor: BACKGROUND_COLOR_UNKNOWN_HEALTH,
                fontColor: FONT_COLOR_UNKNOWN_HEALTH,
            };
    }
}

export function getStatusFormatting(
    status: Initiative["status"],
): TextFormatting {
    switch (status) {
        case "Completed":
            return {
                backgroundColor: BACKGROUND_COLOR_COMPLETED,
                fontColor: FONT_COLOR_COMPLETED,
            }; // Dark indigo
        case "In Progress":
            return {
                backgroundColor: BACKGROUND_COLOR_IN_PROGRESS,
                fontColor: FONT_COLOR_IN_PROGRESS,
            }; // Yellow background
        case "Planned":
            return {
                backgroundColor: BACKGROUND_COLOR_PLANNED,
                fontColor: FONT_COLOR_PLANNED,
            }; // Grey background
        case "Canceled":
            return {
                backgroundColor: BACKGROUND_COLOR_CANCELED,
                fontColor: FONT_COLOR_CANCELED,
            }; // Black background
        default:
            return {
                backgroundColor: undefined,
                fontColor: FONT_COLOR_UNKNOWN_STATUS,
            }; // Transparent background
    }
}

export function getDateFormatting(
    targetDate: string,
    completed: boolean,
): TextFormatting &
    Required<Pick<TextFormatting, "bold" | "fontColor" | "backgroundColor">> {
    const isOverdue = Linear.isProjectOverdue(targetDate);
    const isDueSoon = Linear.isProjectDueSoon(targetDate);

    if (completed) {
        return {
            backgroundColor: BACKGROUND_COLOR_COMPLETED,
            fontColor: FONT_COLOR_COMPLETED,
            bold: false,
        }; // Completed (Dark indigo)
    } else if (isOverdue) {
        return {
            backgroundColor: BACKGROUND_COLOR_OFF_TRACK,
            fontColor: FONT_COLOR_OFF_TRACK,
            bold: false,
        }; // Overdue (Dark red)
    } else if (isDueSoon) {
        return {
            backgroundColor: BACKGROUND_COLOR_AT_RISK,
            fontColor: FONT_COLOR_AT_RISK,
            bold: false,
        }; // Due Soon (Dark yellow)
    } else {
        return {
            backgroundColor: null,
            fontColor: TEXT_COLOR_SECONDARY,
            bold: false,
        }; // Transparent background
    }
}

export type TextFormatting = {
    fontColor?: HexColor;
    backgroundColor?: HexColor | null;
    highlightColor?: HexColor;
    bold?: boolean;
    italic?: boolean;
    alignment?: GoogleAppsScript.Slides.ContentAlignment;
    paragraphAlignment?: GoogleAppsScript.Slides.ParagraphAlignment;
    fontFamily?: string;
    fontSize?: number;
};

export function adjustFontSizeToFit(
    textBox: GoogleAppsScript.Slides.Shape,
    defaultFontSize: number,
) {
    const textRange = textBox.getText();
    let currentFontSize = defaultFontSize;
    const maxHeight = textBox.getHeight();

    if (textRange.getLength() < 10) return;

    while (currentFontSize > 1) {
        textRange.getTextStyle().setFontSize(currentFontSize);

        const lineCount = getAdjustedLineCount(textRange, currentFontSize);
        const lineHeight = currentFontSize * 1.8;
        const contentHeight = lineCount * lineHeight;

        if (contentHeight <= maxHeight) {
            break;
        }

        currentFontSize -= 1;
    }

    textRange.getTextStyle().setFontSize(currentFontSize);
}

export function getAdjustedLineCount(
    textRange: GoogleAppsScript.Slides.TextRange,
    currentFontSize: number,
) {
    // Calculate the maximum number of characters that can fit on one line
    const maxCharsPerLine = Math.floor(1280 / currentFontSize);

    // Split the text by newlines and use reduce to calculate the total line count
    // For each line, add the necessary number of lines based on its length
    // and maxCharsPerLine
    return textRange
        .asString()
        .split("\n")
        .reduce(
            (count, line) =>
                // Math.ceil ensures that any partial line is counted as a full line
                count + Math.ceil(line.length / maxCharsPerLine),
            0,
        );
}

export default {
    rightPad,
    formatDate,
    applyFormattingToTextStyle,
    getHealthFormatting,
    getStatusFormatting,
    getDateFormatting,
    adjustFontSizeToFit,
};
