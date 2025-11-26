import { IsNumber, Min } from 'class-validator';

export class CreateProductDto {
    product_name: string;
    inventario: number;
    descripcion: string;

    @IsNumber()
    @Min(0)
    price: number;
}
