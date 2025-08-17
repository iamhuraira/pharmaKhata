export async function register() {
  // This function is called when the app is starting up
  // You can add any initialization logic here if needed
  if (process.env.NODE_ENV === 'development') {
    console.log('App instrumentation initialized');
  }
}
