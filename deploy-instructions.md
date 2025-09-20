# Alvasco Procurement System - Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Railway (Recommended for Backend)

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Create new project**
4. **Connect your GitHub repository**
5. **Add environment variables:**
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = your secret key
   - `PORT` = 5000

### Option 2: Heroku (Alternative)

1. **Go to [heroku.com](https://heroku.com)**
2. **Create new app**
3. **Connect GitHub repository**
4. **Add MongoDB addon**
5. **Deploy**

### Option 3: Render (Free Alternative)

1. **Go to [render.com](https://render.com)**
2. **Create new web service**
3. **Connect GitHub repository**
4. **Add environment variables**
5. **Deploy**

## 🌐 Frontend Deployment (Netlify)

1. **Go to [netlify.com](https://netlify.com)**
2. **Sign up for free**
3. **Drag and drop your `demo.html` file**
4. **Get public URL**
5. **Update API URL in demo.html to point to your deployed backend**

## 📝 Environment Variables Needed

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alvasco-procurement
JWT_SECRET=your-secret-key-here
PORT=5000
```

## 🔧 After Deployment

1. **Update demo.html** with your backend URL
2. **Test all features**
3. **Share URL with client**

## 📞 Support

If you need help with deployment, contact me!
