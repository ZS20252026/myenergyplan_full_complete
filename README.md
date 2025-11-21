MyEnergyPlan Full Package (Local simulation + placeholders for real HPP)

Structure in ZIP:
- frontend/: static frontend (index, calculators placeholders, payment simulation)
- backend/: Node.js express server for local simulation and webhook handling
- routes/: placeholder modules
- .env.example: where to put real merchant credentials (rename to .env)

Local testing:
1) cd backend
2) npm install
3) npm start
4) Open http://localhost:3000 in browser

Notes:
- The system simulates payment via /frontend/payment.html which calls /api/webhook to mark order as paid.
- When you receive real merchant credentials, modify /api/create-order in server.js to call the real HPP API and return the provider checkout URL.
- Implement proper webhook signature verification with the merchant secret in /api/webhook for production.
