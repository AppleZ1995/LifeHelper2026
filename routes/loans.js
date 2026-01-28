var express = require('express');
var router = express.Router();
const db = require('../db/database');

// GET loans list
router.get('/', function(req, res, next) {
  db.all('SELECT * FROM loans ORDER BY createdAt DESC', [], (err, loans) => {
    if (err) {
      loans = [];
    }

    // Calculate total loan balance
    let totalPrincipal = 0;
    loans.forEach(loan => {
      totalPrincipal += parseFloat(loan.principal) || 0;
    });

    res.render('loans', { 
      title: 'Loan Management',
      loans: loans || [],
      totalPrincipal: totalPrincipal.toFixed(2)
    });
  });
});

// GET add loan form
router.get('/add', function(req, res, next) {
  res.render('loan-add', { title: 'Add New Loan' });
});

// POST add loan
router.post('/add', function(req, res, next) {
  const { name, lender, principal, interestRate, startDate, term, frequency, description } = req.body;

  // Calculate end date
  let endDate = null;
  if (startDate && term && frequency) {
    const start = new Date(startDate);
    if (frequency === 'monthly') {
      start.setMonth(start.getMonth() + parseInt(term));
    } else if (frequency === 'quarterly') {
      start.setMonth(start.getMonth() + (parseInt(term) * 3));
    } else if (frequency === 'yearly') {
      start.setFullYear(start.getFullYear() + parseInt(term));
    }
    endDate = start.toISOString().split('T')[0];
  }

  db.run(
    `INSERT INTO loans (name, lender, principal, interestRate, startDate, endDate, term, frequency, description, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
    [name, lender, principal, interestRate, startDate, endDate, term || null, frequency || null, description],
    function(err) {
      if (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error adding loan' });
      } else {
        res.redirect('/loans');
      }
    }
  );
});

// GET edit loan form
router.get('/edit/:id', function(req, res, next) {
  db.get('SELECT * FROM loans WHERE id = ?', [req.params.id], (err, loan) => {
    if (err || !loan) {
      return res.status(404).render('error', { message: 'Loan not found' });
    }
    res.render('loan-edit', { title: 'Edit Loan', loan: loan });
  });
});

// POST edit loan
router.post('/edit/:id', function(req, res, next) {
  const { name, lender, principal, interestRate, startDate, term, frequency, status, description } = req.body;

  // Calculate end date
  let endDate = null;
  if (startDate && term && frequency) {
    const start = new Date(startDate);
    if (frequency === 'monthly') {
      start.setMonth(start.getMonth() + parseInt(term));
    } else if (frequency === 'quarterly') {
      start.setMonth(start.getMonth() + (parseInt(term) * 3));
    } else if (frequency === 'yearly') {
      start.setFullYear(start.getFullYear() + parseInt(term));
    }
    endDate = start.toISOString().split('T')[0];
  }

  db.run(
    `UPDATE loans SET name = ?, lender = ?, principal = ?, interestRate = ?, startDate = ?, endDate = ?, term = ?, frequency = ?, status = ?, description = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, lender, principal, interestRate, startDate, endDate, term || null, frequency || null, status, description, req.params.id],
    function(err) {
      if (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Error updating loan' });
      } else {
        res.redirect('/loans');
      }
    }
  );
});

// GET loan details with payments
router.get('/:id', function(req, res, next) {
  db.get('SELECT * FROM loans WHERE id = ?', [req.params.id], (err, loan) => {
    if (err || !loan) {
      return res.status(404).render('error', { message: 'Loan not found' });
    }

    db.all('SELECT * FROM loan_payments WHERE loanId = ? ORDER BY paymentDate DESC', [req.params.id], (err, payments) => {
      payments = payments || [];
      const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      res.render('loan-detail', {
        title: 'Loan Details',
        loan: loan,
        payments: payments,
        totalPaid: totalPaid.toFixed(2),
        remaining: (parseFloat(loan.principal) - totalPaid).toFixed(2)
      });
    });
  });
});

// POST add loan payment
router.post('/:id/payment', function(req, res, next) {
  const { amount, paymentDate, principal, interest } = req.body;

  db.run(
    `INSERT INTO loan_payments (loanId, amount, paymentDate, principal, interest, balance)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.params.id, amount, paymentDate, principal, interest, parseFloat(amount) - parseFloat(principal)],
    function(err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error adding payment' });
      } else {
        res.json({ success: true, paymentId: this.lastID });
      }
    }
  );
});

// DELETE loan
router.post('/:id/delete', function(req, res, next) {
  db.run('DELETE FROM loan_payments WHERE loanId = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).render('error', { message: 'Error deleting loan' });
    }
    db.run('DELETE FROM loans WHERE id = ?', [req.params.id], (err) => {
      if (err) {
        return res.status(500).render('error', { message: 'Error deleting loan' });
      }
      res.redirect('/loans');
    });
  });
});

module.exports = router;
