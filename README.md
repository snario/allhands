# Allhands Project

This repository contains scripts and configurations to streamline the creation and management of project slides from Linear initiatives, and to communicate updates via email. Below is a description of each file in the repository:

## Usage

This is a clasp project, which means that it's a Google Apps Script project that uses the [clasp](https://developers.google.com/apps-script/guides/clasp) tool to bundle and deploy the project as a single `.gs` file. 

Setting up clasp properly requires:
- Creating a Google Apps Script project ([click here](https://script.google.com/home/start))
- Adding the project ID to a `.clasp.json` file
- Enabling the Google Apps Script API ([click here](https://script.google.com/home/usersettings))
- Logging into clasp with `clasp login` (and storing `.clasrpc.json`)

We can build the project file by running the following command:

```sh
npm run build
```

This will create a `dist` directory with an `index.js` and `appsscript.json` file.

Then, if we run the push command, we can deploy this file to Google Apps Script:

```sh
npm run push
```

This will overwrite the existing project with a new `index.gs` file.

To run the scripts, go to the [Google Apps Script editor](https://script.google.com/home) and run one of the main scripts for the project like the `createSlidesFromLinearInitiatives` function. 

By default, this won't work because you need to set up a secret for the `LINEAR_API_KEY` variable and the scripts check that you're on an active presentation, but you can test on the script editor if you want.

## Installation

To install the project, go to the [Google Apps Script editor](https://script.google.com/home) and click on the "New Deployment" button. You can then select the "Deploy as add-on" option and deploy it to your GCP or as a test deployment. You should see it show up in your Add-Ons menu of a Google Slides document.

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

### `external` Directory

| File                                              | Description                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [secretService.ts](src/external/secretService.ts) | Source code for the [Secret Service](https://github.com/dataful-tech/secret-service) library. |

### Root Files

| File                                   | Description                                            |
| -------------------------------------- | ------------------------------------------------------ |
| [appsscript.json](src/appsscript.json) | Configuration file for the Google Apps Script project. |
| [constants.ts](src/constants.ts)       | Defines useful constants used throughout the project.  |
| [config.html](src/config.html)         | HTML file for the configuration dialog.                |
| [index.ts](src/index.ts)               | Entry point for the Google Apps Script project.        |

