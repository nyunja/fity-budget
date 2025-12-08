-- Seed data for FityBudget application
-- Run this after running the main migrations

-- Note: Replace the user_id UUIDs with actual user IDs from your database
-- The password 'password' is hashed using bcrypt with cost default

-- Insert demo user (password: 'password')
INSERT INTO users (id, name, email, password_hash, is_onboarded, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Adaline',
    'adaline@fitybudget.com',
    '$2a$10$Dno94hI09.ck56kxWcggee7hiUpC7G5dU.qC0I7evL5Nchr86MMdS', -- bcrypt hash of 'password'
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Get the user_id for subsequent inserts
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id FROM users WHERE email = 'adaline@fitybudget.com';

    -- Insert wallets
    INSERT INTO wallets (id, user_id, name, type, balance, currency, color, account_number, is_default, last_synced, created_at, updated_at)
    VALUES
        (gen_random_uuid(), v_user_id, 'M-PESA', 'Mobile Money', 12450.00, 'KES', '#22C55E', '07** *** 453', true, NOW(), NOW(), NOW()),
        (gen_random_uuid(), v_user_id, 'Equity Bank', 'Bank', 45000.00, 'KES', '#DC2626', '**** 4521', false, NOW() - INTERVAL '2 hours', NOW(), NOW()),
        (gen_random_uuid(), v_user_id, 'Cash', 'Cash', 3200.00, 'KES', '#4B5563', NULL, false, NULL, NOW(), NOW()),
        (gen_random_uuid(), v_user_id, 'Savings', 'Savings', 120000.00, 'KES', '#4F46E5', 'Lock Savings', false, NULL, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Insert budgets
    INSERT INTO budgets (id, user_id, category, limit_amount, color, icon, is_rollover, type, alert_threshold, created_at, updated_at)
    VALUES
        (gen_random_uuid(), v_user_id, 'Food & Groceries', 1200.00, '#4F46E5', 'shopping-cart', false, 'Variable', 80, NOW(), NOW()),
        (gen_random_uuid(), v_user_id, 'Cafe & Restaurants', 500.00, '#818CF8', 'coffee', true, 'Variable', 90, NOW(), NOW()),
        (gen_random_uuid(), v_user_id, 'Entertainment', 300.00, '#A5B4FC', 'film', false, 'Variable', 80, NOW(), NOW()),
        (gen_random_uuid(), v_user_id, 'Shopping', 800.00, '#C7D2FE', 'shopping-bag', true, 'Variable', 80, NOW(), NOW()),
        (gen_random_uuid(), v_user_id, 'Transportation', 400.00, '#6366F1', 'car', false, 'Fixed', 80, NOW(), NOW()),
        (gen_random_uuid(), v_user_id, 'Utilities', 350.00, '#4338CA', 'zap', false, 'Fixed', 80, NOW(), NOW()),
        (gen_random_uuid(), v_user_id, 'Subscription', 100.00, '#818CF8', 'tv', false, 'Fixed', 80, NOW(), NOW()),
        (gen_random_uuid(), v_user_id, 'Health & Beauty', 200.00, '#A5B4FC', 'heart', true, 'Variable', 80, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    -- Insert saving goals
    INSERT INTO saving_goals (id, user_id, name, target_amount, current_amount, color, icon, deadline, priority, category, status, created_at, updated_at)
    VALUES
        (gen_random_uuid(), v_user_id, 'MacBook Pro', 2500.00, 850.00, '#6366F1', 'laptop', '2024-12-15', 'High', 'Electronics', 'Active', '2024-01-10', NOW()),
        (gen_random_uuid(), v_user_id, 'New Car', 60000.00, 25200.00, '#3B82F6', 'car', '2025-06-30', 'Medium', 'Vehicle', 'Active', '2023-11-05', NOW()),
        (gen_random_uuid(), v_user_id, 'Dream House', 150000.00, 4500.00, '#A855F7', 'home', '2030-01-01', 'Low', 'Real Estate', 'Active', '2023-01-01', NOW()),
        (gen_random_uuid(), v_user_id, 'Bali Trip', 5000.00, 5000.00, '#22C55E', 'plane', '2024-08-01', 'Medium', 'Travel', 'Completed', '2023-09-15', NOW())
    ON CONFLICT DO NOTHING;

    -- Get wallet IDs for transactions
    DECLARE
        v_mpesa_id UUID;
        v_equity_id UUID;
        v_cash_id UUID;
    BEGIN
        SELECT id INTO v_mpesa_id FROM wallets WHERE user_id = v_user_id AND name = 'M-PESA';
        SELECT id INTO v_equity_id FROM wallets WHERE user_id = v_user_id AND name = 'Equity Bank';
        SELECT id INTO v_cash_id FROM wallets WHERE user_id = v_user_id AND name = 'Cash';

        -- Insert transactions
        INSERT INTO transactions (id, user_id, wallet_id, amount, name, method, category, status, notes, receipt_url, transaction_date, created_at, updated_at)
        VALUES
            -- Recent transactions (July 2024)
            (gen_random_uuid(), v_user_id, v_equity_id, -10.00, 'YouTube', 'VISA **3254', 'Subscription', 'Completed', NULL, NULL, '2024-07-25 12:30:00', '2024-07-25 12:30:00', '2024-07-25 12:30:00'),
            (gen_random_uuid(), v_user_id, v_mpesa_id, -150.00, 'Reserved', 'Mastercard **2154', 'Shopping', 'Pending', NULL, NULL, '2024-07-26 15:00:00', '2024-07-26 15:00:00', '2024-07-26 15:00:00'),
            (gen_random_uuid(), v_user_id, v_cash_id, -80.00, 'Yaposhka', 'Mastercard **2154', 'Cafe & Restaurants', 'Completed', NULL, NULL, '2024-07-27 09:00:00', '2024-07-27 09:00:00', '2024-07-27 09:00:00'),
            (gen_random_uuid(), v_user_id, v_equity_id, 2400.00, 'Salary', 'Bank Transfer', 'Income', 'Completed', NULL, NULL, '2024-07-28 10:15:00', '2024-07-28 10:15:00', '2024-07-28 10:15:00'),

            -- Additional transactions
            (gen_random_uuid(), v_user_id, v_mpesa_id, -45.50, 'Uber Eats', 'VISA **3254', 'Food & Groceries', 'Completed', NULL, NULL, '2024-07-24 18:20:00', '2024-07-24 18:20:00', '2024-07-24 18:20:00'),
            (gen_random_uuid(), v_user_id, v_equity_id, -120.00, 'Nike Store', 'Mastercard **2154', 'Shopping', 'Completed', NULL, NULL, '2024-07-24 14:00:00', '2024-07-24 14:00:00', '2024-07-24 14:00:00'),
            (gen_random_uuid(), v_user_id, v_cash_id, -15.00, 'Starbucks', 'VISA **3254', 'Cafe & Restaurants', 'Completed', NULL, NULL, '2024-07-23 09:30:00', '2024-07-23 09:30:00', '2024-07-23 09:30:00'),
            (gen_random_uuid(), v_user_id, v_mpesa_id, -200.00, 'Electric Bill', 'Bank Transfer', 'Utilities', 'Completed', NULL, NULL, '2024-07-22 20:15:00', '2024-07-22 20:15:00', '2024-07-22 20:15:00'),
            (gen_random_uuid(), v_user_id, v_mpesa_id, 500.00, 'Freelance', 'Bank Transfer', 'Income', 'Completed', NULL, NULL, '2024-07-21 11:00:00', '2024-07-21 11:00:00', '2024-07-21 11:00:00'),
            (gen_random_uuid(), v_user_id, v_cash_id, -60.00, 'Gas Station', 'Mastercard **2154', 'Transportation', 'Pending', NULL, NULL, '2024-07-20 16:45:00', '2024-07-20 16:45:00', '2024-07-20 16:45:00'),
            (gen_random_uuid(), v_user_id, v_equity_id, -12.99, 'Netflix', 'VISA **3254', 'Subscription', 'Completed', NULL, NULL, '2024-07-19 13:20:00', '2024-07-19 13:20:00', '2024-07-19 13:20:00'),
            (gen_random_uuid(), v_user_id, v_cash_id, -85.00, 'Grocery Store', 'Mastercard **2154', 'Food & Groceries', 'Completed', NULL, NULL, '2024-07-18 10:00:00', '2024-07-18 10:00:00', '2024-07-18 10:00:00'),
            (gen_random_uuid(), v_user_id, v_mpesa_id, -25.00, 'Gym Membership', 'VISA **3254', 'Health & Beauty', 'Completed', NULL, NULL, '2024-07-17 09:00:00', '2024-07-17 09:00:00', '2024-07-17 09:00:00'),
            (gen_random_uuid(), v_user_id, v_equity_id, 150.00, 'Refund', 'VISA **3254', 'Income', 'Completed', NULL, NULL, '2024-07-16 15:30:00', '2024-07-16 15:30:00', '2024-07-16 15:30:00'),

            -- Historical transactions for money flow chart (Jan - Jun 2024)
            -- January
            (gen_random_uuid(), v_user_id, v_equity_id, 9500.00, 'Salary', 'Bank Transfer', 'Income', 'Completed', NULL, NULL, '2024-01-05 10:00:00', '2024-01-05 10:00:00', '2024-01-05 10:00:00'),
            (gen_random_uuid(), v_user_id, v_mpesa_id, -3000.00, 'Rent', 'Bank Transfer', 'Utilities', 'Completed', NULL, NULL, '2024-01-10 09:00:00', '2024-01-10 09:00:00', '2024-01-10 09:00:00'),
            (gen_random_uuid(), v_user_id, v_cash_id, -2000.00, 'Groceries', 'Cash', 'Food & Groceries', 'Completed', NULL, NULL, '2024-01-15 14:00:00', '2024-01-15 14:00:00', '2024-01-15 14:00:00'),
            (gen_random_uuid(), v_user_id, v_equity_id, -3000.00, 'Various Expenses', 'VISA **3254', 'Shopping', 'Completed', NULL, NULL, '2024-01-20 16:00:00', '2024-01-20 16:00:00', '2024-01-20 16:00:00'),

            -- February
            (gen_random_uuid(), v_user_id, v_equity_id, 10500.00, 'Salary + Bonus', 'Bank Transfer', 'Income', 'Completed', NULL, NULL, '2024-02-05 10:00:00', '2024-02-05 10:00:00', '2024-02-05 10:00:00'),
            (gen_random_uuid(), v_user_id, v_mpesa_id, -5000.00, 'Emergency Repair', 'Bank Transfer', 'Utilities', 'Completed', NULL, NULL, '2024-02-12 11:00:00', '2024-02-12 11:00:00', '2024-02-12 11:00:00'),
            (gen_random_uuid(), v_user_id, v_cash_id, -3500.00, 'Shopping', 'Cash', 'Shopping', 'Completed', NULL, NULL, '2024-02-14 15:00:00', '2024-02-14 15:00:00', '2024-02-14 15:00:00'),
            (gen_random_uuid(), v_user_id, v_equity_id, -3500.00, 'Various Expenses', 'VISA **3254', 'Entertainment', 'Completed', NULL, NULL, '2024-02-20 18:00:00', '2024-02-20 18:00:00', '2024-02-20 18:00:00'),

            -- March
            (gen_random_uuid(), v_user_id, v_equity_id, 10500.00, 'Salary', 'Bank Transfer', 'Income', 'Completed', NULL, NULL, '2024-03-05 10:00:00', '2024-03-05 10:00:00', '2024-03-05 10:00:00'),
            (gen_random_uuid(), v_user_id, v_mpesa_id, -3500.00, 'Rent', 'Bank Transfer', 'Utilities', 'Completed', NULL, NULL, '2024-03-10 09:00:00', '2024-03-10 09:00:00', '2024-03-10 09:00:00'),
            (gen_random_uuid(), v_user_id, v_cash_id, -2500.00, 'Groceries', 'Cash', 'Food & Groceries', 'Completed', NULL, NULL, '2024-03-15 14:00:00', '2024-03-15 14:00:00', '2024-03-15 14:00:00'),
            (gen_random_uuid(), v_user_id, v_equity_id, -3500.00, 'Various Expenses', 'VISA **3254', 'Shopping', 'Completed', NULL, NULL, '2024-03-20 16:00:00', '2024-03-20 16:00:00', '2024-03-20 16:00:00'),

            -- April
            (gen_random_uuid(), v_user_id, v_equity_id, 14000.00, 'Salary + Commission', 'Bank Transfer', 'Income', 'Completed', NULL, NULL, '2024-04-05 10:00:00', '2024-04-05 10:00:00', '2024-04-05 10:00:00'),
            (gen_random_uuid(), v_user_id, v_mpesa_id, -4000.00, 'Rent', 'Bank Transfer', 'Utilities', 'Completed', NULL, NULL, '2024-04-10 09:00:00', '2024-04-10 09:00:00', '2024-04-10 09:00:00'),
            (gen_random_uuid(), v_user_id, v_cash_id, -3500.00, 'Groceries', 'Cash', 'Food & Groceries', 'Completed', NULL, NULL, '2024-04-15 14:00:00', '2024-04-15 14:00:00', '2024-04-15 14:00:00'),
            (gen_random_uuid(), v_user_id, v_equity_id, -5000.00, 'Electronics', 'VISA **3254', 'Shopping', 'Completed', NULL, NULL, '2024-04-20 16:00:00', '2024-04-20 16:00:00', '2024-04-20 16:00:00'),

            -- May
            (gen_random_uuid(), v_user_id, v_equity_id, 12500.00, 'Salary', 'Bank Transfer', 'Income', 'Completed', NULL, NULL, '2024-05-05 10:00:00', '2024-05-05 10:00:00', '2024-05-05 10:00:00'),
            (gen_random_uuid(), v_user_id, v_mpesa_id, -4000.00, 'Rent', 'Bank Transfer', 'Utilities', 'Completed', NULL, NULL, '2024-05-10 09:00:00', '2024-05-10 09:00:00', '2024-05-10 09:00:00'),
            (gen_random_uuid(), v_user_id, v_cash_id, -3000.00, 'Groceries', 'Cash', 'Food & Groceries', 'Completed', NULL, NULL, '2024-05-15 14:00:00', '2024-05-15 14:00:00', '2024-05-15 14:00:00'),
            (gen_random_uuid(), v_user_id, v_equity_id, -5000.00, 'Various Expenses', 'VISA **3254', 'Entertainment', 'Completed', NULL, NULL, '2024-05-20 16:00:00', '2024-05-20 16:00:00', '2024-05-20 16:00:00'),

            -- June
            (gen_random_uuid(), v_user_id, v_equity_id, 7500.00, 'Salary (Half Month)', 'Bank Transfer', 'Income', 'Completed', NULL, NULL, '2024-06-05 10:00:00', '2024-06-05 10:00:00', '2024-06-05 10:00:00'),
            (gen_random_uuid(), v_user_id, v_mpesa_id, -2500.00, 'Rent', 'Bank Transfer', 'Utilities', 'Completed', NULL, NULL, '2024-06-10 09:00:00', '2024-06-10 09:00:00', '2024-06-10 09:00:00'),
            (gen_random_uuid(), v_user_id, v_cash_id, -1500.00, 'Groceries', 'Cash', 'Food & Groceries', 'Completed', NULL, NULL, '2024-06-15 14:00:00', '2024-06-15 14:00:00', '2024-06-15 14:00:00'),
            (gen_random_uuid(), v_user_id, v_equity_id, -2000.00, 'Various Expenses', 'VISA **3254', 'Shopping', 'Completed', NULL, NULL, '2024-06-20 16:00:00', '2024-06-20 16:00:00', '2024-06-20 16:00:00')
        ON CONFLICT DO NOTHING;
    END;
END $$;

-- Verify data insertion
SELECT
    (SELECT COUNT(*) FROM users WHERE email = 'adaline@fitybudget.com') as users_count,
    (SELECT COUNT(*) FROM wallets WHERE user_id IN (SELECT id FROM users WHERE email = 'adaline@fitybudget.com')) as wallets_count,
    (SELECT COUNT(*) FROM budgets WHERE user_id IN (SELECT id FROM users WHERE email = 'adaline@fitybudget.com')) as budgets_count,
    (SELECT COUNT(*) FROM saving_goals WHERE user_id IN (SELECT id FROM users WHERE email = 'adaline@fitybudget.com')) as goals_count,
    (SELECT COUNT(*) FROM transactions WHERE user_id IN (SELECT id FROM users WHERE email = 'adaline@fitybudget.com')) as transactions_count;
