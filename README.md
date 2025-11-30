# GeoMatchX

**GeoMatchX** is a modern platform that connects Small and Medium Enterprises (SMEs) with skilled workers across emerging markets. Built with Next.js, it provides intelligent matching, geographic visualization, and streamlined workforce deployment capabilities.

## 🎯 What GeoMatchX Does

GeoMatchX helps businesses:

- **Find Skilled Workers**: Search and discover verified operators by skill, location, availability, and expertise
- **Geographic Intelligence**: Visualize worker density and coverage on interactive maps to identify talent pools
- **Smart Matching**: Get AI-powered recommendations that match workers to job briefs based on skills, proximity, reliability, and mission-fit
- **Streamline Deployment**: Post job briefs and connect with qualified workers quickly across multiple markets
- **Manage Workforce**: Browse a directory of verified operators with detailed profiles, ratings, and availability

## ✨ Key Features

### 🔍 Advanced Search
- Filter workers by skill tags (Construction, Electrical, Hospitality, Logistics, etc.)
- Search by city and location
- Filter by availability (Immediate, 2 weeks, 1 month)
- Real-time search results with detailed worker cards

### 🗺️ Interactive Map View
- Visualize worker locations on an interactive Leaflet map
- See coverage density across different regions
- Click markers to view worker details
- Identify talent pools in specific geographic areas

### 🤖 Smart Recommendations
- AI-powered matching algorithm
- Considers multiple factors:
  - Skill proximity and match score
  - Geographic radius and proximity
  - Reliability scores and service reviews
  - Mission history and completion rates
- Transparent drivers explaining why each worker is recommended

### 👥 Worker Directory
- Browse all verified operators in one place
- View detailed profiles with:
  - Experience and ratings
  - Skills and certifications
  - Location and availability
  - Hourly rates
  - Bio and work history
- Direct links to individual worker profiles

### 📋 Job Posting
- SMEs can post job briefs with:
  - Job title and description
  - Required skills
  - Budget and compensation
  - Location details
- Form validation and success notifications

### 🔐 Authentication (UI Ready)
- Login page for existing users
- Worker registration form
- SME registration form
- Ready for backend integration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- PostgreSQL 12+ with PostGIS extension
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd geomatchxapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
   - Install PostgreSQL and PostGIS (see [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions)
   - Create a `.env` file:
```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/geomatchx"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```
   - Run the database setup script:
   ```bash
   npm run db:setup
   ```
   - Generate Prisma client:
   ```bash
   npm run db:generate
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

> **Note**: For detailed database setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── search/            # Search workspace
│   ├── map/               # Map visualization
│   ├── workers/           # Worker directory & profiles
│   ├── recommendations/   # Smart recommendations
│   ├── post-job/          # Job posting form
│   ├── auth/              # Authentication pages
│   └── api/               # Mock API routes
├── components/            # Reusable UI components
│   ├── ui/               # ShadCN UI primitives
│   ├── layout/           # Navbar, Footer
│   └── ...               # Feature components
└── lib/                  # Utilities & mock data
    ├── mockData.ts       # Mock worker/job data
    ├── utils.ts          # Helper functions
    └── db.ts             # Database placeholder
```

## 🛠️ Technologies Used

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Leaflet & React-Leaflet** - Interactive maps
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **ShadCN UI** - High-quality component primitives

## 📡 API Routes

The application includes both mock and real database-backed API routes:

### Database-Backed Routes (Production)
- `GET /api/workers` - Get all workers from database
- `GET/POST /api/search` - Search workers by skill and location
- `GET /api/profile/[id]` - Get worker profile by ID
- `POST /api/post-job` - Create job posting
- `GET /api/recommend` - Get worker recommendations based on matches

### Mock Routes (Development/Testing)
- `GET/POST /api/mock/search` - Search workers (mock data)
- `GET /api/mock/workers` - Get all workers (mock data)
- `GET /api/mock/profile/[id]` - Get worker profile (mock data)
- `POST /api/mock/post-job` - Create job posting (mock data)
- `GET /api/mock/recommend` - Get recommendations (mock data)

The database-backed routes use PostgreSQL with PostGIS for geographic queries and Prisma ORM for data access.

## 🎨 Features in Detail

### Worker Profiles
Each worker profile includes:
- Name, headline, and bio
- Experience (years) and rating
- Skills and certifications
- Location (city, country, coordinates)
- Availability status
- Hourly rate
- Contact information

### Search & Filter
- Real-time search with loading states
- Skill-based filtering
- Location-based filtering
- Results displayed in responsive grid
- Empty states and error handling

### Map Integration
- Interactive Leaflet map
- Worker markers with popups
- Customizable tile providers
- Dark mode support
- Responsive design

## 🔄 Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📝 Notes

- The application uses **Next.js App Router** with API routes
- **Database integration** is complete with PostgreSQL and PostGIS
- All API routes are **fully functional** and connected to the database
- Authentication is **UI-only** and ready for backend integration
- Map tiles use OpenStreetMap by default (configurable via env)
- PostGIS is used for geographic queries and distance calculations

## 🚧 Future Enhancements

- Real authentication and authorization (JWT, OAuth)
- Real-time notifications
- Advanced filtering and sorting
- Worker verification system
- Payment integration
- Messaging system between SMEs and workers
- Advanced matching algorithm improvements
- Analytics and reporting dashboard

## 📄 License

This project is private and proprietary.

---

**GeoMatchX** - Connecting skilled workers with opportunities across emerging markets.
