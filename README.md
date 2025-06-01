# Repair Service Management Backend

## Installation

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Create `.env` file with your configuration:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/repair-service
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   \`\`\`

3. Make sure MongoDB is running on your system

4. Start the server:
   \`\`\`bash
# Development mode
npm run dev

# Production mode
npm start
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### User Routes
- `POST /api/user/request` - Create repair request
- `GET /api/user/requests` - Get user's repair requests
- `PUT /api/user/request/:id` - Update user's repair request
- `DELETE /api/user/request/:id` - Delete user's repair request

### Admin Routes
- `GET /api/admin/requests` - Get all repair requests
- `PUT /api/admin/request/:id` - Update repair request
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users` - Delete user

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages` - Get messages

## Test API

Visit: http://localhost:5000/api/test

## Default Admin User

After starting the server, you can create an admin user by registering normally, then manually updating the database:

\`\`\`javascript
// In MongoDB shell or compass
db.users.updateOne(
{ email: "admin@example.com" },
{ $set: { isAdmin: true } }
)
