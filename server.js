// backend/index.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory JSON data
let customers = [
  {
    customerId: "CUST1001",
    name: "Alice Johnson",
    monthlyIncome: 6200,
    monthlyExpenses: 3500,
    creditScore: 710,
    outstandingLoans: 15000,
    loanRepaymentHistory: [1, 0, 1, 1, 1, 1, 0, 1],
    accountBalance: 12500,
    status: "Review",
  },
  {
    customerId: "CUST1002",
    name: "Bob Smith",
    monthlyIncome: 4800,
    monthlyExpenses: 2800,
    creditScore: 640,
    outstandingLoans: 20000,
    loanRepaymentHistory: [1, 1, 1, 0, 0, 1, 0, 0],
    accountBalance: 7300,
    status: "Approved",
  },
];

// ✅ Utility function: calculate risk score
function calculateRisk(customer) {
  const { creditScore, loanRepaymentHistory, outstandingLoans, monthlyIncome } =
    customer;

  let score = 0;

  // Lower credit score => higher risk
  score += creditScore < 650 ? 30 : creditScore < 700 ? 20 : 10;

  // Loan repayment history (missed payments)
  const missed = loanRepaymentHistory.filter((p) => p === 0).length;
  score += missed * 5;

  // Loan to income ratio
  const ratio = outstandingLoans / (monthlyIncome * 12);
  score += ratio > 0.5 ? 25 : ratio > 0.3 ? 15 : 5;

  return Math.min(100, score);
}

// ✅ API routes

// Get all customers
app.get("/customers", (req, res) => {
  const data = customers.map((c) => ({
    ...c,
    riskScore: calculateRisk(c),
  }));
  res.json(data);
});

// Update customer status
app.put("/customers/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const index = customers.findIndex((c) => c.customerId === id);
  if (index === -1) {
    return res.status(404).json({ error: "Customer not found" });
  }

  customers[index].status = status;
  res.json({ msg: "Status updated", customer: customers[index] });
});

// Optional: High risk alerts
app.post("/alerts", (req, res) => {
  const { customerId, riskScore } = req.body;
  if (riskScore > 70) {
    console.log(`🚨 ALERT: Customer ${customerId} is HIGH RISK!`);
  }
  res.json({ msg: "Alert received" });
});

// Server listen
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
