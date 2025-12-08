# Database Migrations and Seed Data

This directory contains database migration files and seed data for the FityBudget application.

## Files

- `seed_data.sql` - Sample data for testing and development

## Running Seed Data

### Option 1: Using TCP/IP Connection (Recommended)

If you encounter "Peer authentication failed" errors, use TCP/IP connection with `-h localhost`:

```bash
# This forces password authentication instead of peer authentication
psql -h localhost -U postgres -d fity_budget_db -f migrations/seed_data.sql
```

You'll be prompted for the postgres user password.

### Option 2: Using System User Authentication

If you have sudo access, switch to the postgres system user:

```bash
# Switch to postgres system user to match peer authentication
sudo -u postgres psql -d fity_budget_db -f migrations/seed_data.sql
```

### Option 3: Using Your Own Database User

If you created a PostgreSQL user matching your system username:

```bash
# Uses peer authentication with your system username
psql -d fity_budget_db -f migrations/seed_data.sql
```

### Option 4: Using psql Interactive Mode

```bash
# Connect to database (use -h localhost if peer auth fails)
psql -h localhost -U postgres -d fity_budget_db

# Run the seed file
\i migrations/seed_data.sql
```

### Option 5: From Application Code

You can also load and execute the SQL file from your Go application if needed.

## Troubleshooting

### "Peer authentication failed for user 'postgres'"

This error occurs when PostgreSQL expects your database username to match your Linux system username. Solutions:

1. **Use TCP/IP connection**: Add `-h localhost` to force password authentication
   ```bash
   psql -h localhost -U postgres -d fity_budget_db
   ```

2. **Switch system user**: Use `sudo -u postgres` to match the postgres user
   ```bash
   sudo -u postgres psql -d fity_budget_db
   ```

3. **Use your own user**: Connect with your system username if you have a matching PostgreSQL user
   ```bash
   psql -d fity_budget_db
   ```

### "database does not exist"

Make sure you've run the migrations first and verify the correct database name:

```bash
# List all databases
psql -h localhost -U postgres -l

# Or with sudo
sudo -u postgres psql -l
```

## Seed Data Contents

The seed file creates a demo user and populates the database with sample data:

### Demo User
- **Name**: Adaline
- **Email**: adaline@fitybudget.com
- **Password**: password (bcrypt hashed)
- **Status**: Onboarded

### Wallets (4)
1. M-PESA (Mobile Money) - KES 12,450 - Default wallet
2. Equity Bank (Bank) - KES 45,000
3. Cash - KES 3,200
4. Savings - KES 120,000

### Budgets (8)
1. Food & Groceries - KES 1,200
2. Cafe & Restaurants - KES 500
3. Entertainment - KES 300
4. Shopping - KES 800
5. Transportation - KES 400
6. Utilities - KES 350
7. Subscription - KES 100
8. Health & Beauty - KES 200

### Savings Goals (4)
1. MacBook Pro - Target: KES 2,500 | Current: KES 850 | Status: Active
2. New Car - Target: KES 60,000 | Current: KES 25,200 | Status: Active
3. Dream House - Target: KES 150,000 | Current: KES 4,500 | Status: Active
4. Bali Trip - Target: KES 5,000 | Current: KES 5,000 | Status: Completed

### Transactions (~50+)
- Recent transactions (July 2024) - 14 transactions
- Historical transactions (Jan-Jun 2024) - 36 transactions for money flow data
- Includes various categories: Income, Shopping, Food, Utilities, Entertainment, etc.
- Different payment methods: VISA, Mastercard, Bank Transfer, Cash
- Various statuses: Completed, Pending

## Data Features

### Money Flow Chart Data
The seed data includes transactions spanning January to July 2024 to populate the money flow chart with realistic data:
- Monthly income ranging from KES 7,500 to KES 14,000
- Monthly expenses ranging from KES 6,000 to KES 12,500
- Varied transaction patterns to show realistic financial behavior

### Budget Spending Data
Transactions are categorized to match budget categories, allowing you to see:
- Budget utilization percentages
- Spending patterns by category
- Budget alerts and thresholds

### Wallet Balances
Multiple wallets with different balances to test:
- Wallet management
- Default wallet functionality
- Multi-wallet transactions
- Different wallet types (Mobile Money, Bank, Cash, Savings)

## Resetting Seed Data

If you need to reset the seed data:

```bash
# Delete all data for the demo user
psql -U postgres -d fity_budget

DELETE FROM transactions WHERE user_id IN (SELECT id FROM users WHERE email = 'adaline@fitybudget.com');
DELETE FROM budgets WHERE user_id IN (SELECT id FROM users WHERE email = 'adaline@fitybudget.com');
DELETE FROM saving_goals WHERE user_id IN (SELECT id FROM users WHERE email = 'adaline@fitybudget.com');
DELETE FROM wallets WHERE user_id IN (SELECT id FROM users WHERE email = 'adaline@fitybudget.com');
DELETE FROM users WHERE email = 'adaline@fitybudget.com';

# Then re-run the seed file
\i migrations/seed_data.sql
```

## Notes

- The seed file uses `ON CONFLICT DO NOTHING` to prevent duplicate entries
- UUIDs are generated automatically using `gen_random_uuid()`
- All timestamps use NOW() function for current time
- The bcrypt password hash is pre-generated for 'password'
- Foreign key relationships are properly maintained
- The seed file is idempotent - safe to run multiple times

## Login Credentials

Use these credentials to log in to the application:

```
Email: adaline@fitybudget.com
Password: password
```

## Verification

After running the seed file, you should see output showing the counts:
- users_count: 1
- wallets_count: 4
- budgets_count: 8
- goals_count: 4
- transactions_count: 50+

You can also verify by querying:

```sql
-- Check user
SELECT * FROM users WHERE email = 'adaline@fitybudget.com';

-- Check wallets
SELECT name, type, balance FROM wallets
WHERE user_id IN (SELECT id FROM users WHERE email = 'adaline@fitybudget.com');

-- Check transaction count
SELECT COUNT(*) FROM transactions
WHERE user_id IN (SELECT id FROM users WHERE email = 'adaline@fitybudget.com');
```
