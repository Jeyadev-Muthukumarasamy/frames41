/**
 * PM2 ecosystem configuration
 * Cluster mode for production
 */
module.exports = {
  apps: [
    {
      name: 'frames41-api',
      script: './dist/src/server.js',
      // Avoid multiplying Prisma pools until a small database is connection-starved.
      // Override WEB_CONCURRENCY after measuring the production host.
      instances: Number(process.env.WEB_CONCURRENCY || 2),
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 30000,
      wait_ready: true,
      listen_timeout: 10000,
      // Graceful shutdown
      shutdown_with_message: true,
      // Auto restart
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      // Health check
      health_check_grace_period: 30000,
    },
    {
      name: 'frames41-worker',
      script: './dist/src/worker.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      log_file: './logs/worker-combined.log',
      out_file: './logs/worker-out.log',
      error_file: './logs/worker-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 30000,
      wait_ready: true,
      autorestart: true,
      max_restarts: 10,
    },
  ],
};
