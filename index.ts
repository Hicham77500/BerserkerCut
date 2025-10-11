// Importe la fonction Expo qui enregistre le composant racine auprès de React Native.
import { registerRootComponent } from 'expo';

// Importe le composant principal de l'application.
import App from './App';

// Enregistre le composant App pour qu'il soit utilisé comme point d'entrée.
// Cette fonction encapsule AppRegistry.registerComponent et gère les spécificités Expo.
registerRootComponent(App);
