# Medical Bills Management System - Development Plan

## Implementation Strategy

This document provides detailed implementation guidance for each component of the medical bills management system.

## Phase 1: Project Foundation

### 1.1 Monorepo Setup
```json
// Root package.json
{
  "name": "medibills-monorepo",
  "private": true,
  "workspaces": ["api", "ui"],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:ui\"",
    "dev:api": "npm run dev --workspace=api",
    "dev:ui": "npm run dev --workspace=ui",
    "build": "npm run build --workspace=api && npm run build --workspace=ui",
    "test": "npm run test --workspace=api && npm run test --workspace=ui",
    "setup": "npm install && npm run setup --workspace=api"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

### 1.2 Environment Configuration
```bash
# .env.example
NODE_ENV=development
API_PORT=3001
UI_PORT=3000
DATABASE_URL=sqlite:./database.sqlite
SESSION_SECRET=your-super-secret-session-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

## Phase 2: API Development

### 2.1 Core Dependencies
```json
// api/package.json dependencies
{
  "express": "^4.18.2",
  "express-session": "^1.17.3",
  "connect-session-sequelize": "^7.1.7",
  "sequelize": "^6.32.1",
  "sqlite3": "^5.1.6",
  "bcrypt": "^5.1.0",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "dotenv": "^16.3.1",
  "uuid": "^9.0.0",
  "express-validator": "^7.0.1"
}
```

### 2.2 TypeScript Configuration
```json
// api/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 2.3 Database Models Implementation

#### User Model
```typescript
// api/src/models/User.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public passwordHash!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
});

export { User, UserAttributes, UserCreationAttributes };
```

### 2.4 Authentication Middleware
```typescript
// api/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  (req as AuthenticatedRequest).userId = req.session.userId;
  next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    (req as AuthenticatedRequest).userId = req.session.userId;
  }
  next();
};
```

### 2.5 API Route Structure
```typescript
// api/src/routes/medical-bills.ts
import { Router } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { MedicalBill } from '../models/MedicalBill';

const router = Router();

// GET /api/medical-bills - List user's medical bills
router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const bills = await MedicalBill.findAll({
      where: { userId: req.userId },
      include: ['medicalProvider', 'charges', 'serviceEvents']
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medical bills' });
  }
});

// POST /api/medical-bills - Create new medical bill
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const bill = await MedicalBill.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create medical bill' });
  }
});

export default router;
```

## Phase 3: UI Development

### 3.1 Vue Project Setup
```json
// ui/package.json dependencies
{
  "vue": "^3.3.4",
  "vue-router": "^4.2.4",
  "pinia": "^2.1.6",
  "axios": "^1.4.0",
  "@vueuse/core": "^10.3.0"
}
```

### 3.2 API Service Layer
```typescript
// ui/src/services/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on authentication error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3.3 Authentication Service
```typescript
// ui/src/services/authService.ts
import { apiClient } from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  async register(userData: LoginCredentials & { email: string }): Promise<User> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },
};
```

## Phase 4: Testing Strategy

### 4.1 API Unit Tests (Vitest)
```typescript
// api/tests/routes/auth.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { User } from '../../src/models/User';

describe('Authentication Routes', () => {
  beforeEach(async () => {
    await User.sync({ force: true });
  });

  it('should register a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.username).toBe(userData.username);
  });

  it('should login with valid credentials', async () => {
    // Test implementation
  });
});
```

### 4.2 UI E2E Tests (Cypress)
```typescript
// ui/cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  it('should allow user to login and access dashboard', () => {
    cy.visit('/login');
    
    cy.get('[data-cy=username]').type('testuser');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=login-button]').click();
    
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, testuser');
  });

  it('should redirect to login when accessing protected route', () => {
    cy.visit('/medical-bills');
    cy.url().should('include', '/login');
  });
});
```

## Phase 5: Development Scripts

### 5.1 Setup Script
```bash
#!/bin/bash
# scripts/setup.sh

echo "Setting up Medical Bills Management System..."

# Install root dependencies
npm install

# Install API dependencies
cd api && npm install && cd ..

# Install UI dependencies
cd ui && npm install && cd ..

# Copy environment files
cp .env.example .env
cp api/.env.example api/.env

# Initialize database
cd api && npm run db:migrate && cd ..

echo "Setup complete! Run 'npm run dev' to start development servers."
```

### 5.2 Development Script
```bash
#!/bin/bash
# scripts/dev.sh

echo "Starting development servers..."

# Start API and UI concurrently
npx concurrently \
  --names "API,UI" \
  --prefix-colors "blue,green" \
  "cd api && npm run dev" \
  "cd ui && npm run dev"
```

## Implementation Priority

1. **Foundation** (Days 1-2)
   - Monorepo setup
   - Basic API structure
   - Database configuration

2. **Core API** (Days 3-5)
   - User authentication
   - Core models and relationships
   - Basic CRUD endpoints

3. **UI Foundation** (Days 6-7)
   - Vue project setup
   - Authentication components
   - API service layer

4. **Integration** (Days 8-9)
   - Connect UI to API
   - Basic medical bills management
   - Testing setup

5. **Polish** (Day 10)
   - Documentation
   - Error handling
   - Development scripts

This plan provides a structured approach to building your medical bills management system with clear milestones and deliverables.