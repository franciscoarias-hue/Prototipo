import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
    @Prop({ required: true })
    product_name: string;

    @Prop({ required: true })
    inventario: number;

    @Prop({ required: true })
    price: number;

    @Prop()
    descripcion: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
