# SpendWise Backend Prototype

A fast-tracked Expense & Subscription tracker API.

## Features
- **Expense Tracking**: Add and list one-time purchases.
- **Subscription Management**: Track recurring monthly/yearly bills.
- **Financial Analytics**: Auto-calculates monthly "burn rate" from subscriptions.

## How to Run
1. Open terminal in `C:\Projects\SpendWise`.
2. Run `npm start`.
3. The server will live at `http://localhost:3000`.

## Example JSON Body (for POST /api/expenses)
```json
{
  "title": "Starbucks Coffee",
  "amount": 5.50,
  "category": "Food"
}