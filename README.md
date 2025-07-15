# IT Support Assistant 🛠️

A full-stack IT Support Assistant application with role-based authentication, step-by-step troubleshooting chat, and admin management dashboard.

## Features

- **Role-based Authentication** - Admin and user roles with different access levels
- **Interactive Chat Interface** - Step-by-step troubleshooting with intelligent message handling
- **Admin Dashboard** - Manage Q&A knowledge base with CRUD operations
- **Dark/Light Theme** - Professional theme toggle with system preference detection
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Data** - JSON server backend for data persistence

## Demo Credentials

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`
- Access: Admin dashboard + Chat

**Regular User:**
- Email: `user@example.com`  
- Password: `user123`
- Access: Chat only

## Quick Start

### Option 1: Auto Start (Recommended)
```bash
# Install dependencies
npm install

# Start both frontend and backend servers
node start.js
```

### Option 2: Manual Start
```bash
# Terminal 1: Start JSON Server (Backend)
npx json-server --watch db.json --port 5000

# Terminal 2: Start React App (Frontend)
npm run dev
```

## Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Endpoints**:
  - Users: http://localhost:5000/users
  - Q&A: http://localhost:5000/qa

## How It Works

### Chat Interface
1. **Welcome Message** - Users receive instructions on how to interact
2. **Question Matching** - Input can be:
   - Full question text (fuzzy matching)
   - Question number (1-N for direct access)
3. **Step-by-step Guidance** - Solutions are broken into numbered steps
4. **Progress Tracking** - System tracks current troubleshooting session
5. **Next Step Logic** - Users can say "next", "continue", or "didn't work" to proceed

### Admin Features
- **Dashboard Overview** - Statistics and system status
- **Q&A Management** - Add, edit, delete troubleshooting procedures
- **Multi-step Solutions** - Create detailed step-by-step instructions
- **Real-time Updates** - Changes reflect immediately in chat interface

### Authentication Flow
- **Login Page** - Validates credentials against JSON database
- **Role-based Routing**:
  - Admin users → `/admin` (dashboard + chat access)
  - Regular users → `/chat` (chat only)
- **Session Management** - Persistent login with localStorage

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **Backend**: JSON Server
- **Authentication**: Simple credential matching (demo purposes)
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── admin/          # Admin-specific components
│   ├── Header.tsx      # App header with navigation
│   ├── Footer.tsx      # App footer
│   └── Layout.tsx      # Main layout wrapper
├── contexts/           # React contexts
│   ├── AuthContext.tsx # Authentication state
│   └── ThemeContext.tsx # Theme management
├── pages/              # Route components
│   ├── Login.tsx       # Authentication page
│   ├── Chat.tsx        # Chat interface
│   └── Admin.tsx       # Admin dashboard
├── types/              # TypeScript definitions
└── hooks/              # Custom React hooks
```

## Development

### Adding New Q&A Items
1. Login as admin (`admin@example.com` / `admin123`)
2. Navigate to Admin Dashboard
3. Click "Add Q&A"
4. Enter question and step-by-step solution
5. Save - changes are immediately available in chat

### Customizing Themes
Edit `src/index.css` to modify the design system:
- Color variables for light/dark themes
- Component-specific styling
- Professional shadows and gradients

### Extending Chat Logic
Modify `src/pages/Chat.tsx` to add:
- New message matching patterns
- Additional step navigation commands
- Enhanced response formatting

## Production Deployment

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Deploy static files** to your hosting provider

3. **Backend considerations**:
   - Replace JSON Server with a real database
   - Implement proper authentication with password hashing
   - Add API rate limiting and security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
