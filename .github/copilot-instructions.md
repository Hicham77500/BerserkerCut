# BerserkerCut - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
BerserkerCut is a React Native Expo TypeScript application for intelligent cutting (sèche) with personalized nutrition and supplement plans.

## Architecture Guidelines
- Use TypeScript for all files with proper type definitions
- Follow React Native and Expo best practices
- Separate concerns: screens/, components/, services/, utils/
- Use Firebase Authentication and Firestore for backend
- Implement clean architecture patterns
- Add proper error handling and loading states

## Code Style
- Use functional components with hooks
- Follow ESLint and TypeScript rules
- Add JSDoc comments for complex functions
- Use proper naming conventions (camelCase for variables, PascalCase for components)
- Structure imports: React first, then external libraries, then internal modules

## Firebase Integration
- Use Firebase SDK v9+ modular syntax
- Implement proper authentication flows
- Use Firestore for data persistence
- Follow security rules best practices
- Handle offline capabilities

## Business Logic
- Generate daily nutrition plans based on user profile
- Adapt plans for training/rest days
- Manage supplement recommendations
- Track user progress and preferences
