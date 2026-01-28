const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/lifehelper.db');

// Create/open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeTables();
  }
});

// Initialize tables
function initializeTables() {
  // Create events table
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating events table:', err.message);
    } else {
      console.log('Events table initialized');
    }
  });

  // Create index for faster queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)
  `, (err) => {
    if (err) {
      console.error('Error creating index:', err.message);
    }
  });

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type)
  `, (err) => {
    if (err) {
      console.error('Error creating index:', err.message);
    }
  });

  // Create loans table
  db.run(`
    CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      lender TEXT NOT NULL,
      principal REAL NOT NULL,
      interestRate REAL NOT NULL,
      startDate TEXT NOT NULL,
      endDate TEXT,
      term INTEGER,
      frequency TEXT CHECK(frequency IN ('monthly', 'quarterly', 'yearly')),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused')),
      description TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating loans table:', err.message);
    } else {
      console.log('Loans table initialized');
    }
  });

  // Create loan payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS loan_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loanId INTEGER NOT NULL,
      amount REAL NOT NULL,
      paymentDate TEXT NOT NULL,
      principal REAL NOT NULL,
      interest REAL NOT NULL,
      balance REAL NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (loanId) REFERENCES loans(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating loan_payments table:', err.message);
    } else {
      console.log('Loan payments table initialized');
    }
  });

  // Create index for loans
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status)
  `, (err) => {
    if (err) {
      console.error('Error creating index:', err.message);
    }
  });
}

module.exports = db;
