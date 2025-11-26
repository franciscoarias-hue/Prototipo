import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }

  create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  findAll() {
    return this.productModel.find().exec();
  }

  findOne(id: string) {
    return this.productModel.findById(id).exec();
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
