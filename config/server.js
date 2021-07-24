module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1440),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', '30eaed3afda8d33b1749d96d7c21dd6e'),
    },
  },
});
