import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import PrintSheet from '@/components/scrap/print-sheet';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { index as billsIndex, show } from '@/routes/bills';
import type { Bill, CompanyDetails } from '@/types/vmap';

type Props = {
    bill: Bill;
    company: CompanyDetails | null;
};

export default function BillShow({ bill, company }: Props) {
    const isSales = bill.type === 'sales';
    const showWeights = !isSales || Number(bill.vehicle_weight) > 0;

    const rows: [string, string][] = [
        ['Bill no', bill.bill_no],
        ['Date', formatDate(bill.date)],
        [isSales ? 'Customer' : 'Vendor', bill.party_name],
        ['Vehicle no', bill.vehicle_number],
        ['Material', bill.material],
        ...(showWeights
            ? ([
                  ['Gross weight', `${formatNumber(bill.gross_weight)} kg`],
                  ['Vehicle weight', `${formatNumber(bill.vehicle_weight)} kg`],
              ] as [string, string][])
            : []),
        ['Net weight', `${formatNumber(bill.net_weight)} kg`],
        ['Rate', `${formatCurrency(bill.rate)} / kg`],
    ];

    return (
        <>
            <Head title={`Bill ${bill.bill_no}`} />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex gap-2 print:hidden">
                    <Button variant="outline" asChild>
                        <Link href={billsIndex(bill.type)}>
                            <ArrowLeft /> Back
                        </Link>
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer /> Print / Save as PDF
                    </Button>
                </div>

                <PrintSheet company={company}>
                    <h3 className="mb-3 text-center text-lg font-bold">
                        {isSales ? 'Sales' : 'Purchase'} Bill
                    </h3>
                    <table className="w-full text-sm">
                        <tbody>
                            {rows.map(([label, value]) => (
                                <tr
                                    key={label}
                                    className="border-t border-neutral-300"
                                >
                                    <td className="py-2">{label}</td>
                                    <td className="py-2 text-right">{value}</td>
                                </tr>
                            ))}
                            <tr className="border-t-2 border-neutral-800 text-base font-bold">
                                <td className="py-2">Total amount</td>
                                <td className="py-2 text-right">
                                    {formatCurrency(bill.amount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="mt-16 text-right text-sm">
                        Authorised signature
                    </p>
                </PrintSheet>

                <p className="text-center text-sm text-muted-foreground print:hidden">
                    Tap “Print / Save as PDF”, then choose Save as PDF in the
                    print screen.
                </p>
            </div>
        </>
    );
}

BillShow.layout = (props: Props) => ({
    breadcrumbs: [
        {
            title:
                props.bill.type === 'sales'
                    ? 'Sales orders'
                    : 'Purchase orders',
            href: billsIndex(props.bill.type),
        },
        { title: props.bill.bill_no, href: show(props.bill.id) },
    ],
});
