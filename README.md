# Allhands Project

This repository contains scripts and configurations to streamline the creation and management of project slides from Linear initiatives, and to communicate updates via email. Below is a description of each file in the repository:

## What It Does



## Usage

This is a clasp project, which means that it's a Google Apps Script project that uses the [clasp](https://developers.google.com/apps-script/guides/clasp) tool to bundle and deploy the project as a single `.gs` file. Everything in the `src` directory is included in the `.gs` file, and the `clasp.json` file configures the project settings. We can build the `.gs` file by running the following commands:

```sh
npm run build
```

This will create a `dist` directory with an `index.js` and `appsscript.json` file.

Then, if we run the push command, we can deploy the `.gs` file to Google Apps Script:

```sh
npm run push
```

This will overwrite the existing project with the new `index.gs` file.

To run the scripts, go to the [Google Apps Script editor](https://script.google.com/home) and run one of the main scripts for the project like the `createSlidesFromLinearInitiatives` function.

Make sure you edit the `clasp.json` file to include your own project ID.

## Development

### `scripts` Directory

These are the main scripts for the project and should be the only functions that are called from the Google Apps Script editor.

| File                                                                                     | Description                                           |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [email/emailProjectsToUserEmails.ts](src/scripts/email/emailProjectLeadsWithSlides.ts)     | Script to email users with slide reminders.           |
| [slides/createSlidesFromLinearInitiatives.ts](src/scripts/slides/createSlidesFromLinearInitiatives.ts) | Script to create slides from Linear initiatives. |


### `lib` Directory

| File                                               | Description                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------- |
| [emoji.spec.ts](src/lib/emoji.spec.ts)             | Test specifications for emoji-related functionalities.            |
| [emoji.ts](src/lib/emoji.ts)                       | Fetches emojis using shortcodes (e.g., :woman:).                  |
| [emojiMap.json](src/lib/emojiMap.json)             | Contains a mapping of Slack emojis to their Unicode counterparts. |
| [formatting.ts](src/lib/formatting.ts)             | Handles text styling and formatting.                              |
| [googleAppsScript.ts](src/lib/googleAppsScript.ts) | Leverages Google Apps Script properties for caching.              |
| [googleSlides.ts](src/lib/googleSlides.ts)         | Provides functions for inserting text boxes and images on slides. |
| [linear.ts](src/lib/linear.ts)                     | Queries the Linear GraphQL API and provides helper functions.     |
| [markdown.ts](src/lib/markdown.ts)                 | Converts markdown into `Slides.TextBox`.                          |

## `external` Directory

| File                                              | Description                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [secretService.ts](src/external/secretService.ts) | Source code for the [Secret Service](https://github.com/dataful-tech/secret-service) library. |

### Root Files

| File                                   | Description                                            |
| -------------------------------------- | ------------------------------------------------------ |
| [appsscript.json](src/appsscript.json) | Configuration file for the Google Apps Script project. |
| [config.ts](src/config.ts)             | Contains configuration settings.                       |
| [constants.ts](src/constants.ts)       | Defines useful constants used throughout the project.  |

