var express = require('express');
var router = express.Router();
const db = require('../db/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Fetch all events from database
  db.all('SELECT * FROM events ORDER BY date DESC', [], (err, events) => {
    if (err) {
      events = [];
    }

    // Fetch loans
    db.all('SELECT * FROM loans WHERE status = "active"', [], (err, loans) => {
      if (err) {
        loans = [];
      }

      // Calculate financial summary
      const income = events.filter(e => e.type === 'income').reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const expenses = events.filter(e => e.type === 'expense').reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const balance = income - expenses;
      const totalLoans = loans.reduce((sum, l) => sum + parseFloat(l.principal), 0);

      // Prepare calendar events (include amount in title)
      const calendarEvents = events.map(e => ({
        title: `${e.type === 'income' ? '+¥' : '-¥'}${parseFloat(e.amount).toFixed(2)} - ${e.description}`,
        start: e.date,
        backgroundColor: e.type === 'income' ? '#198754' : '#dc3545',
        borderColor: e.type === 'income' ? '#0f5132' : '#842029',
        extendedProps: {
          type: e.type,
          category: e.category,
          amount: e.amount,
          description: e.description
        }
      }));

      // Group expenses by category for chart
      const expensesByCategory = {};
      events.filter(e => e.type === 'expense').forEach(e => {
        expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + parseFloat(e.amount);
      });

      // Group income by category for chart
      const incomeByCategory = {};
      events.filter(e => e.type === 'income').forEach(e => {
        incomeByCategory[e.category] = (incomeByCategory[e.category] || 0) + parseFloat(e.amount);
      });

      res.render('index', { 
        title: 'Life 2026 Helper',
        events: calendarEvents,
        income: income.toFixed(2),
        expenses: expenses.toFixed(2),
        balance: balance.toFixed(2),
        totalLoans: totalLoans.toFixed(2),
        activeLoans: loans.length,
        expensesByCategory: JSON.stringify(expensesByCategory),
        incomeByCategory: JSON.stringify(incomeByCategory)
      });
    });
  });
});

module.exports = router;
