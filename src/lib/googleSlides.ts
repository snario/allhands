import { TextFormatting } from "./formatting";

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
    shapes.forEach((shape) => shape.remove());
    images.forEach((image) => image.remove());
}

export function insertTextBox(
    slide: GoogleAppsScript.Slides.Slide,
    {
        fontColor,
        backgroundColor,
        highlightColor,
        bold = false,
        italic = false,
        alignment = SlidesApp.ContentAlignment.TOP,
        paragraphAlignment = SlidesApp.ParagraphAlignment.START,
        fontFamily = "Inter",
        fontSize = 16,
    }: TextFormatting = {},
    { left, top, width, height }: ShapePositionArgs,
    text: string,
) {
    const textBox = slide.insertShape(
        SlidesApp.ShapeType.TEXT_BOX,
        left,
        top,
        width,
        height,
    );

    const textStyle = textBox.getText().setText(text).getTextStyle();

    textStyle.setFontFamily(fontFamily);
    textStyle.setFontSize(fontSize);

    if (bold) textStyle.setBold(true);
    if (italic) textStyle.setItalic(true);
    if (fontColor) textStyle.setForegroundColor(fontColor);
    if (backgroundColor) textBox.getFill().setSolidFill(backgroundColor);
    if (backgroundColor === null) textBox.getFill().setTransparent();
    if (highlightColor) textStyle.setBackgroundColor(highlightColor);

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
