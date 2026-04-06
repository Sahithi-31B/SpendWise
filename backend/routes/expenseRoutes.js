const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.get('/', expenseController.getExpenses);           // GET /api/expenses
router.post('/', expenseController.createExpense);         // POST /api/expenses
router.get('/summary', expenseController.getSummary);     // GET /api/expenses/summary
router.delete('/:id', expenseController.deleteExpense);    // DELETE /api/expenses/:id
router.put('/:id', expenseController.updateExpense);      //Update
module.exports = router;