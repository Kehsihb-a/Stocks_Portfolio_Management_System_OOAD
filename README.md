# Stocks Portfolio Management System (OOAD)

A full-stack web application for tracking stock portfolios, built with React and Spring Boot.

![Tech Stack](https://img.shields.io/badge/React-Frontend-blue)
![Tech Stack](https://img.shields.io/badge/Spring%20Boot-Backend-green)
![Tech Stack](https://img.shields.io/badge/PostgreSQL-Database-blue)

## Live Demo

🚀 Live URL: `ADD_LIVE_URL_HERE`

## Features

- 📈 Real-time stock tracking
- 💼 Portfolio management
- 📊 Investment analytics
- 📱 Responsive design
- 👥 User authentication
- 📑 Watchlist creation
- 📰 Market news and updates
- 📊 Top gainers and losers
- 🔗 Shareable portfolio links

## Tech Stack

### Frontend
- React.js
- Material-UI
- Axios
- React Router
- Recharts

### Backend
- Spring Boot
- Spring Security
- JWT Authentication
- JPA/Hibernate
- PostgreSQL
- Maven

## Prerequisites

- Node.js (v16 or higher)
- Java JDK 17
- Maven
- PostgreSQL
- Docker (optional)

## Environment Variables

### Frontend
```env
REACT_APP_API_URL=your_backend_url
```

### Backend
```env
SPRING_PROFILES_ACTIVE=prod
POSTGRES_URL=your_database_url
POSTGRES_USER=your_database_user
POSTGRES_PASSWORD=your_database_password
TWELVEDATA_API_KEY=your_twelvedata_api_key
ALPHAVANTAGE_API_KEY=your_alphavantage_api_key
FRONTEND_URL=your_frontend_url
```

## Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/Kehsihb-a/Stocks_Portfolio_Management_System_OOAD.git
cd OOAD_Project
```

2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

3. Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

## Docker Deployment

1. Build and run using Docker Compose
```bash
docker-compose up --build
```

## Deployment (Vercel + Backend Host)

### Backend Deployment (Render or Railway)
1. Create a new Web Service.
2. Connect your GitHub repository.
3. Configure:
   - Runtime: `Docker` (use `backend/Dockerfile`)
   - Root Directory: `backend`
   - Health Check Path: `/actuator/health`
   - Environment Variables: set all backend vars listed above.
4. Deploy and copy the backend URL.

### Frontend Deployment (Vercel)
1. Import the GitHub repo in Vercel.
2. Configure:
   - Framework: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
3. Add environment variables:
   - `REACT_APP_API_URL` = your backend URL from step 4 above.
4. Deploy and copy the Vercel URL to update `Live URL`.

## API Documentation

### Authentication Endpoints
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### Stock Endpoints
- GET `/api/stocks/search` - Search stocks
- GET `/api/stocks/{symbol}/quote` - Get stock quote
- GET `/api/stocks/top-movers` - Get top gainers/losers
- GET `/api/stocks/news` - Get market news

### Portfolio Endpoints
- GET `/api/holdings` - Get user holdings
- GET `/api/holdings/shared/{userId}` - Get shared portfolio
- POST `/api/transactions/buy` - Buy stock
- POST `/api/transactions/sell` - Sell stock

### Watchlist Endpoints
- GET `/api/watchlists` - Get user watchlists
- POST `/api/watchlists` - Create watchlist
- POST `/api/watchlists/{id}/stocks/{symbol}` - Add stock to watchlist
- DELETE `/api/watchlists/{id}/stocks/{symbol}` - Remove stock from watchlist

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [TwelveData API](https://twelvedata.com/) for real-time stock data
- [Alpha Vantage](https://www.alphavantage.co/) for market data and news
- [Material-UI](https://mui.com/) for the UI components
