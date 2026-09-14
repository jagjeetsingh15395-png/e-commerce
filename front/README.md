# Portfolio Admin & User Dashboard

A React application with two different UI layouts - one for admins and one for regular users. Built with React, React Router, Tailwind CSS, and Lucide React icons.

## Features

### Admin Panel
- Dashboard with project management
- Project creation, editing, and deletion
- Project status tracking (live/deployed)
- Admin profile management
- Social media links management
- Projects overview table

### User Profile
- Professional portfolio landing page
- Hero section with call-to-action
- About me section
- Skills showcase
- Portfolio projects display
- Contact options
- Social media links
- Responsive design

## Tech Stack

- **React 18** - UI framework
- **React Router v6** - Navigation and routing
- **Tailwind CSS 3** - Styling
- **Lucide React** - Icon library

## Installation

1. Navigate to the project directory:
```bash
cd front
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

## Switching Between Views

Use the navigation bar at the top to switch between:
- **User** - View the user portfolio page
- **Admin** - View the admin panel

## Project Structure

```
src/
├── components/
│   └── Navigation.js       # Top navigation component
├── pages/
│   ├── AdminPanel.js       # Admin dashboard page
│   └── UserProfile.js      # User portfolio page
├── App.js                  # Main app component with routing
├── index.js                # React entry point
└── index.css               # Global styles
```

## Customization

You can customize:
- User information in `UserProfile.js`
- Admin information and projects in `AdminPanel.js`
- Colors and styles in `tailwind.config.js`
- Icons using Lucide React library

## Available Scripts

### `npm start`
Runs the app in development mode.

### `npm build`
Builds the app for production.

### `npm test`
Runs the test suite.

## License

This project is open source and available under the MIT License.
