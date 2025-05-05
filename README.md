# Comfort App - Backend Authentication

This backend uses Firebase Authentication and Firestore for user authentication and management. The system supports:

- Email-based passwordless authentication (sign-in links)
- Email/password login
- Google authentication
- Role-based access control (Admin, Sales Team, Normal User)
- JWT token-based API authentication

## Authentication Methods

### Passwordless Email Authentication

1. User requests a sign-in link by providing their email
2. System sends a magic link to the user's email
3. User clicks the link to verify their email and sign in
4. System authenticates the user and issues a JWT token

### Email/Password Authentication

1. User registers with email and password
2. System creates user in Firebase Auth
3. User can login with credentials
4. System issues a JWT token on successful login

### Google Authentication

1. User signs in with Google (client-side)
2. Frontend sends the Google ID token to the backend
3. Backend verifies the token and authenticates the user
4. System creates or updates the user record in Firestore
5. System issues a JWT token for subsequent API calls

## User Roles

The system supports three user roles:

1. **Admin** - Has access to all routes and can manage other users
2. **Sales Team** - Has access to sales routes and limited user management
3. **Normal User** - Has access to basic routes

## API Endpoints

### Public Routes (No Authentication Required)

- `POST /api/auth/google-signin` - Sign in with Google
- `POST /api/auth/send-sign-in-link` - Send a sign-in link to email
- `POST /api/auth/verify-sign-in-link` - Verify sign-in link and authenticate
- `POST /api/auth/register` - Register after email verification
- `POST /api/auth/login` - Login with email and password

### Protected Routes (Authentication Required)

- `POST /api/auth/create-custom-token` - Create custom token (Admin only)
- `POST /api/auth/set-user-role` - Set user role (Admin only)
- `GET /api/auth/getAllUsers` - Get all users (Admin only)
- `GET /api/auth/getUserById/:id` - Get user by ID (Self or Admin)
- `PUT /api/auth/updateUser/:id` - Update user data (Self or Admin)
- `DELETE /api/auth/deleteUser/:id` - Delete user (Admin only)
- `GET /api/auth/sales-dashboard` - Get sales dashboard (Sales Team or Admin)

## Setup Instructions

1. Create a Firebase project and enable Authentication and Firestore
2. Enable Email/Password, Email Link, and Google Sign-in authentication methods in Firebase Console
3. Configure the authorized domains in Firebase Console
4. Download the service account key and save it
5. Copy the `.env.example` file to `.env` and update the values
6. Set the `FRONTEND_URL` environment variable to the URL where users will complete sign-in
7. Make sure to set the `FIREBASE_SERVICE_ACCOUNT` environment variable with the stringified JSON of your service account key
8. Install dependencies: `npm install`
9. Start the server: `npm start`

## Frontend Implementation

For Google Authentication, your frontend should:

1. Initialize Firebase SDK with your config
2. Implement the Google sign-in button
3. When user signs in, get the ID token
4. Send the ID token to your backend's `/api/auth/google-signin` endpoint
5. Store the returned JWT token for subsequent API calls

## Environment Variables

See `.env.example` for required environment variables. 