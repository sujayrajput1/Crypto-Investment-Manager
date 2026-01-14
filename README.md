# Crypto Portfolio Manager (Crypto Investment Manager)

**Infosys Springboard 6.0 | Python Crypto Investment Manager Project**  

This repository hosts the source code for the **Crypto Portfolio Manager**, a system designed to calculate optimal crypto asset mixes and perform risk monitoring.

---

## Project Architecture

The system is built using a **Decoupled Two-Tier Architecture**, ensuring the front-end and back-end are independent and communicate securely via API calls.

| Component    | Technology       | Role                                                                 |
|-------------|-------------------|----------------------------------------------------------------------|
| Backend API | Python (FastAPI)  | Handles all data processing, calculations, and MongoDB interactions. |
| Database    | MongoDB Compass   | Stores user authentication and future risk trend data.               |
| Frontend UI | React.js          | Provides the user interface for input and display.                   |
| Security    | JWT               | Secures the data pipeline between the Frontend and Backend API.      |

---

## 🟢 MILESTONE 1 (Week 1 & 2): Setup and Verification Summary

Milestone 1 successfully established the project environment and verified all core technology integrations.

| Milestone 1 Requirement      | Technical Implementation                                                                 | Status     |
|------------------------------|----------------------------------------------------------------------------------------|-----------|
| Prepare Python with database | MongoDB Compass connection verified and test user schema inserted.                        | COMPLETED |
| Teach parallel ways & math   | Theoretical foundation established: Sharpe Ratio (Math) and Threading/Multiprocessing. | COMPLETED |
| Plan crypto types            | Data Strategy defined: Uses historical data (Kaggle) for analysis and real-time data (CoinGecko API) for monitoring. | COMPLETED |
| End-to-End Integration       | Full authentication pipeline (React Login → JWT → MongoDB) successfully tested and verified. | COMPLETED |

---

## 🔵 MILESTONE 2: Module 1 - Investment Mix Calculator


Milestone 2 implemented the core mathematical and concurrency engine. The system can now suggest a **"Profitable Mix"** based on historical risk and return analysis.

| Milestone 2 Requirement | Technical Implementation                                                                 | Status     |
|-------------------------|----------------------------------------------------------------------------------------|-----------|
| Log Returns Calculation | Implemented log-normal return processing using NumPy and Pandas.                        | COMPLETED |
| Monte Carlo Engine      | Built a parallelized engine running 10,000 simulations per request.                    | COMPLETED |
| Multiprocessing         | Optimized performance using Python's Pool to utilize multi-core CPUs.                  | COMPLETED |
| Investment Strategy UI  | New React interface for budget input and selection of 56+ unique assets.                | COMPLETED |
| Data Persistence        | Detailed profitable mixes and Sharpe ratios saved to MongoDB history.                  | COMPLETED |

### Key Formulas for Investment Mix Calculation

1. **Log Returns** (for each asset \(i\))  

\[
R_i(t) = \ln \frac{P_i(t)}{P_i(t-1)}
\]  

Where:  
- \(R_i(t)\) = log return of asset \(i\) at time \(t\)  
- \(P_i(t)\) = price of asset \(i\) at time \(t\)  

---

2. **Portfolio Return**  

\[
R_p = \sum_{i=1}^{n} w_i \cdot \bar{R_i}
\]  

Where:  
- \(R_p\) = expected portfolio return  
- \(w_i\) = weight of asset \(i\) in the portfolio  
- \(\bar{R_i}\) = mean historical return of asset \(i\)  
- \(n\) = total number of assets  

---

3. **Portfolio Volatility**  

\[
\sigma_p = \sqrt{\sum_{i=1}^{n} \sum_{j=1}^{n} w_i w_j \sigma_{ij}}
\]  

Where:  
- \(\sigma_p\) = portfolio standard deviation (risk)  
- \(w_i, w_j\) = weights of assets \(i\) and \(j\)  
- \(\sigma_{ij}\) = covariance between asset \(i\) and asset \(j\)  

---

4. **Sharpe Ratio** (to select optimal portfolio)  

\[
\text{Sharpe Ratio} = \frac{R_p - R_f}{\sigma_p}
\]  

Where:  
- \(R_f\) = risk-free rate  
- \(R_p\) = portfolio return  
- \(\sigma_p\) = portfolio volatility  

---

These formulas allow the system to run **Monte Carlo simulations** for thousands of portfolios and select the one with the **highest Sharpe Ratio** as the “Profitable Mix.”



## 🟡 MILESTONE 3: Module 2 - Risk Monitoring & Alerts

The final module enables live tracking, professional file saving, and urgent risk alerts.

| Milestone 3 Requirement | Technical Implementation                                                                 | Status     |
|-------------------------|----------------------------------------------------------------------------------------|-----------|
| Risk Checker            | Uses parallel tasks to fetch live prices and apply status badges.                       | COMPLETED |
| Identity System         | Persistent user login/signup with hashed password security.                             | COMPLETED |
| Predictor               | Predicts profitable mixes from historical dataset.csv changes.                          | COMPLETED |
| Simple Database         | Portfolio trends and removals are synced instantly to the cloud.                        | COMPLETED |
| File Saver              | Generates clean, text-based CSV reports for Excel compatibility.                        | COMPLETED |
| Alert Link              | Immediate email notifications for DANGER zone assets.                                    | COMPLETED |

### Live Risk Logic

The **Risk Engine** evaluates assets using a percentage-based threshold system:

- 🟢 **Profit**: Price increase > 5% since purchase.    
- 🔴 **Loss**: Price drop > 5% (Triggers immediate email alert).  

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


---

**Crypto Investment Manager** - Your intelligent companion for cryptocurrency investment management and portfolio optimization.
