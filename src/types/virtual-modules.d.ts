// Module ảo do plugin trong vite.config.ts sinh ra
declare module 'virtual:home-summary' {
  const summary: import('./homeSummary').HomeSummary
  export default summary
}
