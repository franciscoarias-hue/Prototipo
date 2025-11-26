import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from './payment.schema';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private readonly httpService: HttpService,
  ) { }

  // Usamos 'any' aquí para ser flexibles con la estructura del JSON entrante
  async create(createPaymentDto: any) {

    // --- PASO 0: EXTRACCIÓN DE DATOS (MAPEO) ---
    // Aquí es donde fallaba antes. Ahora mapeamos correctamente tu JSON.
    const cardData = {
      number: createPaymentDto.payer.creditcard.numero,
      cvv: createPaymentDto.payer.creditcard.cvv
    };
    const productId = createPaymentDto.producto.id;
    const quantity = createPaymentDto.producto.cantidad;

    // --- PASO 1: LLAMADA AL BANCO (MOCK API) ---
    let bankStatus = 'declined';
    try {
      console.log('🔵 Conectando con Mock Bank...', cardData);
      const response = await firstValueFrom(
        this.httpService.post('http://localhost:3002/pay', { card: cardData }),
      );
      bankStatus = response.data.status;
    } catch (error) {
      console.error('❌ Error Banco:', error.message);
      throw new HttpException('Failed to connect to Bank Mock API', HttpStatus.BAD_GATEWAY);
    }

    // --- PASO 2: ORQUESTACIÓN (SI EL BANCO APRUEBA) ---
    if (bankStatus === 'approved') {
      try {
        console.log('🟢 Pago Aprobado. Contactando Inventario...');

        // A. Obtener stock actual
        const productUrl = `http://localhost:3000/product/${productId}`;
        const productResponse = await firstValueFrom(this.httpService.get(productUrl));
        const currentStock = productResponse.data.inventario;

        // B. Validar Stock suficiente
        if (currentStock < quantity) {
          throw new HttpException('Stock insuficiente', HttpStatus.BAD_REQUEST);
        }

        // C. Calcular nuevo stock
        const newStock = currentStock - quantity;

        // D. Actualizar inventario (PATCH)
        await firstValueFrom(this.httpService.patch(productUrl, { inventario: newStock }));
        console.log(`✅ Inventario actualizado. Nuevo stock: ${newStock}`);

        // --- PASO 3: GUARDAR PAGO EN MONGO LOCAL ---
        const payment = new this.paymentModel({
          ...createPaymentDto,
          status: 'approved',
          timestamp: new Date()
        });
        return payment.save();

      } catch (error) {
        console.error('❌ Error Orquestación:', error.message);
        // Si falla aquí, es culpa de store-api o lógica interna
        throw new HttpException(
          error.response?.data || 'Failed to process payment orchestration',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    // Si el banco declinó
    console.warn('Fs Pago Declinado por el banco');
    throw new HttpException('Payment declined by bank', HttpStatus.PAYMENT_REQUIRED);
  }

  findAll() { return this.paymentModel.find().exec(); }
  findOne(id: string) { return this.paymentModel.findById(id).exec(); }
  update(id: string, updatePaymentDto: any) { return this.paymentModel.findByIdAndUpdate(id, updatePaymentDto, { new: true }).exec(); }
  remove(id: string) { return this.paymentModel.findByIdAndDelete(id).exec(); }
}