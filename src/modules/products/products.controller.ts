import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Product } from 'entities/product.entity'
import { isFileExtensionSafe, removeFile, saveImageToStorage } from 'helpers/imageStorage'
import { PaginatedResult } from 'interfaces/paginated-result.interface'
import { join } from 'path'

import { CreateUpdateProductDto } from './dto/create-update-product.dto'
import { ProductsService } from './products.service'
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiCreatedResponse({ description: 'List all products.' })
  @ApiBadRequestResponse({ description: 'Error for list of products.' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('page') page: number): Promise<PaginatedResult> {
    return this.productsService.paginate(page)
  }

  @ApiCreatedResponse({ description: 'Finds one product by ID.' })
  @ApiBadRequestResponse({ description: 'Error for finding product by ID.' })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findById(id)
  }

  @ApiCreatedResponse({ description: 'Creates new product.' })
  @ApiBadRequestResponse({ description: 'Error for creating new product.' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateUpdateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto)
  }

  @ApiCreatedResponse({ description: 'Uploads new product image.' })
  @ApiBadRequestResponse({ description: 'Error for uploading new product image.' })
  @Post()
  @UseInterceptors(FileInterceptor('image', saveImageToStorage))
  @HttpCode(HttpStatus.CREATED)
  async upload(@UploadedFile() file: Express.Multer.File, @Param('id') productId: string): Promise<Product> {
    const filename = file?.filename

    if (!filename) throw new BadRequestException('File must be a png, jpg/jpeg')

    const imagesFolderPath = join(process.cwd(), 'files')
    const fullImagePath = join(imagesFolderPath + '/' + file.filename)
    if (await isFileExtensionSafe(fullImagePath)) {
      return this.productsService.updateProductImage(productId, filename)
    }
    removeFile(fullImagePath)
    throw new BadRequestException('File content does not match extension!')
  }

  @ApiCreatedResponse({ description: 'Updates a product.' })
  @ApiBadRequestResponse({ description: 'Error for upldating a product.' })
  @Post(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() createProductDto: CreateUpdateProductDto): Promise<Product> {
    return this.productsService.update(id, createProductDto)
  }

  @ApiCreatedResponse({ description: 'Removes product.' })
  @ApiBadRequestResponse({ description: 'Error for removing a product.' })
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Product> {
    return this.productsService.remove(id)
  }
}
