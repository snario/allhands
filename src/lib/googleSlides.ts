import { applyFormattingToTextStyle, TextFormatting } from "./formatting";

export type ShapePositionArgs = {
    left: number;
    top: number;
    width: number;
    height: number;
};

export function insertImage(
    slide: GoogleAppsScript.Slides.Slide,
    { left, top, width, height }: ShapePositionArgs,
    url: string,
) {
    return slide.insertImage(url, left, top, width, height);
}

export function getSlideUrl(
    slideId: string,
    presentation: GoogleAppsScript.Slides.Presentation,
): string {
    const baseUrl = presentation.getUrl();
    return `${baseUrl}#slide=id.${slideId}`;
}

export function removeShapesAndImages(
    slide: GoogleAppsScript.Slides.Slide,
): void {
    const shapes = slide.getShapes();
    const images = slide.getImages();
    const tables = slide.getTables();
    shapes.forEach((shape) => shape.remove());
    images.forEach((image) => image.remove());
    tables.forEach((table) => table.remove());
}

export function insertTextBox(
    slide: GoogleAppsScript.Slides.Slide,
    formatting: TextFormatting = {},
    { left, top, width, height }: ShapePositionArgs,
    text: string,
) {
    const {
        backgroundColor,
        alignment = SlidesApp.ContentAlignment.TOP,
        paragraphAlignment = SlidesApp.ParagraphAlignment.START,
    }: TextFormatting = formatting;

    const textBox = slide.insertShape(
        SlidesApp.ShapeType.TEXT_BOX,
        left,
        top,
        width,
        height,
    );

    const textStyle = textBox.getText().setText(text).getTextStyle();

    applyFormattingToTextStyle(textStyle, formatting);

    if (backgroundColor) textBox.getFill().setSolidFill(backgroundColor);
    if (backgroundColor === null) textBox.getFill().setTransparent();

    textBox.setContentAlignment(alignment);

    textBox
        .getText()
        .getParagraphStyle()
        .setParagraphAlignment(paragraphAlignment);

    return textBox;
}

export function insertImageIntoSlide(
    imageBlob: GoogleAppsScript.Base.BlobSource,
    altText: string,
    slide: GoogleAppsScript.Slides.Slide,
    left: number,
    currentTop: number,
    textBoxHeight: number,
    width: number,
) {
    try {
        const image = slide.insertImage(
            imageBlob,
            left,
            currentTop + textBoxHeight + 10,
            width,
            textBoxHeight,
        );
        image.setTitle(altText);

        // Adjust the image size if necessary
        if (image.getWidth() > width) {
            const ratio = width / image.getWidth();
            image.setWidth(width);
            image.setHeight(image.getHeight() * ratio);
        }
    } catch (error) {
        if (error instanceof Error) {
            Logger.log(
                "Failed to insert image into slide\nError: " + error.message,
            );
        } else {
            Logger.log(
                "Failed to insert image into slide\nUnknown error occurred",
            );
        }
    }
}
export function insertTableIntoSlide(
    slide: GoogleAppsScript.Slides.Slide,
    numRows: number,
    numCols: number,
    { left, top, width, height }: ShapePositionArgs,
    textFormatting: TextFormatting = {},
) {
    const table = slide.insertTable(numRows, numCols, left, top, width, height);

    // Apply the provided text formatting to each cell in the table
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const cellElement = table.getCell(row, col);
            const textRange = cellElement.getText();
            applyFormattingToTextStyle(
                textRange.getTextStyle(),
                textFormatting,
            );
        }
    }

    return table;
}
