import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './product.schema';

describe('ProductService', () => {
    let service: ProductService;
    let model: any;

    const mockProduct = {
        _id: 'someId',
        product_name: 'Test Product',
        inventario: 10,
        price: 100,
        descripcion: 'Test Description',
    };

    const mockProductModel = {
        create: jest.fn().mockResolvedValue(mockProduct),
        find: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockProduct]),
        }),
        findById: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockProduct),
        }),
        findByIdAndUpdate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue({ ...mockProduct, inventario: 20 }),
        }),
        findByIdAndDelete: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockProduct),
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: getModelToken(Product.name),
                    useValue: mockProductModel,
                },
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
        model = module.get(getModelToken(Product.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a product', async () => {
        const dto = { product_name: 'Test', inventario: 10, price: 100, descripcion: 'Desc' };
        const result = await service.create(dto);
        expect(result).toEqual(mockProduct);
        expect(model.create).toHaveBeenCalledWith(dto);
    });

    it('should update a product', async () => {
        const updateDto = { inventario: 20 };
        const result = await service.update('someId', updateDto);
        expect(result.inventario).toEqual(20);
        expect(model.findByIdAndUpdate).toHaveBeenCalledWith('someId', updateDto, { new: true });
    });
});
