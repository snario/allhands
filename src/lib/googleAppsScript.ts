import * as SecretService from "../external/secretService";

type AppType =
    | GoogleAppsScript.Slides.SlidesApp
    | GoogleAppsScript.Forms.FormApp
    | GoogleAppsScript.Document.DocumentApp
    | GoogleAppsScript.Spreadsheet.SpreadsheetApp;

export function getOrSetSecretInteractive(
    scriptContainer: AppType,
    key: string,
): string {
    const service = SecretService.init({
        storage: PropertiesService.getUserProperties(),
        mode: "interactive",
        scriptContainer,
    });
    return service.getSecret(key);
}

export function getOrSetDocumentPropertyInteractive(
    scriptContainer: AppType,
    key: string,
): string {
    const service = SecretService.init({
        storage: PropertiesService.getDocumentProperties(),
        mode: "interactive",
        scriptContainer,
    });
    return service.getSecret(key);
}

export function getDocumentProperty(key: string): string {
    const service = SecretService.init({
        storage: PropertiesService.getDocumentProperties(),
        mode: "silent",
    });
    return service.getSecret(key);
}

export function saveDocumentProperty(key: string, value: string): void {
    const service = SecretService.init({
        storage: PropertiesService.getDocumentProperties(),
        mode: "silent",
    });
    service.setSecret(key, value);
}
