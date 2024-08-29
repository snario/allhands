import { EMPTY_STRING } from "../constants";
import { TextFormatting } from "./formatting";
import {
    insertImageIntoSlide,
    insertTextBox,
    ShapePositionArgs,
} from "./googleSlides";

export function parseMarkdownIntoTextBox(
    slide: GoogleAppsScript.Slides.Slide,
    markdown: string,
    { left, top, width, height }: ShapePositionArgs,
    { fontSize: defaultFontSize }: Pick<TextFormatting, "fontSize">,
) {
    defaultFontSize = defaultFontSize || 16;
    const textBox = insertTextBox(
        slide,
        { fontSize: defaultFontSize },
        { left, top, width, height },
        EMPTY_STRING,
    );
    const textRange = textBox.getText();
    textRange.setText("");

    const lines = markdown.split("\n");
    let currentTop = top;

    lines.forEach((line) => {
        if (line.startsWith("### ")) {
            processHeading(line.slice(4), textRange, defaultFontSize + 4);
        } else if (line.startsWith("## ")) {
            processHeading(line.slice(3), textRange, defaultFontSize + 6);
        } else if (line.startsWith("# ")) {
            processHeading(line.slice(2), textRange, defaultFontSize + 8);
        } else if (line.match(/!\[(.*?)\]\((.*?)\)/)) {
            processImage(
                line,
                slide,
                currentTop,
                left,
                width,
                textBox.getHeight(),
            );
            currentTop += 200; // Adjust based on image size
        } else {
            processInlineStyles(line, textRange, defaultFontSize);
        }
    });

    return textBox;
}

export default {
    parseMarkdownIntoTextBox,
};

function processHeading(
    content: string,
    textRange: GoogleAppsScript.Slides.TextRange,
    fontSize: number,
) {
    const textItem = textRange.appendText(content + "\n");
    const textStyle = textItem.getTextStyle();
    textStyle.setFontSize(fontSize).setBold(true);
}

function processInlineStyles(
    line: string,
    textRange: GoogleAppsScript.Slides.TextRange,
    defaultFontSize: number,
) {
    let cursor = 0;
    const patterns = [
        { regex: /\*\*(.*?)\*\*/g, style: "bold" },
        { regex: /\*(.*?)\*/g, style: "italic" },
        { regex: /\[(.*?)\]\((.*?)\)/g, style: "link" },
    ];

    while (cursor < line.length) {
        let nearestMatch: {
            match: RegExpExecArray;
            pattern: (typeof patterns)[number];
        } | null = null;
        let nearestIndex = line.length;

        for (const pattern of patterns) {
            pattern.regex.lastIndex = cursor;
            const match = pattern.regex.exec(line);
            if (match && match.index < nearestIndex) {
                nearestIndex = match.index;
                nearestMatch = { match, pattern };
            }
        }

        if (nearestMatch !== null) {
            const { match, pattern } = nearestMatch;
            const startIndex = match.index;
            const endIndex = startIndex + match[0].length;

            // Append text before the match
            if (startIndex > cursor) {
                textRange.appendText(line.slice(cursor, startIndex));
            }

            // Apply the style to the matched text
            const styledText = textRange.appendText(match[1]);
            const textStyle = styledText.getTextStyle();

            if (pattern.style === "bold") {
                textStyle.setBold(true);
            } else if (pattern.style === "italic") {
                textStyle.setItalic(true);
            } else if (pattern.style === "link") {
                textStyle.setLinkUrl(match[2]);
            }

            // Reset the text style after the match
            textRange
                .appendText(EMPTY_STRING)
                .getTextStyle()
                .setBold(false)
                .setItalic(false)
                .setFontSize(defaultFontSize);

            cursor = endIndex;
        } else {
            // No more matches, append remaining text
            textRange.appendText(line.slice(cursor));
            break;
        }
    }

    textRange.appendParagraph(""); // Ensure proper paragraph separation
}

function processImage(
    line: string,
    slide: GoogleAppsScript.Slides.Slide,
    currentTop: number,
    left: number,
    width: number,
    textBoxHeight: number,
) {
    const imagePattern = /!\[(.*?)\]\((.*?)\)/;
    const match = line.match(imagePattern);
    if (match) {
        const imageUrl = match[2];
        const altText = match[1];

        const imageBlob = fetchImage(imageUrl);

        if (imageBlob) {
            insertImageIntoSlide(
                imageBlob,
                altText,
                slide,
                left,
                currentTop,
                textBoxHeight,
                width,
            );
        }
    }
}

function fetchImage(imageUrl: string) {
    try {
        return UrlFetchApp.fetch(imageUrl).getBlob();
    } catch (e: unknown) {
        Logger.log(
            "Failed to fetch image from URL: " +
                imageUrl +
                "\nError: " +
                (e as Error).message,
        );
        return null;
    }
}
