// Configuração de exemplo para o projeto NOA Esperanza
// Copie este arquivo para config.js e preencha com suas chaves reais

export const config = {
  // OpenAI Configuration
  openai: {
    apiKey: process.env.VITE_OPENAI_API_KEY || 'your_openai_api_key_here'
  },

  // ElevenLabs Configuration
  elevenLabs: {
    apiKey: process.env.VITE_ELEVEN_API_KEY || 'your_elevenlabs_api_key_here',
    agentId: process.env.VITE_ELEVEN_AGENT_ID || 'your_elevenlabs_agent_id_here'
  },

  // Supabase Configuration
  supabase: {
    url: process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'your_supabase_anon_key_here'
  },

  // Mercado Pago Configuration
  mercadoPago: {
    accessToken: process.env.VITE_MERCADO_PAGO_ACCESS_TOKEN || 'your_mercado_pago_access_token_here',
    publicKey: process.env.VITE_MERCADO_PAGO_PUBLIC_KEY || 'your_mercado_pago_public_key_here',
    webhookSecret: process.env.VITE_MERCADO_PAGO_WEBHOOK_SECRET || 'your_webhook_secret_here'
  },

  // Backend Configuration
  api: {
    url: process.env.VITE_API_URL || 'http://localhost:3001',
    timeout: 10000
  },

  // Database Configuration
  database: {
    url: process.env.VITE_DATABASE_URL || 'postgresql://username:password@localhost:5432/noa_esperanza',
    host: process.env.VITE_DATABASE_HOST || 'localhost',
    port: process.env.VITE_DATABASE_PORT || 5432,
    name: process.env.VITE_DATABASE_NAME || 'noa_esperanza',
    user: process.env.VITE_DATABASE_USER || 'username',
    password: process.env.VITE_DATABASE_PASSWORD || 'password'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.VITE_JWT_SECRET || 'your_jwt_secret_here',
    expiresIn: process.env.VITE_JWT_EXPIRES_IN || '7d'
  },

  // Email Configuration
  email: {
    service: process.env.VITE_EMAIL_SERVICE || 'gmail',
    user: process.env.VITE_EMAIL_USER || 'your_email@gmail.com',
    password: process.env.VITE_EMAIL_PASSWORD || 'your_app_password'
  },

  // SMS Configuration
  sms: {
    service: process.env.VITE_SMS_SERVICE || 'twilio',
    accountSid: process.env.VITE_SMS_ACCOUNT_SID || 'your_twilio_account_sid',
    authToken: process.env.VITE_SMS_AUTH_TOKEN || 'your_twilio_auth_token',
    phoneNumber: process.env.VITE_SMS_PHONE_NUMBER || 'your_twilio_phone_number'
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: (process.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(',')
  },

  // App Configuration
  app: {
    name: process.env.VITE_APP_NAME || 'NOA Esperanza',
    version: process.env.VITE_APP_VERSION || '3.0.0',
    environment: process.env.VITE_APP_ENVIRONMENT || 'development'
  },

  // Security Configuration
  security: {
    enableHttps: process.env.VITE_ENABLE_HTTPS === 'true',
    corsOrigin: process.env.VITE_CORS_ORIGIN || 'http://localhost:3000'
  },

  // Monitoring Configuration
  monitoring: {
    enableAnalytics: process.env.VITE_ENABLE_ANALYTICS === 'true',
    googleAnalyticsId: process.env.VITE_GOOGLE_ANALYTICS_ID || 'your_ga_id_here'
  },

  // Push Notifications
  push: {
    vapidPublicKey: process.env.VITE_VAPID_PUBLIC_KEY || 'your_vapid_public_key_here',
    vapidPrivateKey: process.env.VITE_VAPID_PRIVATE_KEY || 'your_vapid_private_key_here'
  },

  // WebRTC Configuration (for telemedicine)
  webrtc: {
    stunServer: process.env.VITE_WEBRTC_STUN_SERVER || 'stun:stun.l.google.com:19302',
    turnServer: process.env.VITE_WEBRTC_TURN_SERVER || 'your_turn_server_here'
  },

  // Redis Configuration (for caching)
  redis: {
    url: process.env.VITE_REDIS_URL || 'redis://localhost:6379',
    password: process.env.VITE_REDIS_PASSWORD || 'your_redis_password'
  },

  // AWS Configuration (for file storage)
  aws: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || 'your_aws_access_key',
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || 'your_aws_secret_key',
    region: process.env.VITE_AWS_REGION || 'us-east-1',
    s3Bucket: process.env.VITE_AWS_S3_BUCKET || 'noa-esperanza-files'
  },

  // Stripe Configuration (alternative payment)
  stripe: {
    publicKey: process.env.VITE_STRIPE_PUBLIC_KEY || 'your_stripe_public_key',
    secretKey: process.env.VITE_STRIPE_SECRET_KEY || 'your_stripe_secret_key',
    webhookSecret: process.env.VITE_STRIPE_WEBHOOK_SECRET || 'your_stripe_webhook_secret'
  }
}

export default config
