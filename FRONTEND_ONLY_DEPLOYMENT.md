# 🚀 Frontend-Only Deployment to Vercel

## Quick Deploy (Frontend Only)

### Prerequisites
- Your backend API running locally on `http://localhost:5035`
- Git repository with your code
- Vercel account

### Step 1: Prepare Your Repository
1. Push your code to GitHub/GitLab/Bitbucket
2. Make sure all files are committed

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `library-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Environment Variables
**Important**: For frontend-only deployment, you have two options:

#### Option A: Use Localhost (Development)
Set this environment variable in Vercel:
```
VITE_API_BASE_URL=http://localhost:5035/api
```
**Note**: This will only work when you access the Vercel app from the same machine where your backend is running.

#### Option B: Use ngrok (Recommended)
1. Install ngrok: https://ngrok.com/
2. Run your backend locally: `dotnet run` (in LibraryManagementAPI folder)
3. In another terminal, run: `ngrok http 5035`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Set environment variable in Vercel:
```
VITE_API_BASE_URL=https://abc123.ngrok.io/api
```

### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

## Testing Your Deployment

### With Localhost Backend
- Your Vercel app will work when accessed from your local machine
- The frontend will communicate with your local backend

### With ngrok Backend
- Your Vercel app will work from anywhere
- The frontend will communicate with your ngrok-tunneled backend

## Important Notes

⚠️ **Limitations of Frontend-Only Deployment:**
- If using localhost: Only works from your local machine
- If using ngrok: Backend must stay running locally
- Not suitable for production use

✅ **Benefits:**
- Quick deployment for testing
- No backend hosting costs
- Easy to update and test

## Next Steps

When you're ready for full production deployment:
1. Deploy your backend to Railway/Azure/Render
2. Update `VITE_API_BASE_URL` to your production backend URL
3. Redeploy the frontend

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Verify Node.js version is 18+ in Vercel settings

### API Connection Issues
- Ensure your backend is running locally
- Check that `VITE_API_BASE_URL` is set correctly
- If using ngrok, make sure the tunnel is active

### CORS Issues
- Your local backend may need CORS configuration for Vercel domains
- Add this to your backend's CORS policy:
```csharp
policy.WithOrigins("https://your-app.vercel.app")
```
