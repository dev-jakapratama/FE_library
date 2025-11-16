# Library Loan Management System

## Assumptions

1. **Database**: SQLite is used for simplicity in development
2. **Authentication**: No authentication system implemented as per requirements
3. **Date Handling**: All dates are stored in UTC and displayed in local timezone
4. **Stock Management**: Stock represents total copies, available copies calculated dynamically
5. **Loan Rules**:
   - One book per loan enforced
   - No concurrent loans per borrower
   - Maximum 30-day loan duration
   - Automatic status management (active/returned)

Depedency : 
- NPM 
- Node version >= 20
- nvm
- implement Vite js + ReactJs 


Running : 

- npm install

- npm run dev