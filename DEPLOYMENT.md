# 🚀 Vercel Deployment Guide

## Prerequisites

### 1. Backend API Deployment
**IMPORTANT**: Before deploying the frontend, you must deploy your backend API to a cloud service.

**Quick Backend Deployment (Railway - Recommended):**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project
4. Connect your repository
5. Set root directory to `LibraryManagementAPI`
6. Add environment variables (see `LibraryManagementAPI/DEPLOYMENT.md`)
7. Deploy and get your API URL

**Alternative Backend Options:**
- Azure App Service (see `LibraryManagementAPI/DEPLOYMENT.md`)
- Render.com
- Heroku

### 2. Prepare Your Repository
Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `library-frontend` (if your frontend is in a subdirectory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts to configure your project
```

### 3. Environment Variables

In your Vercel project settings, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-api-domain.com/api` | Your production API URL |

**Important**: Replace `https://your-api-domain.com/api` with your actual backend API URL from Railway/Azure/etc.

### 4. Deploy

Click "Deploy" and wait for the build to complete. Your app will be available at a Vercel URL.

## Configuration Files

The following files have been configured for Vercel deployment:

### `vercel.json`
- Configures routing for SPA (Single Page Application)
- Sets up proper caching headers
- Defines build settings

### `vite.config.js`
- Optimized for production builds
- Code splitting for better performance
- Proper asset handling

### `src/lib/api.js`
- Uses environment variables for API URL
- Fallback to localhost for development

## Troubleshooting

### Build Errors
- Make sure all dependencies are in `package.json`
- Check that Node.js version is 18+ in Vercel settings
- Verify build command is correct

### API Connection Issues
- Ensure `VITE_API_BASE_URL` is set correctly
- Check that your backend API is deployed and accessible
- Verify CORS settings on your backend

### Routing Issues
- The `vercel.json` file handles SPA routing
- All routes should redirect to `index.html`

## Performance Optimization

The build is optimized with:
- Code splitting for vendor libraries
- Optimized chunk sizes
- Proper caching headers
- Gzip compression

## Monitoring

After deployment:
1. Check the deployment logs in Vercel dashboard
2. Test all major functionality
3. Monitor performance using Vercel Analytics
4. Set up error tracking if needed

## Custom Domain

To use a custom domain:
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

## Environment-Specific Deployments

You can set up different environments:
- **Production**: Main branch
- **Preview**: Pull requests
- **Development**: Development branch

Each can have different environment variables and settings.
