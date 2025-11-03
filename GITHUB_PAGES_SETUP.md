# 🌐 GitHub Pages Setup Instructions

## ⚠️ Important: Manual Configuration Required

After pushing the code, you **must** enable GitHub Pages in repository settings for the deployment to work.

## 📋 Steps to Enable GitHub Pages

1. **Go to Repository Settings**:
   - Navigate to: `https://github.com/aciuffolini/Agentic-Farm-Visit/settings/pages`

2. **Configure Source**:
   - **Source**: Select "GitHub Actions" (not "Deploy from a branch")
   - Click "Save"

3. **Verify**:
   - The workflow will now run automatically on push to `main`
   - Check Actions tab: `https://github.com/aciuffolini/Agentic-Farm-Visit/actions`
   - After workflow completes, your site will be at: `https://aciuffolini.github.io/Agentic-Farm-Visit/`

## 🔍 Troubleshooting

### Workflow Not Running
- Check if GitHub Pages is enabled in Settings → Pages
- Verify the workflow file exists: `.github/workflows/deploy-pages.yml`
- Check Actions tab for any errors

### Workflow Fails
- Check the Actions logs for specific errors
- Common issues:
  - Missing dependencies
  - Build errors
  - Path issues in workflow

### Pages Not Accessible
- Wait 1-2 minutes after workflow completes
- Check Settings → Pages for the deployment status
- Verify the URL: `https://aciuffolini.github.io/Agentic-Farm-Visit/`

## ✅ Verification Checklist

- [ ] GitHub Pages enabled in repository settings
- [ ] Source set to "GitHub Actions"
- [ ] Workflow file exists (`.github/workflows/deploy-pages.yml`)
- [ ] Workflow runs successfully in Actions tab
- [ ] Site accessible at `https://aciuffolini.github.io/Agentic-Farm-Visit/`

## 📝 Notes

- GitHub Pages deployment happens automatically on push to `main`
- The workflow builds the app from `apps/web/dist`
- Initial deployment may take 2-5 minutes
- Subsequent deployments are faster (1-2 minutes)


