import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema()
export class Payment {
    @Prop({ required: true })
    productId: string;

    @Prop({ required: true })
    quantity: number;

    @Prop()
    status: string;

    @Prop({ default: Date.now })
    timestamp: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
