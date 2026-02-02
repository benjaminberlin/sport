# Sport TV Streaming Application

A complete streaming TV application with live channels, TV guide, movies, and series. Built with Next.js 16, React 19, TypeScript, and Prisma.

## Features

### User Features
- **Live-TV**: Stream live TV channels with HLS video player
- **TV-Guide**: Browse current TV programs across all channels
- **Account Management**: View remaining time, available coins, and redeem packages
- **Package System**: 
  - 24 hours for 1 coin
  - 7 days for 3 coins
  - 30 days for 5 coins
- **Movies & Series**: Access to on-demand content (when enabled by admin)
- **30-Minute Warning**: Notification before pass expiration
- **Mobile-Responsive**: Optimized for both desktop and mobile devices

### Admin Features
- **User Management**: View all users with online status
- **Coin Management**: Add or remove coins from user accounts
- **Access Control**: Enable/disable Movies and Series access per user
- **User Monitoring**: Track last online time and pass expiration

## Technology Stack

- **Framework**: Next.js 16.1.6 (App Router with Turbopack)
- **Frontend**: React 19.2.3, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: SQLite with Prisma 6.19.2
- **Authentication**: JWT with bcryptjs
- **Video Player**: HLS.js for streaming
- **Icons**: lucide-react
- **Date Formatting**: date-fns

## Setup

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sport
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secure-secret-key-here"
```

4. Initialize the database:
```bash
npx prisma migrate dev --name init
```

5. (Optional) Seed the database with sample data:
```bash
# Create an admin user
npx prisma studio
# Then manually create users, channels, programs, movies, and series
```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
sport/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── admin/          # Admin endpoints
│   │   ├── channels/       # Channel endpoints
│   │   ├── epg/            # EPG/Program endpoints
│   │   ├── movies/         # Movies endpoints
│   │   ├── series/         # Series endpoints
│   │   └── users/          # User endpoints
│   ├── account/            # Account page
│   ├── live-tv/            # Live TV page
│   ├── login/              # Login page
│   ├── movies/             # Movies page
│   ├── register/           # Register page
│   ├── series/             # Series page
│   ├── settings/           # Admin settings
│   │   └── users/          # User management
│   └── tv-guide/           # TV Guide page
├── components/              # React components
│   ├── Navigation.tsx      # Main navigation
│   ├── ProtectedRoute.tsx  # Auth wrapper
│   └── VideoPlayer.tsx     # HLS video player
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication context
├── lib/                    # Utility libraries
│   ├── auth.ts            # JWT & bcrypt utilities
│   ├── coins.ts           # Coin package logic
│   ├── middleware.ts      # API middleware
│   └── prisma.ts          # Prisma client
├── prisma/                # Database
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
└── public/                # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Channels & EPG
- `GET /api/channels/list` - Get all channels
- `GET /api/epg/current?channelId={id}` - Get current program for channel

### Movies & Series
- `GET /api/movies/list` - Get all movies (requires movies enabled)
- `GET /api/series/list` - Get all series (requires series enabled)

### User Management
- `GET /api/users/transactions` - Get user transaction history
- `POST /api/users/redeem` - Redeem package with coins
- `POST /api/users/password` - Change password

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/users` - Manage users (admin only)
  - Actions: `add_coins`, `remove_coins`, `toggle_movies`, `toggle_series`, `delete`

## Database Schema

### Models
- **User**: User accounts with authentication and subscription info
- **Session**: Active user sessions with JWT tokens
- **Transaction**: Coin transaction history
- **Channel**: TV channels with stream URLs
- **Program**: TV program schedule (EPG data)
- **Movie**: On-demand movies
- **Series**: TV series
- **Episode**: Individual series episodes

## Security

- JWT-based authentication with secure token storage
- Password hashing with bcryptjs (10 rounds)
- Protected API routes with middleware
- Admin-only routes with role checking
- Environment variables for secrets
- CodeQL security scanning with zero vulnerabilities

## Mobile Support

The application is fully responsive with:
- Icon-based navigation on mobile (no labels)
- Collapsible channel list on Live-TV page
- Touch-optimized UI elements
- Responsive grid layouts for movies/series
- Mobile-first design approach

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Add your license here]

## Support

For issues and questions, please open an issue on GitHub.
