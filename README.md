# Wholesale Business Management System

A comprehensive CRM system for managing wholesale businesses, customers, deliveries, and reminders.

## 🚀 Features

- **Customer Management** - Track businesses, contacts, and relationships
- **Delivery Management** - Quote, track, and manage deliveries
- **Automated Reminders** - 15-day revisit reminders with status tracking
- **Product Management** - Multiple product groups (Dhoop, Raw Agarbatti, Camphor, Oil, etc.)
- **Dashboard & Reports** - Real-time metrics and analytics
- **User Management** - Role-based access (Super Admin, Admin, Staff)
- **File Uploads** - Attach bills and documents
- **Activity Logging** - Complete audit trail

## 📋 Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- MongoDB
- JWT Authentication
- Zod Validation

### Frontend
- React 19
- TypeScript
- React Router
- Zustand (State Management)
- Axios
- TailwindCSS
- Recharts

## 🏗️ Architecture

This is a **unified application** where:
- Backend serves both API (`/api/v1/*`) and frontend static files
- Single deployment artifact
- Optimized for production with minimal overhead

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm run install:all

# Setup database
npm run prisma:generate
npm run prisma:push
npm run prisma:seed

# Start development servers
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api/v1

### Production

```bash
# Build application
./scripts/build.sh

# Start production server
npm start
```

Access: http://localhost:5001

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy with Docker

```bash
# Copy environment file
cp .env.production.example .env

# Edit with your values
nano .env

# Build and run
docker-compose up -d
```

## 🔐 Default Credentials

After seeding the database:

- **Super Admin**: superadmin@wholesale.local / Password123!
- **Admin**: admin@wholesale.local / Password123!
- **Staff**: staff@wholesale.local / Password123!

⚠️ **Change these passwords immediately in production!**

## 📁 Project Structure

```
wholesale-business-management/
├── backend/                 # Backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── middleware/     # Express middleware
│   │   ├── jobs/          # Cron jobs
│   │   └── lib/           # Utilities
│   ├── prisma/            # Database schema
│   └── tests/             # Backend tests
├── frontend/              # Frontend application
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API services
│   │   └── hooks/        # Custom hooks
├── scripts/              # Deployment scripts
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose config
└── DEPLOYMENT.md         # Deployment guide
```

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run with coverage
cd backend && npm test -- --coverage
```

## 📊 API Documentation

### Authentication
- `POST /api/v1/users/login` - Login
- `POST /api/v1/users/refresh` - Refresh token

### Customers
- `GET /api/v1/customers` - List customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/:id` - Get customer details
- `PATCH /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Archive customer

### Deliveries
- `GET /api/v1/deliveries` - List deliveries
- `POST /api/v1/deliveries` - Create delivery
- `GET /api/v1/deliveries/:id` - Get delivery details
- `PATCH /api/v1/deliveries/:id` - Update delivery
- `DELETE /api/v1/deliveries/:id` - Delete delivery

### Reminders
- `GET /api/v1/reminders` - List reminders
- `PATCH /api/v1/reminders/:id/complete` - Mark complete
- `PATCH /api/v1/reminders/:id/snooze` - Snooze reminder

### Dashboard & Reports
- `GET /api/v1/dashboard/summary` - Dashboard metrics
- `GET /api/v1/reports/deliveries` - Delivery reports
- `GET /api/v1/reports/reminders` - Reminder reports

## 🔧 Configuration

### Environment Variables

See `.env.production.example` for all available options.

Required variables:
- `DATABASE_URL` - MongoDB connection string
- `JWT_ACCESS_SECRET` - JWT secret for access tokens
- `JWT_REFRESH_SECRET` - JWT secret for refresh tokens

### Product Configuration

Products are configured in `backend/src/modules/deliveries/delivery.constants.ts`:

- **DHOOP** - 100gm
- **RAW_AGARBATTI** - 1kg, 1/2kg, 250gm, 100gm (with types: Rose, Sandalwood, Lavender, 3 in 1, Standard)
- **CAMPHOR** - 1kg, 1/2kg, 250gm, 100gm, 50gm, 20rs, 10rs
- **COTTON_WICKS** - 10rs
- **HARSHNA_KUNKUM** - 10rs
- **OIL** - 1lt, 500ml

## 🔄 Reminder System

- Automatically creates 15-day revisit reminders for quoted deliveries
- Updates reminder status hourly (PENDING → UPCOMING → OVERDUE)
- Runs integrity checks every 6 hours
- Frontend polls every 60 seconds for real-time updates

## 🛡️ Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting (200 requests per 15 minutes)
- Helmet security headers
- CORS configuration
- Input validation with Zod
- SQL injection protection (Prisma)
- XSS protection

## 📈 Performance

- Optimized database queries with limits
- Static file caching
- Gzip compression
- Code splitting and tree-shaking
- Lazy loading
- Real-time updates with polling

## 🐛 Troubleshooting

See [DEPLOYMENT.md](./DEPLOYMENT.md#-troubleshooting) for common issues and solutions.

## 📝 License

Private - All Rights Reserved

## 🤝 Contributing

This is a private project. Contact the maintainer for contribution guidelines.

## 📞 Support

For support, contact your system administrator or refer to the documentation.

---

**Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** April 15, 2026
