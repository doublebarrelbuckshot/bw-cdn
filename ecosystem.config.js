module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: 'service',
      script: 'bin/www',
      exec_mode: 'cluster',
      watch: ['app.js', 'src', 'utils', 'bin'],
      instances: 1,
      env_development: {
        PORT: 3000,
        NODE_ENV: 'development',
        DEBUG_COLORS: true
      },
      env_production: {
        watch: false,
        PORT: 3000,
        NODE_ENV: 'production',
        LOGLEVEL: 'debug'
      }
    }
  ]
}


