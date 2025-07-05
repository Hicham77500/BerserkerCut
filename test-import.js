// Test d'import pour diagnostiquer le problème
try {
  const screens = require('./src/screens/index.ts');
  console.log('Screens disponibles:', Object.keys(screens));
  console.log('DashboardScreen:', screens.DashboardScreen);
} catch (error) {
  console.error('Erreur d\'import:', error.message);
}
