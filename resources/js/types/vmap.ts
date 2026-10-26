export type CompanyStatus = {
    name: string;
    plan: string;
    expiresAt: string | null;
    active: boolean;
    endsSoon: boolean;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
};

export type BillType = 'purchase' | 'sales';

export type Bill = {
    id: number;
    type: BillType;
    bill_no: string;
    date: string;
    vehicle_number: string;
    party_name: string;
    material: string;
    gross_weight: string;
    vehicle_weight: string;
    net_weight: string;
    rate: string;
    amount: string;
};

export type Vendor = {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    place: string | null;
    is_active: boolean;
    purchased_total: string | null;
    paid_total: string | null;
};

export type LedgerLine = {
    id: number;
    type: 'purchase' | 'paid';
    amount: string;
    date: string;
    balance: number;
};

export type BillPhoto = {
    id: number;
    note: string | null;
    date: string;
};

export type Expense = {
    id: number;
    item: string;
    amount: string;
    date: string;
    photos: BillPhoto[];
};

export type SalaryRole = {
    id: number;
    name: string;
    daily_rate: string;
    candidates_count: number;
};

export type Candidate = {
    id: number;
    name: string;
    phone: string | null;
    salary_role_id: number;
    role: { id: number; name: string; daily_rate: string };
};

export type AttendanceEntry = {
    id: number;
    candidate_id: number | null;
    name: string;
    role_name: string;
    date: string;
    days: string;
    rate: string;
};

export type CompanyDetails = {
    name: string;
    registration_number: string | null;
    address: string | null;
    phone: string | null;
};
