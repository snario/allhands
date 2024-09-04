# Allhands Project

This repository contains scripts and configurations to streamline the creation and management of project slides from Linear initiatives and communicate updates via email. It's designed to integrate seamlessly with Google Slides.

## Table of Contents

- [Allhands Project](#allhands-project)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
    - [Scripts Overview](#scripts-overview)
    - [Configuration](#configuration)
  - [Development](#development)
    - [Setting Up](#setting-up)
    - [Building and Deploying](#building-and-deploying)
    - [Directory Structure](#directory-structure)
      - [`scripts` Directory](#scripts-directory)
      - [`lib` Directory](#lib-directory)
      - [`external` Directory](#external-directory)
      - [Root Files](#root-files)

## Usage

This project is designed to be set up as an add-on for a Google Slides document.

### Scripts Overview

Currently, there are 4 main scripts:

| Script Name                     | Description                                                              |
| ------------------------------- | ------------------------------------------------------------------------ |
| Email Project Leads with Slides | Emails project leads with reminders for upcoming project slides.         |
| Create Linear Slides            | Creates slides for each project in the Linear API.                       |
| Update Project Slide            | Updates the project slide with the latest status and health information. |
| Show Configuration              | Displays the configuration dialog for project settings.                  |

### Configuration

To configure project settings, use the "Show Configuration" script. This opens a dialog where you can set the following options (defined in [configSchema.json](src/configSchema.json)):

| Option                    | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| Include Assignee Pictures | Include pictures of the assignees for each project.            |
| Include Project Slides    | Include or skip slides for each project.                       |
| Include Agenda Slide      | Include a slide for the agenda.                                |

## Development

This is a `clasp` project, which means it's a Google Apps Script project that uses the [clasp](https://developers.google.com/apps-script/guides/clasp) tool to bundle and deploy the project as a single `.gs` file.

### Setting Up

1. **Create a Google Apps Script Project:** [Click here](https://script.google.com/home/start) to create a new project.
2. **Add Project ID to `.clasp.json`:** Include your project ID in the `.clasp.json` file.
3. **Enable Google Apps Script API:** [Click here](https://script.google.com/home/usersettings) to enable the API.
4. **Login to Clasp:** Run `clasp login` to authenticate (`.clasprc.json` should be stored).

### Building and Deploying

1. **Build the Project:** Run the following command to build the project:
    ```sh
    npm run build
    ```
    This creates a `dist` directory with `index.js` and `appsscript.json`.

2. **Deploy the Project:** Push the built files to Google Apps Script:
    ```sh
    npm run push
    ```
    This overwrites the existing project with a new `index.gs` file.

3. **Install the Project:**
   - Go to the [Google Apps Script editor](https://script.google.com/home).
   - Click the “New Deployment” button.
   - Select “Deploy as add-on” and choose between deploying to your GCP or as a test deployment.
   - The project should appear in the Add-Ons menu of a Google Slides document.

### Directory Structure

#### `scripts` Directory

These are the main scripts for the project and should be the only functions called from the Google Apps Script editor.

| File                                                                                                   | Description                                      |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| [email/emailProjectsToUserEmails.ts](src/scripts/email/emailProjectLeadsWithSlides.ts)                 | Emails users with slide reminders.               |
| [slides/createSlidesFromLinearInitiatives.ts](src/scripts/slides/createSlidesFromLinearInitiatives.ts) | Creates slides from Linear initiatives.          |

#### `lib` Directory

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

#### `external` Directory

| File                                              | Description                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [secretService.ts](src/external/secretService.ts) | Source code for the [Secret Service](https://github.com/dataful-tech/secret-service) library. |

#### Root Files

| File                                       | Description                                            |
| ------------------------------------------ | ------------------------------------------------------ |
| [appsscript.json](src/appsscript.json)     | Configuration file for the Google Apps Script project. |
| [constants.ts](src/constants.ts)           | Defines useful constants used throughout the project.  |
| [configSchema.json](src/configSchema.json) | Schema for config to appear in script and dialog.      |
| [config.html](src/config.html)             | HTML file for the configuration dialog.                |
| [index.ts](src/index.ts)                   | Entry point for the Google Apps Script project.        |
