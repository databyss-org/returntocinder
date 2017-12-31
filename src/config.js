const config = (process.env.NODE_ENV === 'production') ? {
  // production
  apiUrl: '/api'
} : {
  // dev
  apiUrl: 'http://localhost:5000/api'
};

export default config;
