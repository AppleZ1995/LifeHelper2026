var express = require('express');
var router = express.Router();
const db = require('../db/database');

// GET events manager page
router.get('/', function(req, res, next) {
  db.all('SELECT * FROM events ORDER BY date DESC', [], (err, events) => {
    if (err) {
      return res.status(500).render('error', { message: 'Error fetching events' });
    }

    // Calculate totals
    const income = events.filter(e => e.type === 'income').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const expenses = events.filter(e => e.type === 'expense').reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const balance = income - expenses;
    
    res.render('events', { 
      title: 'Event Manager - Money Tracker',
      events: events,
      income: income.toFixed(2),
      expenses: expenses.toFixed(2),
      balance: balance.toFixed(2)
    });
  });
});

// GET add event page
router.get('/add', function(req, res, next) {
  res.render('event-add', { title: 'Add Event' });
});

// POST add event
router.post('/add', function(req, res, next) {
  const { description, amount, type, date, category } = req.body;
  
  if (!description || !amount || !type || !date) {
    return res.status(400).render('event-add', { 
      title: 'Add Event',
      error: 'All fields are required'
    });
  }
  
  const finalCategory = category || (type === 'income' ? 'Salary' : 'Other');
  
  db.run(
    'INSERT INTO events (description, amount, type, date, category) VALUES (?, ?, ?, ?, ?)',
    [description, parseFloat(amount), type, date, finalCategory],
    function(err) {
      if (err) {
        return res.status(400).render('event-add', { 
          title: 'Add Event',
          error: 'Error adding event: ' + err.message
        });
      }
      res.redirect('/events');
    }
  );
});

// POST delete event
router.post('/delete/:id', function(req, res, next) {
  const { id } = req.params;
  
  db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).render('error', { message: 'Error deleting event' });
    }
    res.redirect('/events');
  });
});

// GET edit event page
router.get('/edit/:id', function(req, res, next) {
  const { id } = req.params;
  
  db.get('SELECT * FROM events WHERE id = ?', [id], (err, event) => {
    if (err || !event) {
      return res.status(404).render('error', { message: 'Event not found' });
    }
    
    res.render('event-edit', { 
      title: 'Edit Event',
      event
    });
  });
});

// POST edit event
router.post('/edit/:id', function(req, res, next) {
  const { id } = req.params;
  const { description, amount, type, date, category } = req.body;
  
  db.run(
    'UPDATE events SET description = ?, amount = ?, type = ?, date = ?, category = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [description, parseFloat(amount), type, date, category, id],
    function(err) {
      if (err) {
        return res.status(500).render('error', { message: 'Error updating event' });
      }
      res.redirect('/events');
    }
  );
});

module.exports = router;
