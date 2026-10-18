# 🚚 DeliTrack - Real-Time Delivery Tracking & Order Management System

A full-stack web application for managing orders, monitoring deliveries in real time, and providing transparent status updates to customers.

![Node.js](https://img.shields.io/badge/Node.js-v20-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-8-brightgreen)
![Socket.io](https://img.shields.io/badge/Socket.io-4-black)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

### 👤 Customer Features
- Place and manage delivery orders
- Real-time order tracking with live map
- Status notifications and delivery history
- Track orders via unique tracking ID

### 🚴 Delivery Agent Features
- View and manage assigned deliveries
- Update delivery status in real-time
- Share live location during deliveries
- Delivery history and statistics

### 🛡️ Admin Features
- Centralized dashboard with KPIs
- Order and user management
- Assign deliveries to agents
- Performance reports and analytics

### 🔧 Technical Features
- **Real-time tracking** with Socket.io WebSockets
- **Interactive maps** with Leaflet.js & OpenStreetMap
- **JWT authentication** with role-based access control
- **Responsive design** with Tailwind CSS
- **RESTful API** with Express.js

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18 + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Real-Time | Socket.io |
| Maps | Leaflet.js (OpenStreetMap) |
| Auth | JWT + bcryptjs |

## 📁 Project Structure

```
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── context/         # Auth & Socket context
│   │   ├── services/        # API service layer
│   │   └── main.jsx         # Entry point
│   ├── public/
│   └── package.json
├── server/                  # Express Backend
│   ├── config/              # Database config
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── socket/              # Socket.io handlers
│   ├── seeds/               # Demo data seeder
│   └── server.js            # Entry point
├── .gitignore
├── package.json             # Root scripts
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ 
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/delivery-tracking-system.git
cd delivery-tracking-system
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Configure environment variables

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/delivery-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this
```

### 4. Seed demo data (optional)
```bash
npm run seed
```

### 5. Run the application

**Development mode (run both servers):**
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

The frontend runs on `http://localhost:3000` and proxies API calls to the backend on `http://localhost:5000`.

## 🔑 Demo Accounts

After running the seeder:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@delivery.com | admin123 |
| Agent | agent1@delivery.com | agent123 |
| Agent | agent2@delivery.com | agent123 |
| User | user1@delivery.com | user123 |
| User | user2@delivery.com | user123 |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Get orders (role-based) |
| GET | `/api/orders/:id` | Get order details |
| PUT | `/api/orders/:id/status` | Update status (Agent) |
| PUT | `/api/orders/:id/assign` | Assign agent (Admin) |
| GET | `/api/orders/:id/track` | Get tracking info |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/performance` | Performance report |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/agents` | List agents |

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repo to Vercel
2. Set build directory to `client`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com`

### Backend (Render)
1. Create a new Web Service on Render
2. Set root directory to `server`
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables (MONGODB_URI, JWT_SECRET)

## 📊 Key Performance Indicators

- On-time delivery rate
- Average delivery duration
- Order tracking accuracy
- Number of active deliveries
- Customer satisfaction score

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Unified Mentor](https://www.unifiedmentor.com/) - Collaborating Organization
- [Delhivery](https://www.delhivery.com/) - Reference Website
- [OpenStreetMap](https://www.openstreetmap.org/) - Map tiles
- [Leaflet.js](https://leafletjs.com/) - Interactive maps
