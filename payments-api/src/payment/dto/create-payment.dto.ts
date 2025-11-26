export class CreatePaymentDto {
    productId: string;
    quantity: number;
    card: {
        number: string;
        cvv: string;
    };
}
