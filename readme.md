# CoachHub - Online Coaching Platform

A full-stack MERN application for online coaching, allowing coaches to manage sessions, courses, and clients while providing clients with booking, learning, and progress tracking capabilities.

## Features

### For Clients
- **Browse & Book**: Find coaches by specialty, view profiles, and book sessions
- **Online Courses**: Access and complete courses at your own pace
- **Video Sessions**: Join video calls for coaching sessions
- **Messaging**: Real-time chat with coaches
- **Progress Tracking**: Monitor completed sessions and achievements

### For Coaches
- **Session Management**: Create and manage different session types
- **Course Creation**: Build and publish courses with lessons and resources
- **Client Management**: View and track client progress
- **Earnings Dashboard**: Monitor income and payment history
- **Calendar View**: Manage availability and upcoming bookings

### Core Features
- JWT-based authentication with role-based access
- Real-time messaging via Socket.IO
- Video calling with WebRTC
- Stripe payment integration
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Video**: WebRTC (simple-peer)
- **Payments**: Stripe

## Project Structure

```
coaching-platform/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── auth/
│   │   │   ├── booking/
│   │   │   ├── chat/
│   │   │   ├── common/
│   │   │   ├── course/
│   │   │   ├── dashboard/
│   │   │   └── video/
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   │   ├── auth/
│   │   │   ├── client/
│   │   │   └── coach/
│   │   ├── services/       # API and socket services
│   │   └── utils/          # Utility functions
│   └── package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth & upload middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── index.js        # Server entry point
│   ├── uploads/            # File uploads directory
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coaching-platform
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coaching-platform
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://localhost:3000
```

### Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

3. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm start
   ```

4. Open http://localhost:3000 in your browser

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Update password

### Users
- `GET /api/users/coaches` - Get all coaches
- `GET /api/users/coaches/:id` - Get coach by ID
- `POST /api/users/avatar` - Upload avatar

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (coach only)
- `PUT /api/courses/:id` - Update course
- `POST /api/courses/:id/enroll` - Enroll in course

### Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create session (coach only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Messages
- `GET /api/messages` - Get conversations
- `GET /api/messages/:userId` - Get conversation with user
- `POST /api/messages` - Send message

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/history` - Get payment history

## Models

### User
- firstName, lastName, email, password
- role (client, coach, admin)
- avatar, bio, specializations
- hourlyRate, availability
- Stripe customer/account IDs

### Course
- title, description, thumbnail
- coach (ref), price, category, level
- lessons (embedded), enrolledStudents

### Session
- title, description, type
- coach (ref), duration, price
- maxParticipants, category

### Booking
- client, coach, session (refs)
- scheduledDate, startTime, endTime
- status, paymentStatus, amount
- meetingLink, notes

### Message
- sender, receiver (refs)
- conversationId, content
- messageType, isRead

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License
