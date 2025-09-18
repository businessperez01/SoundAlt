# SoundAlt

A web application for sharing and playing sound effects, inspired by myInstants.com. Built with Node.js, Express, and MongoDB.

## Features

- User authentication (register/login)
- Upload and manage sound effects
- Play sounds instantly
- Tag-based organization
- User profiles
- Beautiful particle background effects
- Responsive design

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT
- File Upload: Multer

## Setup

1. Clone the repository:
```bash
git clone https://github.com/businessperez01/SoundAlt.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Project Structure

- `/client` - Frontend files
  - `/css` - Stylesheets
  - `/js` - Client-side JavaScript
- `/middleware` - Express middleware
- `/models` - MongoDB models
- `/routes` - API routes
- `/uploads` - Sound file storage

## License

MIT License
