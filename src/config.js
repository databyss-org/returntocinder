const config = (process.env.NODE_ENV === 'production') ? {
  // production
  apiUrl: '/api'
} : {
  // dev
  apiUrl: 'http://localhost:5000/api'
};

console.log('CONFIG', config);

export default config;
