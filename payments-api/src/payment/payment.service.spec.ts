import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getModelToken } from '@nestjs/mongoose';
import { Payment } from './payment.schema';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { HttpException } from '@nestjs/common';

describe('PaymentService', () => {
    let service: PaymentService;
    let httpService: HttpService;

    class MockPaymentModel {
        constructor(private data: any) { }
        save = jest.fn().mockResolvedValue({ ...this.data, _id: 'paymentId', status: 'approved' });
        static find = jest.fn().mockReturnValue({ exec: jest.fn() });
        static findById = jest.fn().mockReturnValue({ exec: jest.fn() });
        static findByIdAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn() });
        static findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn() });
    }

    const mockHttpService = {
        post: jest.fn(),
        get: jest.fn(),
        patch: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentService,
                {
                    provide: getModelToken(Payment.name),
                    useValue: MockPaymentModel,
                },
                {
                    provide: HttpService,
                    useValue: mockHttpService,
                },
            ],
        }).compile();

        service = module.get<PaymentService>(PaymentService);
        httpService = module.get<HttpService>(HttpService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should process approved payment', async () => {
        const paymentDto = {
            payer: { creditcard: { numero: '123', cvv: '123' } },
            producto: { id: 'prodId', cantidad: 1 },
        };

        // Mock Bank Approval
        mockHttpService.post.mockReturnValue(of({ data: { status: 'approved' } }));
        // Mock Store Inventory Check
        mockHttpService.get.mockReturnValue(of({ data: { inventario: 10 } }));
        // Mock Store Inventory Update
        mockHttpService.patch.mockReturnValue(of({ data: {} }));

        const result = await service.create(paymentDto);
        expect(result.status).toEqual('approved');
        expect(mockHttpService.post).toHaveBeenCalled(); // Bank called
        expect(mockHttpService.patch).toHaveBeenCalled(); // Inventory updated
    });

    it('should reject declined payment', async () => {
        const paymentDto = {
            payer: { creditcard: { numero: '123', cvv: '123' } },
            producto: { id: 'prodId', cantidad: 1 },
        };

        // Mock Bank Decline
        mockHttpService.post.mockReturnValue(of({ data: { status: 'declined' } }));

        await expect(service.create(paymentDto)).rejects.toThrow(HttpException);
        expect(mockHttpService.post).toHaveBeenCalled();
        // Inventory should NOT be updated
        expect(mockHttpService.patch).not.toHaveBeenCalled();
    });
});
