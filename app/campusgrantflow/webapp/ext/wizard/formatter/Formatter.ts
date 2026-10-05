import NumberFormat from "sap/ui/core/format/NumberFormat";
const currencyFormat = NumberFormat.getCurrencyInstance({ currencyCode: false, minFractionDigits: 0, maxFractionDigits: 2 });

export default {
    currency(amount: number | null | undefined, currencyCode: string | undefined): string {
        if (amount === null || amount === undefined || !currencyCode) {
            return "";
        }
        return currencyFormat.format(amount, currencyCode);
    },

    toNumber(value: string | null): number | null {
        return value === null ? null : Number(value);
    },

    toDecimal(value: number | null): string | null {
        return value === null ? null : value.toFixed(2);
    }
};