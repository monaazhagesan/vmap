const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 3,
});

export function formatCurrency(value: number | string | null | undefined) {
    return currency.format(Number(value ?? 0));
}

/**
 * Short rupee amounts for cards: ₹12.5 L, ₹1.2 Cr.
 */
export function formatShort(value: number | string | null | undefined) {
    const amount = Number(value ?? 0);
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (abs >= 1e7) {
        return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
    }

    if (abs >= 1e5) {
        return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    }

    return formatCurrency(amount);
}

export function formatNumber(value: number | string | null | undefined) {
    return number.format(Number(value ?? 0));
}

/** dd/mm/yyyy */
export function formatDate(value: string) {
    return value.slice(0, 10).split('-').reverse().join('/');
}

export function today() {
    const now = new Date();

    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
}
