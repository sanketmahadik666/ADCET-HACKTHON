module.exports = {
    apps: [{
        name: 'toilet-review-api',
        script: 'app.js',
        instances: 'max',
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 3000,
            MONGODB_URI: process.env.MONGODB_URI,
            JWT_SECRET: process.env.JWT_SECRET
        },
        error_file: 'logs/err.log',
        out_file: 'logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true
    }]
}; 