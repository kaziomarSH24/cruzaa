# CI/CD Pipeline Documentation

This project uses **GitHub Actions** to automatically test and build the frontend on every push and pull request.

## Pipeline Overview

The CI/CD pipeline consists of three jobs:

### 1. **Lint & Test** (Runs on: Ubuntu Latest)
- Runs on Node.js 18.x and 20.x (matrix strategy)
- **Linting**: Checks code quality with ESLint
- **Testing**: Runs all unit tests with Vitest
- **Build**: Creates production bundle with Vite
- Continues even if lint or test fails, but keeps the status

### 2. **Build** (Depends on Lint & Test)
- Only runs if the previous job succeeds
- Creates optimized production bundle
- Uploads `dist/` folder as artifacts for 30 days
- Artifacts can be downloaded from GitHub Actions

### 3. **Quality Summary** (Final Check)
- Provides overall pipeline status
- Fails if any previous job failed
- Useful for PR status checks

## Triggers

The pipeline runs automatically on:
- ✅ Push to `main`, `develop`, or `dev` branches
- ✅ Pull requests to `main`, `develop`, or `dev` branches

## Local Development

Before pushing, run these commands locally:

```bash
# Install dependencies
bun install

# Check code quality
bun run lint

# Run tests
bun run test

# Build for production
bun run build

# Run tests in watch mode
bun run test:watch
```

## Viewing Results

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. Select a workflow run to see detailed logs
4. Check individual job steps for errors

## Environment Variables

Currently, no GitHub secrets are required. If you need to add deployment or API keys later, add them to:
- Repository → Settings → Secrets and variables → Actions

## Customizing the Pipeline

To modify the pipeline, edit `.github/workflows/ci-cd.yml`:
- Change Node versions in `strategy.matrix.node-version`
- Add deployment steps
- Add additional test/lint commands
- Adjust artifact retention

## Troubleshooting

### Pipeline failing on lint
```bash
# Run locally to see exact error
bun run lint

# Fix auto-fixable errors
bun run lint -- --fix
```

### Tests failing
```bash
# Run tests locally
bun run test

# Run tests in watch mode to debug
bun run test:watch
```

### Build failing
```bash
# Build locally to see exact error
bun run build

# Check dist folder was created
ls -la dist/
```

## Future Enhancements

Consider adding:
- [ ] Automated deployment to Vercel/Netlify
- [ ] CodeQL security scanning
- [ ] Performance metrics
- [ ] Bundle size analysis
- [ ] Visual regression testing
- [ ] Slack/Discord notifications
