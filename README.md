# Jyotish Shastra - Vedic Astrology Application

A comprehensive Vedic astrology application with automated geocoding integration, providing detailed birth chart analysis and cosmic insights.

## 🌟 Features

- **Automated Geocoding**: Enter any location and get precise coordinates automatically
- **Enhanced UI Components**: Beautiful, responsive design with Framer Motion animations
- **Comprehensive Analysis**: Detailed Vedic astrology analysis and predictions
- **Real-time Integration**: Seamless frontend-backend communication
- **Demo Mode**: Works out-of-the-box with demo geocoding data

## 🚀 Quick Start

### 1. Environment Setup

**Backend Configuration:**
```bash
# Copy and configure environment variables
cp .env.example .env

# Edit .env file with your settings:
GEOCODING_API_KEY=your_opencage_api_key_here  # Get free key at https://opencagedata.com/
NODE_ENV=development
PORT=3001
```

**Frontend Configuration:**
```bash
# Create React environment file
echo "REACT_APP_API_URL=http://localhost:3001/api" > client/.env.local
echo "GENERATE_SOURCEMAP=false" >> client/.env.local
```

### 2. Get Free Geocoding API Key (Optional)

For production use, get a free OpenCage API key:

1. Visit [OpenCage Geocoding API](https://opencagedata.com/users/sign_up)
2. Sign up for free account (2,500 requests/day)
3. Get your API key
4. Replace `demo_key_temporary_until_you_get_real_key` in `.env` file

**Note**: The app works in demo mode without a real API key for testing.

### 3. Installation & Start

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..

# Start backend server (Terminal 1)
npm run dev

# Start frontend server (Terminal 2)
cd client && npm start
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **API Health**: http://localhost:3001/api/health

## 🔧 API Endpoints

### Geocoding
- `POST /api/v1/geocoding/location` - Convert location to coordinates
- `POST /api/v1/geocoding/timezone` - Get timezone for coordinates
- `GET /api/v1/geocoding/validate` - Validate coordinates

### Chart Generation
- `POST /api/v1/chart/generate` - Generate Vedic birth chart
- `GET /api/v1/chart/:id` - Get chart by ID
- `POST /api/v1/analysis/comprehensive` - Comprehensive analysis

## 🎯 Key Features Resolved

### ✅ Automated Geocoding Integration
- Real-time location → coordinates conversion
- Demo mode with 50+ predefined locations
- Error handling and fallback mechanisms

### ✅ Enhanced UI Components
- HeroSection with cosmic animations
- MobileOptimizedChart with touch gestures
- Improved form validation and feedback

### ✅ Environment-Based Configuration
- No hardcoded API endpoints
- Configurable for development/production
- Proper environment variable management

### ✅ Complete UI-Backend Integration
- Seamless data flow from form to chart generation
- Proper error handling and user feedback
- Real-time geocoding validation

## 🛠️ Development

### Demo Locations Supported
The app includes demo geocoding for major cities:

**Indian Cities**: Mumbai, Delhi, Bangalore, Pune, Kolkata, Chennai, Hyderabad
**International**: London, New York, Tokyo, Paris, Sydney, Berlin

### Testing API Integration

```bash
# Test geocoding endpoint
curl -X POST http://localhost:3001/api/v1/geocoding/location \
  -H "Content-Type: application/json" \
  -d '{"placeOfBirth": "Pune, Maharashtra, India"}'

# Test chart generation
curl -X POST http://localhost:3001/api/v1/chart/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "dateOfBirth": "1990-01-01",
    "timeOfBirth": "12:00",
    "placeOfBirth": "Mumbai, Maharashtra, India",
    "latitude": 19.076,
    "longitude": 72.8777,
    "timezone": "Asia/Kolkata"
  }'
```

## 📁 Project Structure

```
jyotish-shastra/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API integration
│   │   └── pages/          # Application pages
├── src/                    # Node.js backend
│   ├── api/                # API routes and controllers
│   ├── services/           # Business logic
│   └── core/               # Vedic astrology calculations
└── docs/                   # Documentation
```

## 🌐 Deployment

The application is configured for seamless deployment with environment-based API URL configuration and production-ready error handling.

---

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

---

*Built with modern React.js, Node.js, and comprehensive Vedic astrology calculations.*
