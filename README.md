
# Crypto Investment Manager

A comprehensive cryptocurrency investment management platform that helps users optimize their investment portfolios, analyze risks, and track performance with intelligent alerts and reporting features.

## Features

### Core Functionality
- **User Authentication**: Secure login and signup system with user-specific data isolation
- **Portfolio Management**: Track and manage cryptocurrency investments with real-time price updates
- **Investment Optimization**: Rule-based portfolio optimization with weight sliders and strategy options
- **Risk Analysis**: Real-time risk assessment with historical charts and AI-powered prediction models
- **Smart Alerts**: Customizable price and portfolio value alerts with auto-generation based on holdings
- **Comprehensive Reports**: Detailed investment reports with export functionality
- **User Data Isolation**: Each user has completely separate data that persists across sessions

### Key Features
- **Real-time Portfolio Tracking**: Monitor cryptocurrency investments with live price updates
- **Investment Mix Optimization**: Smart portfolio rebalancing with risk-return optimization
- **Risk Analysis & Predictions**: Advanced risk metrics with AI-powered predictions
- **Intelligent Alert System**: Auto-generated alerts based on portfolio composition and market conditions
- **Detailed Reporting**: Exportable reports for portfolio analysis and tax purposes
- **Multi-User Support**: Complete data isolation between different users
- **Cross-Session Persistence**: User data persists across browser sessions

## Tech Stack

### Frontend
- **React 18**: Modern React with hooks for state management
- **React Router**: Client-side routing for single-page application
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Heroicons**: Professional icon library for UI components
- **Axios**: HTTP client for API communication

### Backend Integration
- **RESTful API**: Backend integration for authentication and data persistence
- **Mock Mode**: Full functionality available without backend for demo purposes
- **LocalStorage**: Client-side data persistence for offline functionality

## Quick Start

### Prerequisites
- Node.js 14+ 
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd crypto-investment-manager
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open the application**
   Navigate to `http://localhost:3000` in your browser

### Backend Setup (Optional)
The application includes a complete mock mode that works without a backend. To connect to a real backend:

1. **Start the backend server**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Configure API endpoint**
   The frontend will automatically connect to `http://localhost:8001` for API calls

## Usage Guide

### Getting Started

1. **Create an Account**
   - Click "Sign Up" on the landing page
   - Enter your email, full name, and password
   - Your account is created with user-specific data isolation

2. **Login**
   - Click "Login" on the landing page
   - Enter your credentials
   - You'll be redirected to your personal dashboard

3. **Dashboard Overview**
   - View your current portfolio value and performance
   - Add new investments using the "Add Investment" button
   - Monitor real-time price updates
   - View portfolio metrics and risk level

### Portfolio Management

#### Adding Investments
1. Click "Add Investment" on the dashboard
2. Select cryptocurrency (BTC, ETH, BNB, ADA, SOL)
3. Enter investment amount and price per unit
4. Click "Add to Portfolio"

#### Portfolio Optimization
1. Navigate to the Portfolio page
2. Use weight sliders to adjust allocation
3. Select investment strategy (Conservative, Balanced, Aggressive)
4. View optimization recommendations
5. Apply changes to update your portfolio

### Risk Analysis

#### Risk Assessment
1. Navigate to the Risk page
2. View real-time risk metrics for your portfolio
3. Analyze historical risk charts
4. Review AI-powered predictions
5. Monitor portfolio volatility and diversification

#### Risk Metrics
- **Risk Level**: Low, Medium, or High based on portfolio composition
- **Volatility**: Portfolio volatility percentage
- **Diversification Score**: How well-diversified your portfolio is
- **Predicted Returns**: Expected returns based on historical data

### Alerts Management

#### Creating Alerts
1. Navigate to the Alerts page
2. Click "Add Alert"
3. Configure alert parameters:
   - **Symbol**: Cryptocurrency or "Portfolio"
   - **Condition**: Above or below threshold
   - **Threshold**: Price or portfolio value trigger
   - **Message**: Custom alert message
4. Save the alert

#### Auto-Generated Alerts
The system automatically creates alerts based on:
- **Portfolio Value**: Large holdings and significant portfolio changes
- **Price Volatility**: High volatility detected in your holdings
- **Risk Level**: Alerts for high-risk portfolios

### Reports

#### Generating Reports
1. Navigate to the Reports page
2. Click "Add Report"
3. Select report type:
   - **Portfolio Summary**: Current portfolio snapshot
   - **Risk Analysis**: Current risk assessment
   - **Performance Report**: Historical performance
4. View and export reports

#### Export Options
- **Investment Breakdown CSV**: Detailed portfolio allocation
- **Combined Report CSV**: Comprehensive report with all data
- **Individual Reports**: Export specific reports

## Architecture

### Data Flow
```
User Login → Authentication → User Data Loading → Dashboard
    ↓
Portfolio Management → Risk Analysis → Alert Generation → Reporting
    ↓
User-Specific Storage (localStorage) → Cross-Session Persistence
```

### User Data Isolation
Each user has completely separate data stored with email-based keys:
- `portfolio_user@example.com`: User's portfolio data
- `reports_user@example.com`: User's reports
- `alerts_user@example.com`: User's alerts

### Component Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
│   ├── Dashboard.jsx     # Main dashboard and portfolio management
│   ├── Portfolio.jsx     # Portfolio optimization
│   ├── Risk.jsx         # Risk analysis and predictions
│   ├── Reports.jsx       # Report generation and export
│   ├── Alerts.jsx       # Alert management
│   ├── Login.jsx        # User authentication
│   ├── Signup.jsx       # User registration
│   └── Landing.jsx      # Landing page
├── services/           # API and business logic
│   ├── AuthService.js    # Authentication and user management
│   └── ApiService.js    # API communication
└── App.jsx            # Main application component and routing
```

## Configuration

### Environment Variables
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_BASE_URL=http://localhost:8001
```

### Demo Mode
The application includes a demo mode that works without a backend:
- Set `DEMO_MODE = true` in `src/services/AuthService.js`
- All functionality works with mock data
- Perfect for demonstrations and testing

## UI/UX Features

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive layout for tablets
- **Desktop Experience**: Full-featured desktop interface

### User Experience
- **Intuitive Navigation**: Clear navigation between features
- **Real-time Updates**: Live price updates and portfolio changes
- **Smart Defaults**: Intelligent default values for new users
- **Error Handling**: Graceful error handling with user-friendly messages

### Visual Design
- **Modern Interface**: Clean, professional design
- **Consistent Styling**: Unified design language across all pages
- **Interactive Elements**: Smooth transitions and hover effects
- **Data Visualization**: Charts and graphs for portfolio analysis

## Deployment

### Production Build
```bash
npm run build
```

### Deployment Options
- **Static Hosting**: Deploy to Netlify, Vercel, or GitHub Pages
- **Server Hosting**: Deploy to any web server with static file serving
- **Docker**: Containerize for easy deployment

## Contributing

### Development Guidelines
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- Use ES6+ JavaScript features
- Follow React best practices
- Maintain consistent code style
- Add comments for complex logic

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

### Common Issues

#### Login Problems
- **Backend Unavailable**: The app automatically switches to demo mode
- **Invalid Credentials**: Check email and password
- **Data Not Loading**: Clear browser cache and try again

#### Portfolio Issues
- **Prices Not Updating**: Check internet connection
- **Investments Not Saving**: Ensure you're logged in
- **Calculations Wrong**: Refresh the page to reload data

#### Alert Problems
- **Alerts Not Triggering**: Check threshold values
- **Too Many Alerts**: Review and remove unnecessary alerts
- **Auto-Alerts Missing**: Add investments to trigger generation

### Getting Help
- Check the browser console for error messages
- Review the network tab for API issues
- Ensure all dependencies are installed correctly

## Updates and Future Features

### Planned Enhancements
- **More Cryptocurrencies**: Support for additional coins
- **Advanced Analytics**: Machine learning predictions
- **Mobile App**: Native mobile applications
- **Social Features**: Portfolio sharing and comparison
- **Tax Reporting**: Automated tax calculation and reporting

### Version History
- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Added user data isolation and persistence
- **v1.2.0**: Enhanced risk analysis and alert system

---

**Crypto Investment Manager** - Your intelligent companion for cryptocurrency investment management and portfolio optimization.
=======
# Crypto-Investment-Manager
Infosys Springboard 6.0 | Python Crypto Investment Manager Project This repository hosts the source code for the Crypto Portfolio Manager, a system designed to calculate optimal crypto asset mixes and perform risk monitoring.
>>>>>>> 92280b4701bb5ba1159e2a95cf8d6cd955f05312
