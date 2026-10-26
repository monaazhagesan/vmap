# Vmap Scrap Software

Scrap yard management for many companies: weighment bills, vendor ledgers, expenses, salary, reports and subscriptions.

**Stack:** Laravel 13 · Inertia.js 3 · React 19 (TypeScript) · Tailwind CSS 4 · MySQL

## Modules

| Module                  | Who   | What it does                                                                                                          |
| ----------------------- | ----- | --------------------------------------------------------------------------------------------------------------------- |
| Dashboard               | Owner | Sales, purchases, immediate expenses, salary and net profit for a date range; P&L; vendor balance; daily profit chart |
| New weighment           | All   | Purchase or sales bill: vehicle, party, material, gross − vehicle weight = net × rate                                 |
| Purchase / Sales orders | All   | Bills grouped by party; print or save as PDF; edit; delete                                                            |
| Vendor management       | All   | Vendors, date-wise ledger of purchases and payments with balance, bill photos                                         |
| Immediate expenses      | All   | Diesel, labour, tea… with optional bill photo                                                                         |
| Salary                  | Owner | Roles (rate per day), candidates, attendance → salary                                                                 |
| Reports                 | Owner | Purchase, sales, total expense and immediate expense reports, grouped by day/week/month/year, printable               |
| Subscription            | Owner | Free trial, plans, WhatsApp payment, activation codes                                                                 |
| Settings                | Owner | Company details (printed on bills), materials, admin users                                                            |

Each registration creates a separate **company**. All its data is visible only to its own users.
When the plan expires, the owner is sent to the Subscription page and admins see a "Plan expired" notice.

## Setup

Requirements: PHP 8.3+, Composer, Node 20+, MySQL/MariaDB.

```bash
composer install
npm install
cp .env.example .env        # set DB_CONNECTION=mysql, DB_DATABASE=vmap_scrap, etc.
php artisan key:generate
php artisan migrate --seed  # --seed adds a demo company with two months of data
npm run build
php artisan serve --port=8020
```

Demo logins (after seeding), password `password`:

- Owner: `admin@vmapscrap.test`
- Admin: `yard@vmapscrap.test`

## Subscriptions and activation codes

Plans and prices are in `config/vmap.php`. Set these in `.env`:

```
VMAP_TRIAL_DAYS=1
VMAP_WHATSAPP=91XXXXXXXXXX
VMAP_UPI_ID=yourname@upi
VMAP_ACTIVATION_SECRET=   # keep private; codes are signed with it
```

When a customer pays, generate a code and send it to them:

```bash
php artisan vmap:code 30            # 30 days (Monthly)
php artisan vmap:code 365           # Yearly
php artisan vmap:code 5 --count=3   # three 5-day codes
```

Codes use the same format and signing as the original Vmap web app (`VM-030-XXXXX-XXXXX`), so codes from either work in both.
Each code can be used only once, across all companies.

## Checks

```bash
php artisan test
vendor/bin/phpstan analyse
npm run check && npm run types:check
```
