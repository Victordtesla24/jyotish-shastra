# Environment Setup Guide

## Required Environment Variables

To run the Jyotish Shastra application with full geocoding functionality, you need to configure the following environment variables:

### Backend (.env in project root)

```bash
# Server Configuration
NODE_ENV=development
PORT=3001

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Geocoding Service Configuration
# REQUIRED: Get your free API key from https://opencagedata.com/
GEOCODING_API_KEY=your_opencage_api_key_here

# Optional: Logging Configuration
LOG_LEVEL=info

# Optional: Rate Limiting Configuration
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### Frontend (.env in client/ directory)

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Optional: Development Configuration
GENERATE_SOURCEMAP=false
```

## Getting Started

1. **Get Geocoding API Key**:
   - Visit [OpenCage Geocoding API](https://opencagedata.com/)
   - Sign up for a free account (2,500 requests/day free tier)
   - Copy your API key

2. **Configure Backend**:
   ```bash
   # In project root
   cp .env.example .env
   # Edit .env and add your GEOCODING_API_KEY
   ```

3. **Configure Frontend**:
   ```bash
   # In client/ directory
   echo "REACT_APP_API_URL=http://localhost:3001/api" > .env
   ```

4. **Start Services**:
   ```bash
   # Start backend (from project root)
   npm start

   # Start frontend (from client/ directory)
   cd client && npm start
   ```

## Features Enabled

With proper environment configuration, the following features are enabled:

- ✅ **Automatic Geocoding**: Users enter "City, State, Country" and coordinates are automatically resolved
- ✅ **Real-time Location Validation**: Immediate feedback on location search results
- ✅ **Timezone Suggestions**: Automatic timezone selection based on coordinates
- ✅ **Enhanced Error Handling**: Graceful degradation when geocoding service is unavailable

## Troubleshooting

### "Geocoding service is temporarily unavailable"
- Check that `GEOCODING_API_KEY` is set in your .env file
- Verify your OpenCage API key is valid
- Ensure you haven't exceeded your API quota

### "Location not found"
- User should try a more specific address
- Check that the location name is spelled correctly
- Try format: "City, State/Province, Country"

### API Connection Issues
- Verify `REACT_APP_API_URL` matches your backend URL
- Check that backend server is running on specified port
- Ensure CORS is properly configured
