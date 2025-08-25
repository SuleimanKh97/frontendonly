# Royal Library Frontend

A modern React-based frontend for the Royal Library management system.

## 🚀 Deployment on Vercel

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Vercel account

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

For local development:
```env
VITE_API_BASE_URL=http://localhost:5035/api
```

### Deployment Steps

1. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**

   **Option A: Using Vercel CLI**
   ```bash
   npm install -g vercel
   vercel
   ```

   **Option B: Using Vercel Dashboard**
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy

### Environment Variables in Vercel

In your Vercel project settings, add the following environment variable:

- `VITE_API_BASE_URL`: Your production API URL (e.g., `https://your-api-domain.com/api`)

### Build Configuration

The project is configured with:
- Vite for fast builds
- React 19
- Tailwind CSS
- Radix UI components
- Optimized chunk splitting for better performance

### Features

- 📚 Book management system
- 👥 User authentication
- 🎯 Quiz system
- 📊 Admin dashboard
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── lib/           # Utilities and API services
├── hooks/         # Custom React hooks
└── assets/        # Static assets
```

### API Integration

The frontend communicates with the backend API through the `ApiService` class in `src/lib/api.js`. Make sure your backend API is deployed and accessible before deploying the frontend.
