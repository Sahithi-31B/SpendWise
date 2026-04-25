const Expense = require('../models/Expense');

// 1. Get all entries
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Add a new entry
exports.createExpense = async (req, res) => {
    try {
        const { title, amount, category, type } = req.body;
        if (!title || !amount) {
            return res.status(400).json({ message: "Description and Amount are required" });
        }
        const newEntry = new Expense({
            title,
            amount: Number(amount),
            category: type === 'subscription' ? 'Subscription' : (category || 'General'),
            date: new Date()
        });
        await newEntry.save();
        res.status(201).json(newEntry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 3. Delete an entry
exports.deleteExpense = async (req, res) => {
    try {
        const result = await Expense.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: "Record not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Update an entry
exports.updateExpense = async (req, res) => {
    try {
        const { title, amount, type } = req.body;
        const updated = await Expense.findByIdAndUpdate(
            req.params.id,
            { title, amount: Number(amount), category: type === 'subscription' ? 'Subscription' : 'General' },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// 5. Financial Analytics
exports.getSummary = async (req, res) => {
    try {
        const allData = await Expense.find();
        const totalExpenses = allData.filter(item => item.category !== 'Subscription').reduce((sum, item) => sum + item.amount, 0);
        const totalSubscriptions = allData.filter(item => item.category === 'Subscription').reduce((sum, item) => sum + item.amount, 0);
        res.json({
            totalSpent: totalExpenses + totalSubscriptions,
            expenseTotal: totalExpenses,
            subscriptionTotal: totalSubscriptions,
            currency: "INR",
            symbol: "₹"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};