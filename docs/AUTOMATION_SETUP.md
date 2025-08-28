# Automated All-Hands Slide Generation Setup

This guide explains how to set up automated weekly slide generation using GitHub Actions.

## Overview

The automation system will:
- Run every Monday at 00:00 UTC
- Fetch the latest project data from Linear
- Generate/update slides organized by team
- **Create presentations in the ETHGlobal All-Hands Drive folder**
- Send notifications to Slack with the presentation link
- Provide manual trigger capability for on-demand generation

## Prerequisites

1. **Google Apps Script Project**: A deployed Apps Script project with the slide generator code
2. **Linear API Access**: API key with read access to projects and teams
3. **GitHub Repository**: Repository with Actions enabled
4. **Slack Webhook** (optional): For notifications
5. **Google Drive Folder Access**: Write permission to the target folder

## Folder Organization

**Automated presentations** are created directly in the designated ETHGlobal All-Hands folder:
- **Folder ID**: `1HWeKrEo9uPIiNK9q5C1cyXK92_G-i_Qm`
- **Folder URL**: https://drive.google.com/drive/folders/1HWeKrEo9uPIiNK9q5C1cyXK92_G-i_Qm
- **Naming**: `ETHGlobal All Hands - [Date] | [Week-ID]` (e.g., "ETHGlobal All Hands - August 28, 2024 | 2024-W35")

**Manual presentations** (using the add-on menu) will use whatever presentation is currently open.

**Permission Requirements**:
- The automation service account needs **Editor** access to the target folder
- This is automatically handled if the folder is in the same Google account as the Apps Script project

## Setup Instructions

### Step 1: Google Apps Script Configuration

1. **Create/Deploy Apps Script Project**:
   ```bash
   npm run build
   npm run push
   ```

2. **Note your Script ID**:
   - Go to [Google Apps Script](https://script.google.com)
   - Find your project and copy the Script ID from the URL
   - Format: `https://script.google.com/d/{SCRIPT_ID}/edit`

3. **Enable Apps Script API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable the "Google Apps Script API"
   - Set up OAuth consent screen if needed

4. **Configure Linear API Key**:
   - In Apps Script, go to the script editor
   - Run any function that prompts for Linear API key
   - Or manually set it in Script Properties

### Step 2: Clasp Authentication

1. **Install clasp** (if not already installed):
   ```bash
   npm install -g @google/clasp
   ```

2. **Login to clasp**:
   ```bash
   clasp login
   ```

3. **Get credentials file**:
   - After login, find the credentials file at `~/.clasprc.json`
   - Base64 encode the entire file:
   ```bash
   cat ~/.clasprc.json | base64
   ```
   - Save this encoded string for GitHub secrets

### Step 3: GitHub Repository Secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add:

#### Required Secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `CLASP_SCRIPT_ID` | Your Google Apps Script project ID | `1BxK...abc123` |
| `CLASP_CREDENTIALS` | Base64 encoded `.clasprc.json` | `ewogICJjbGll...` |
| `LINEAR_API_KEY` | Linear API key with project read access | `lin_api_...` |

#### Optional Secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | `https://hooks.slack.com/...` |
| `GOOGLE_PRESENTATION_ID` | Default presentation ID (optional) | `1BxK...presentation` |

### Step 4: Slack Webhook Setup (Optional)

1. **Create Slack App**:
   - Go to [Slack API](https://api.slack.com/apps)
   - Create new app "All-Hands Bot"

2. **Enable Incoming Webhooks**:
   - In your app settings, enable "Incoming Webhooks"
   - Add webhook to desired channel
   - Copy webhook URL for GitHub secrets

### Step 5: Test the Setup

1. **Manual Test via GitHub Actions**:
   - Go to **Actions** tab in your repository
   - Find "Manual Slide Generation" workflow
   - Click "Run workflow"
   - Check the execution logs

2. **Test via Apps Script**:
   - Open your Google Apps Script project
   - Run the `manualSlideGeneration` function
   - Check the execution logs

## Workflow Files

The automation uses two GitHub Actions workflows:

- **`.github/workflows/weekly-slides.yml`**: Automated weekly execution
- **`.github/workflows/manual-slides.yml`**: Manual trigger capability

## Monitoring and Troubleshooting

### Execution Logs

- **GitHub Actions**: Check the Actions tab for workflow execution logs
- **Apps Script**: View logs in the Apps Script editor
- **Automation Log**: The system maintains an execution history in Apps Script properties

### Common Issues

1. **Authentication Errors**:
   - Check if `CLASP_CREDENTIALS` is properly base64 encoded
   - Ensure clasp login hasn't expired
   - Verify Apps Script API is enabled

2. **Linear API Errors**:
   - Confirm `LINEAR_API_KEY` has proper permissions
   - Check if API key has expired

3. **Slide Generation Errors**:
   - Verify project teams are properly configured in Linear
   - Check if there are projects to display
   - Ensure presentation permissions allow editing

### Testing Commands

```bash
# Test build process locally
npm run build

# Test clasp deployment (requires local clasp setup)
clasp push --force

# Test function execution
clasp run executeSlideGeneration
```

## Customization

### Changing Schedule

Edit `.github/workflows/weekly-slides.yml`:

```yaml
schedule:
  # Every Monday at 00:00 UTC
  - cron: '0 0 * * 1'
```

### Changing Target Folder

To use a different Google Drive folder for presentations:

1. **Get the folder ID** from the Google Drive URL:
   ```
   https://drive.google.com/drive/folders/[FOLDER_ID]
   ```

2. **Update the constant** in `src/constants.ts`:
   ```typescript
   export const ALL_HANDS_FOLDER_ID = "your-new-folder-id-here";
   ```

3. **Ensure permissions**: The automation must have access to the target folder

### Notification Format

Modify the notification payload in the workflow files to customize Slack messages.

### Adding Teams

Update the `TEAMS` constant in `src/lib/linear.ts`:

```typescript
const TEAMS = ['EV', 'CASH', 'MKT', 'FIN', 'ENG', 'NEW_TEAM'] as const;
```

## Security Notes

- Never commit `.clasp.json` or `.clasprc.json` to the repository
- Use GitHub secrets for all sensitive information
- Regularly rotate API keys and credentials
- Monitor execution logs for unusual activity

## Support

For issues or questions:
1. Check GitHub Actions logs for error details
2. Review Apps Script execution logs
3. Test manual execution to isolate issues
4. Verify all secrets are properly configured