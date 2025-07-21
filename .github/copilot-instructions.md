# BerserkerCut - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Context
BerserkerCut is a React Native Expo TypeScript application for intelligent cutting (sèche) with personalized nutrition and supplement plans.

**Development Strategy**: iOS-first approach, then PWA in Phase 2. Focus on iOS native optimizations and user experience.

## Architecture Guidelines
- Use TypeScript for all files with proper type definitions
- Follow React Native and Expo best practices for iOS
- Separate concerns: screens/, components/, services/, utils/
- Use Firebase Authentication and Firestore for backend
- Implement clean architecture patterns
- Add proper error handling and loading states
- **iOS Priority**: Optimize for iOS performance, animations, and native UX patterns

## Code Style
- Use functional components with hooks
- Follow ESLint and TypeScript rules
- Add JSDoc comments for complex functions
- Use proper naming conventions (camelCase for variables, PascalCase for components)
- Structure imports: React first, then external libraries, then internal modules
- **iOS Focus**: Consider iOS-specific patterns and performance optimizations

## Firebase Integration
- Use Firebase SDK v9+ modular syntax
- Implement proper authentication flows
- Use Firestore for data persistence
- Follow security rules best practices
- Handle offline capabilities for iOS

## Business Logic
- Generate daily nutrition plans based on user profile
- Adapt plans for training/rest days
- Manage supplement recommendations
- Track user progress and preferences

## Development Phases
### Phase 1 (Current): iOS Native
- Focus on iOS-specific optimizations
- Native iOS animations and transitions
- iOS design patterns and UX conventions
- TestFlight preparation and App Store deployment

### Phase 2 (Future): PWA
- Maintain 90% code reusability from iOS phase
- Implement web-specific adaptations
- Progressive Web App features
- Cross-platform architecture
