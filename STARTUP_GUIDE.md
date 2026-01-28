# LifeHelper2026 - Startup Guide

## ✅ Startup Status: SUCCESS

Your application is now running successfully!

### Application Access
- **Home Page**: http://localhost:3000/
- **Event Manager**: http://localhost:3000/events
- **Users Page**: http://localhost:3000/users

### Database
- **Type**: SQLite3
- **Location**: `/data/lifehelper.db`
- **Tables**: events (with auto-increment ID and indexes)

### How to Start the Application

```bash
cd /Users/z2026/GithubProjects/LifeHelper2026
npm start
```

The server will start on `http://localhost:3000`

### Testing the Application

**Test Home Page:**
```bash
curl http://localhost:3000/
```

**Test Event Manager:**
```bash
curl http://localhost:3000/events
```

**Add an Income Event:**
```bash
curl -X POST http://localhost:3000/events/add \
  -d "description=Salary&amount=1000&type=income&date=2026-01-28&category=Salary" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

**Add an Expense Event:**
```bash
curl -X POST http://localhost:3000/events/add \
  -d "description=Groceries&amount=50&type=expense&date=2026-01-28&category=Food" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

### Features Available

✅ Calendar display on home page
✅ Event/Money Manager with income and expense tracking
✅ SQLite3 database persistence
✅ Category-based transaction organization
✅ Real-time balance calculation
✅ Responsive Bootstrap UI

### Verified Functionality

- Database table creation ✅
- Event insertion ✅
- Event retrieval ✅
- Financial calculations (income, expenses, balance) ✅
- UI rendering ✅

### If You Encounter Issues

1. **Port already in use**: Kill existing processes
   ```bash
   pkill -f "node ./bin/www"
   ```

2. **Missing dependencies**: Reinstall packages
   ```bash
   npm install
   ```

3. **Database issues**: Delete and recreate
   ```bash
   rm -f data/lifehelper.db
   npm start  # This will recreate it
   ```

---
**Last Updated**: January 28, 2026
