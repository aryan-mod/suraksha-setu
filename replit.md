# SafeTour - Tourist Safety System

## Overview

SafeTour is an AI-powered tourist safety monitoring system that provides comprehensive protection for tourists through real-time location tracking, emergency response capabilities, and digital identity management. The application combines modern web technologies with intelligent safety features to create a robust platform for tourist security.

The system offers blockchain-based digital tourist IDs, real-time geofencing and safety zone monitoring, AI-powered chatbot assistance with multilingual support, emergency notification systems, and comprehensive admin dashboards for monitoring and management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses Next.js 14 with App Router architecture, providing server-side rendering and static generation capabilities. The UI is built with React components using TypeScript for type safety, styled with Tailwind CSS for utility-first styling, and enhanced with Radix UI components for accessible design patterns.

The component architecture follows a modular approach with reusable UI components, specialized feature components for safety systems, custom hooks for state management, and context providers for global state like language and theme preferences.

### Backend Architecture
The backend utilizes Next.js API routes for serverless functions, providing endpoints for AI chat interactions, location tracking and heatmap data, notification systems, and authentication flows. Supabase serves as the Backend-as-a-Service platform, handling authentication, real-time database operations, and row-level security policies.

### Authentication & Authorization
User authentication is managed through Supabase Auth with email/password authentication, email verification flows, and middleware-based route protection. Session management uses Supabase's built-in session handling with automatic token refresh.

### Real-Time Features
The system implements real-time capabilities through Supabase's real-time subscriptions for live location tracking, instant emergency notifications, and live safety zone updates. WebSockets enable real-time communication for the AI chatbot and emergency response coordination.

### AI Integration
Google Gemini AI is integrated for intelligent chatbot responses with multilingual support, contextual safety recommendations, and emergency situation analysis. The system includes fallback responses when the AI service is unavailable, ensuring continuous operation.

### Location Services
Geolocation features include HTML5 Geolocation API for position tracking, custom geofencing algorithms for safety zone monitoring, and proximity-based notifications and alerts. Location data is processed and stored for heatmap generation and safety analytics.

### Multilingual Support
The application provides comprehensive internationalization through a custom language provider supporting 20+ languages, Google Translate integration for dynamic content translation, RTL text support for Arabic and Hebrew, and localized emergency contact information.

### Progressive Web App Features
PWA capabilities include service worker implementation for offline functionality, push notification support for emergency alerts, app manifest for installability, and cached resources for offline access to critical safety information.

### Notification System
Multi-channel notification delivery includes in-app notifications for real-time alerts, push notifications for emergency situations, email notifications for critical updates, and SMS integration for emergency contacts (planned).

### Safety Monitoring
The safety system features real-time location tracking with accuracy monitoring, geofencing with customizable safety zones, emergency SOS button with immediate response, safety scoring algorithms, and incident reporting and tracking.

## External Dependencies

### Database & Backend Services
- **Supabase**: Primary database and authentication provider offering PostgreSQL database, real-time subscriptions, authentication services, and row-level security
- **Vercel**: Hosting and deployment platform providing serverless function execution, global CDN, and automatic deployments

### AI & Machine Learning
- **Google Gemini AI**: Powers the intelligent chatbot with natural language processing, multilingual conversation support, and contextual safety recommendations

### Maps & Location Services
- **HTML5 Geolocation API**: Browser-native location services for position tracking and accuracy monitoring
- **Web Push Protocol**: Standard push notification delivery for emergency alerts and safety notifications

### UI & Design Libraries
- **Radix UI**: Accessible component primitives providing dialog, dropdown, tooltip, and form components with ARIA compliance
- **Tailwind CSS**: Utility-first CSS framework for responsive design and theming
- **Lucide React**: Icon library providing consistent iconography across the application

### Analytics & Monitoring
- **Vercel Analytics**: User behavior tracking and performance monitoring for application optimization

### Development Tools
- **TypeScript**: Type safety and enhanced developer experience
- **Next.js**: React framework with App Router, API routes, and SSR capabilities
- **ESLint**: Code quality and consistency enforcement

### Web Standards & APIs
- **Service Workers**: Browser caching and offline functionality for critical safety features
- **Web App Manifest**: PWA installation and app-like experience on mobile devices
- **WebRTC**: Planned integration for emergency video calls and real-time communication