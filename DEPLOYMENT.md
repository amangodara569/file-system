# Secure File System - Deployment Guide

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Update all environment variables
- [ ] Generate new JWT_SECRET
- [ ] Generate new encryption keys
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Set up MongoDB authentication
- [ ] Enable database backups
- [ ] Configure error monitoring
- [ ] Set up log aggregation
- [ ] Test all features in staging
- [ ] Review security settings

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│         Frontend (React)                  │
│  - User Dashboard                        │
│  - Admin Panel                           │
│  - Authentication UI                     │
└──────────────┬──────────────────────────┘
               │ HTTPS
               │
┌──────────────▼──────────────────────────┐
│         Backend (Node.js)                │
│  - API Routes                            │
│  - Authentication                        │
│  - File Operations                       │
│  - Permissions                           │
│  - Logging                               │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┬──────────────┐
       │                │              │
   ┌───▼──┐      ┌──────▼────┐   ┌────▼───┐
   │  DB  │      │ File Store │   │ Logs   │
   └──────┘      └───────────┘   └────────┘
```

## 📦 Backend Deployment

### Option 1: Heroku Deployment

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create Heroku app
heroku create secure-file-system

# Add MongoDB Atlas database
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set ENCRYPTION_KEY=$(openssl rand -hex 32)
heroku config:set ENCRYPTION_IV=$(openssl rand -hex 16)
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 2: AWS EC2 Deployment

```bash
# SSH into EC2 instance
ssh -i your_key.pem ubuntu@your_instance_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone https://github.com/amangodara569/file-system.git
cd file-system/backend

# Install dependencies
npm install

# Configure .env
nano .env
# Add all environment variables

# Start with PM2
pm2 start src/server.js --name "file-system"
pm2 startup
pm2 save

# Install Nginx as reverse proxy
sudo apt-get install -y nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 3: Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**Build and Run:**
```bash
# Build image
docker build -t secure-file-system-backend .

# Run container
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI=your_mongodb_uri \
  -e JWT_SECRET=your_jwt_secret \
  -e ENCRYPTION_KEY=your_encryption_key \
  -e ENCRYPTION_IV=your_encryption_iv \
  --name file-system-backend \
  secure-file-system-backend
```

## 🎨 Frontend Deployment

### Option 1: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy frontend
cd frontend
vercel

# Configure environment variables in Vercel dashboard
# REACT_APP_API_URL = https://your-backend-url.com/api
```

### Option 2: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build frontend
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### Option 3: AWS S3 + CloudFront

```bash
# Build frontend
cd frontend
npm run build

# Install AWS CLI
pip install awscli

# Create S3 bucket
aws s3 mb s3://secure-file-system-frontend

# Upload build
aws s3 sync build s3://secure-file-system-frontend --delete

# Create CloudFront distribution
# Configure in AWS console
```

## 🗄️ Database Deployment

### MongoDB Atlas Setup

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create account and login

2. **Create Cluster**
   - Click "Create a Deployment"
   - Choose cloud provider (AWS, Google Cloud, Azure)
   - Select region close to your users
   - Choose M0 tier for free or M2+ for production

3. **Create Database User**
   - Go to Database Access
   - Add Database User
   - Configure password and privileges
   - Choose "Built-in Role": "Atlas admin"

4. **Configure Network Access**
   - Go to Network Access
   - Add IP Address
   - For production, use specific IP ranges

5. **Get Connection String**
   - Click "Connect"
   - Choose "Connect Your Application"
   - Copy connection string
   - Update MONGODB_URI in environment

### MongoDB Local Setup (Development)

```bash
# Install MongoDB Community
# https://docs.mongodb.com/manual/installation/

# Start MongoDB service
# Linux: sudo systemctl start mongod
# macOS: brew services start mongodb-community
# Windows: net start MongoDB

# Create admin user
mongo
> use admin
> db.createUser({ user: "admin", pwd: "password", roles: ["root"] })

# Enable authentication in mongod.conf
# security:
#   authorization: enabled

# Restart MongoDB
```

## 🔒 SSL/HTTPS Setup

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d your_domain.com

# Auto-renewal
sudo certbot renew --dry-run

# Certbot will auto-configure Nginx
```

### Self-Signed Certificate (Testing)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Use in Node.js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(443);
```

## 📊 Monitoring & Logging

### Application Monitoring

```bash
# Install PM2 Monitoring
pm2 install pm2-logrotate

# View logs
pm2 logs

# Monitor resources
pm2 monit
```

### Log Aggregation (ELK Stack)

```bash
# Install Elasticsearch, Logstash, Kibana
# Configure Winston to send logs to ELK

# Update logger.js
const ElasticsearchTransport = require('winston-elasticsearch');

logger.add(new ElasticsearchTransport({
  level: 'info',
  clientOpts: { node: 'http://localhost:9200' }
}));
```

### Error Monitoring (Sentry)

```bash
# Install Sentry
npm install @sentry/node

# Configure in server.js
const Sentry = require('@sentry/node');

Sentry.init({ dsn: 'your_sentry_dsn' });
app.use(Sentry.Handlers.errorHandler());
```

## 🔧 Performance Optimization

### Enable Caching

```javascript
// Add Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache file metadata
app.get('/api/files', (req, res) => {
  const cacheKey = `files:${req.user.userId}`;
  client.get(cacheKey, (err, data) => {
    if (data) return res.json(JSON.parse(data));
    // Fetch from DB and cache
  });
});
```

### Database Indexing

```javascript
// Create indexes in MongoDB
db.files.createIndex({ owner: 1 });
db.files.createIndex({ uploadedAt: -1 });
db.logs.createIndex({ userId: 1, createdAt: -1 });
db.users.createIndex({ email: 1 });
```

### CDN for Static Assets

```javascript
// Configure static file delivery via CDN
app.use(express.static('public', {
  maxAge: '1d',
  etag: false
}));
```

## 📈 Scaling Considerations

### Horizontal Scaling

```yaml
# Docker Compose for multiple instances
version: '3'
services:
  backend-1:
    build: ./backend
    ports:
      - "5001:5000"
  backend-2:
    build: ./backend
    ports:
      - "5002:5000"
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Load Balancing

```nginx
upstream backend {
    server backend-1:5000;
    server backend-2:5000;
    server backend-3:5000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

## 🔐 Security Hardening

### Environment Security

```bash
# Never commit .env file
echo ".env" >> .gitignore

# Use environment variable service
export JWT_SECRET=$(aws secretsmanager get-secret-value --secret-id jwt_secret)

# Rotate secrets regularly
# - JWT_SECRET every 90 days
# - Encryption keys every 180 days
# - Database passwords every 30 days
```

### API Security

```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);

// CORS security
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));
```

### Database Security

- Enable encryption at rest
- Use SSL/TLS for connections
- Regular backups (daily minimum)
- Test restore procedures
- Monitor access logs

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Dependencies updated
- [ ] Documentation updated

### Deployment
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Backups initiated
- [ ] Monitoring configured
- [ ] Team notified

### Post-Deployment
- [ ] Health checks passing
- [ ] All features tested
- [ ] Performance monitored
- [ ] Error logs reviewed
- [ ] Users notified

## 🚨 Rollback Procedure

```bash
# If deployment fails

# Revert code
git revert HEAD
git push

# Restart services
pm2 restart all

# Verify functionality
# If database issues, restore from backup
```

## 📞 Support

- Deployment Issues: https://github.com/amangodara569/file-system/issues
- Documentation: See README.md
- Email: support@securefilesystem.com

---

**Deployment successful! 🚀**
