# Medical Bills Management System

A comprehensive TypeScript-based monorepo for managing medical bills, explanations of benefits, and related healthcare financial data with user authentication and multi-tenancy support.

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript + Sequelize + SQLite
- **Frontend**: Vue.js 3 + TypeScript + Vite
- **Authentication**: Session-based with secure cookies
- **Database**: SQLite (development) / PostgreSQL (production)
- **Testing**: Vitest (API) + Cypress (UI)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Setup

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd medibills
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   # or
   ./scripts/dev.sh
   ```

3. **Access the application:**
   - UI: http://localhost:3000
   - API: http://localhost:3001
   - API Health: http://localhost:3001/health

4. **Login with demo credentials:**
   - Username: `demo`
   - Password: `Demo123!`

## 📁 Project Structure

```
medibills/
├── api/                        # Express API
│   ├── src/
│   │   ├── config/            # Database & session config
│   │   ├── models/            # Sequelize models
│   │   ├── middleware/        # Authentication & validation
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── scripts/           # Database migration & seeding
│   │   └── types/             # TypeScript definitions
│   ├── tests/                 # Vitest unit tests
│   └── database.sqlite        # SQLite database
├── ui/                        # Vue.js frontend
│   ├── src/
│   │   ├── components/        # Vue components
│   │   ├── views/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── stores/            # Pinia state management
│   │   └── router/            # Vue Router
│   └── cypress/               # E2E tests
├── scripts/                   # Development scripts
├── ARCHITECTURE.md            # System architecture
├── DEVELOPMENT_PLAN.md        # Implementation details
└── README.md                  # This file
```

## 🗄️ Database Models

### Core Models
- **Users** - Authentication and user management
- **MedicalProviders** - Healthcare providers information
- **MedicalBills** - Medical bills with charges and service events
- **MedicalBillCharges** - Individual charges on medical bills
- **ExplanationOfBenefits** - Insurance responses and coverage details
- **CollectionBills** - Debt collection notices
- **MedicalServiceEvents** - Individual medical services

### Key Features
- **Multi-tenant**: All data is scoped to authenticated users
- **Relationships**: Proper foreign key relationships between models
- **Data Integrity**: Validation and constraints at database level

## 🔐 Authentication

- **Session-based authentication** with secure HTTP-only cookies
- **Password hashing** using bcrypt with salt rounds
- **CSRF protection** and secure session configuration
- **User isolation** - users can only access their own data

## 🛠️ Development

### Available Scripts

**Root level:**
```bash
npm run dev          # Start both API and UI
npm run build        # Build both projects
npm run test         # Run all tests
npm run setup        # Initial project setup
```

**API specific:**
```bash
npm run dev:api      # Start API only
npm run test:api     # Run API tests
```

**UI specific:**
```bash
npm run dev:ui       # Start UI only
npm run test:ui      # Run UI tests
```

### Environment Configuration

**Root `.env`:**
```env
NODE_ENV=development
API_PORT=3001
UI_PORT=3000
DATABASE_URL=sqlite:./database.sqlite
SESSION_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

**API `api/.env`:**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=sqlite:./database.sqlite
SESSION_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Database Management

```bash
# Initialize database
cd api && npm run db:migrate

# Seed with demo data
cd api && npm run db:seed

# Reset database (careful!)
rm api/database.sqlite && npm run db:migrate && npm run db:seed
```

## 🧪 Testing

### API Testing (Vitest)
```bash
npm run test:api           # Run all API tests
npm run test:api:watch     # Run tests in watch mode
npm run test:api:coverage  # Run with coverage report
```

### UI Testing (Cypress)
```bash
npm run test:ui        # Run E2E tests headless
npm run test:ui:open   # Open Cypress GUI
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `PUT /auth/password` - Update password
- `PUT /auth/profile` - Update profile

### Core Resources (Implemented)
- `GET|POST|PUT|DELETE /api/users` - User management
- `GET|POST|PUT|DELETE /api/medical-bills` - Medical bills
- `GET|POST|PUT|DELETE /api/medical-providers` - Medical providers

### Placeholder Endpoints (To be implemented)
- `GET|POST /api/explanation-of-benefits` - EOB management
- `GET|POST /api/collection-bills` - Collection bills
- `GET|POST /api/medical-service-events` - Service events

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/medibills
SESSION_SECRET=strong-random-secret
CORS_ORIGIN=https://yourdomain.com
```

### Database Migration
The system supports both SQLite (development) and PostgreSQL (production). Update the `DATABASE_URL` environment variable to switch between databases.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Development Notes

### Current Implementation Status
- ✅ Monorepo structure with npm workspaces
- ✅ TypeScript configuration for both API and UI
- ✅ Express server with session authentication
- ✅ Sequelize models with relationships
- ✅ Authentication middleware and routes
- ✅ Vue.js project structure with Vite
- ✅ Development scripts and tooling
- 🚧 Basic CRUD API endpoints (in progress)
- 🚧 Vue components and UI implementation (in progress)
- 🚧 Testing setup and test cases (in progress)

### Next Steps
1. Complete basic CRUD API endpoints for core models
2. Implement Vue components for authentication
3. Create medical bills management UI
4. Add comprehensive testing
5. Implement remaining API endpoints
6. Add data validation and error handling
7. Performance optimization and caching

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [ARCHITECTURE.md](ARCHITECTURE.md) for system design details
2. Review [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for implementation guidance
3. Ensure all dependencies are installed: `./scripts/setup.sh`
4. Verify Node.js version is 18+
5. Check that ports 3000 and 3001 are available

For additional help, please open an issue in the repository.