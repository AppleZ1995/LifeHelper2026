var express = require('express');
var router = express.Router();
const db = require('../db/database');

// GET lottery tickets list
router.get('/', function(req, res, next) {
  db.all('SELECT * FROM lottery ORDER BY purchaseDate DESC', [], (err, tickets) => {
    if (err) {
      tickets = [];
    }

    // Calculate statistics
    let totalSpent = 0;
    let totalWinnings = 0;
    let wonCount = 0;
    let lostCount = 0;
    let pendingCount = 0;

    tickets.forEach(ticket => {
      totalSpent += parseFloat(ticket.amount) || 0;
      totalWinnings += parseFloat(ticket.winningAmount) || 0;
      if (ticket.status === 'won') {
        wonCount++;
      } else if (ticket.status === 'lost') {
        lostCount++;
      } else if (ticket.status === 'pending') {
        pendingCount++;
      }
    });

    const netResult = totalWinnings - totalSpent;

    res.render('lottery', { 
      title: 'Lottery Ticket Manager',
      tickets: tickets || [],
      totalSpent: totalSpent.toFixed(2),
      totalWinnings: totalWinnings.toFixed(2),
      netResult: netResult.toFixed(2),
      wonCount: wonCount,
      lostCount: lostCount,
      pendingCount: pendingCount
    });
  });
});

// GET add lottery ticket form
router.get('/add', function(req, res, next) {
  res.render('lottery-add', { title: 'Add Lottery Ticket' });
});

// POST add lottery ticket
router.post('/add', function(req, res, next) {
  const { ticketNumber, amount, purchaseDate, notes } = req.body;

  if (!ticketNumber || !amount || !purchaseDate) {
    return res.status(400).render('lottery-add', { 
      title: 'Add Lottery Ticket',
      error: 'Ticket number, amount, and purchase date are required'
    });
  }

  db.run(
    `INSERT INTO lottery (ticketNumber, amount, purchaseDate, notes, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [ticketNumber, amount, purchaseDate, notes],
    function(err) {
      if (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error adding lottery ticket' });
      } else {
        res.redirect('/lottery');
      }
    }
  );
});

// GET edit lottery ticket form
router.get('/edit/:id', function(req, res, next) {
  db.get('SELECT * FROM lottery WHERE id = ?', [req.params.id], (err, ticket) => {
    if (err || !ticket) {
      return res.status(404).render('error', { message: 'Lottery ticket not found' });
    }
    res.render('lottery-edit', { title: 'Edit Lottery Ticket', ticket: ticket });
  });
});

// POST edit lottery ticket
router.post('/edit/:id', function(req, res, next) {
  const { ticketNumber, amount, purchaseDate, drawDate, winningAmount, status, notes } = req.body;

  db.run(
    `UPDATE lottery SET ticketNumber = ?, amount = ?, purchaseDate = ?, drawDate = ?, winningAmount = ?, status = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [ticketNumber, amount, purchaseDate, drawDate || null, winningAmount || 0, status, notes, req.params.id],
    function(err) {
      if (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error updating lottery ticket' });
      } else {
        res.redirect('/lottery');
      }
    }
  );
});

// GET lottery ticket details
router.get('/detail/:id', function(req, res, next) {
  db.get('SELECT * FROM lottery WHERE id = ?', [req.params.id], (err, ticket) => {
    if (err || !ticket) {
      return res.status(404).render('error', { message: 'Lottery ticket not found' });
    }
    res.render('lottery-detail', { title: 'Lottery Ticket Details', ticket: ticket });
  });
});

// POST delete lottery ticket
router.post('/delete/:id', function(req, res, next) {
  db.run('DELETE FROM lottery WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Error deleting lottery ticket' });
    } else {
      res.redirect('/lottery');
    }
  });
});

module.exports = router;
