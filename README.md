<div align="center">
  <img src="public/readme/hero.webp" alt="Signalist Banner" width="800" />
  
  <h1 align="center">📈 Signalist - Modern Stock Market Tracker</h1>
  
  <div>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  </div>

  <p align="center">
    A modern, AI-powered stock market tracking application with real-time data, personalized alerts, and beautiful visualizations.
    Built with Next.js, TypeScript, and Tailwind CSS.
  </p>

  <div>
    <a href="#-features">Features</a> •
    <a href="#-demo">Live Demo</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-contributing">Contributing</a>
  </div>
</div>

## ✨ Features

### 📊 Real-time Market Data
- Live stock prices with real-time updates
- Interactive candlestick charts with technical indicators
- Detailed company profiles and financials
- Market overview and sector performance

### 🔔 Smart Alerts
- Custom price alerts with email notifications
- Technical indicator-based alerts
- AI-powered trend predictions
- Volume spike notifications

### 📱 Personalized Experience
- Custom watchlists with drag-and-drop organization
- Portfolio tracking with performance metrics
- Dark/Light mode with system preference detection
- Responsive design for all devices

### 🤖 AI-Powered Insights
- Sentiment analysis of news and social media
- Predictive analytics for stock performance
- Automated technical analysis
- Earnings and financial report analysis

## 🚀 Live Demo

[![Watch Demo](https://img.youtube.com/vi/gu4pafNCXng/maxresdefault.jpg)](https://youtu.be/gu4pafNCXng)

*Experience Signalist live: [https://signalist.vercel.app](https://signalist.vercel.app)*

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: shadcn/ui
- **Data Visualization**: Recharts & TradingView Lightweight Charts
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod
- **Icons**: Lucide Icons

### Backend
- **Runtime**: Node.js 18+
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with JWT
- **API**: Finnhub, Alpha Vantage
- **Real-time**: WebSockets for live updates
- **Caching**: Redis (optional for production)
- **Deployment**: Vercel (Frontend) & MongoDB Atlas (Database)

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or later
- npm 9.x or yarn 1.22.x
- MongoDB Atlas account or local MongoDB instance
- Finnhub API key (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/signalist.git
   cd signalist
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   FINNHUB_API_KEY=your_finnhub_api_key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 📦 Project Structure

```
signalist/
├── app/                    # App router pages
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn/ui components
│   └── charts/             # Chart components
├── lib/                    # Utility functions and configs
├── models/                 # Database models
├── public/                 # Static files
├── styles/                 # Global styles
└── types/                  # TypeScript type definitions
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork** the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the Branch (`git push origin feature/AmazingFeature`)
5. Open a **Pull Request**

### � Reporting Issues

Found a bug? Please open an [issue](https://github.com/yourusername/signalist/issues) and help us improve Signalist!

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework for Production
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components
- [Finnhub](https://finnhub.io/) - Financial data API
- [TradingView](https://www.tradingview.com/) - Financial charts

## 📞 Contact

Akshay Kumar - [@akshaykumar](https://twitter.com/akshaykumar)

Project Link: [https://github.com/yourusername/signalist](https://github.com/yourusername/signalist)

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/yourusername">Akshay Kumar</a>
</div>