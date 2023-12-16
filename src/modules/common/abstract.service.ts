import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import Logging from 'library/Logging';
import { Repository } from 'typeorm';


@Injectable()
export abstract class AbstractService {
    constructor(protected readonly repository: Repository<any>) {}

    async findAll(relations: []): Promise<any[]> {
        try {
            return this.repository.find({ relations })
        } catch (err) {
            Logging.error(err)
            throw new InternalServerErrorException('Something wet wrong while searching for a list of elements.')
        }
    }

    async findBy(condition, relations: []): Promise<any[]> {
        try {
            return this.repository.findOne({
                where: condition,
                relations
            })
        } catch (err) {
            Logging.error(err)
            throw new InternalServerErrorException(`Something wet wrong while searching for an element with condition: ${condition}`)
        }
    }

    async findById(id: string, relations: []): Promise<any[]> {
        try {
            const element = this.repository.findOne({
                where: { id },
                relations
            })
            if (!element) {
                throw new BadRequestException(`Cannot find element with id: ${id}`)
            }
            return element
        } catch (err) {
            Logging.error(err)
            throw new InternalServerErrorException(`Something wet wrong while searching for an element with id: ${id}`)
        }
    }
}
