import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, BadRequestException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateUpdateRoleDto } from './dto/create-update-role.dto';
import { PaginatedResult } from 'interfaces/paginated-result.interface';
import { User } from 'entities/user.entity';
import { Role } from 'entities/role.entity';

@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}
  
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<Role[]> {
      return this.rolesService.findAll(['permissions'])
  }
  
  @Get('/paginated')
  @HttpCode(HttpStatus.OK)
  async paginated(@Query('page') page: number): Promise<PaginatedResult> {
    return this.rolesService.paginate(page, ['permissions'])
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<Role> {
    return this.rolesService.findById(id, ['permissions'])
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async create(
      @Body() createRoleDto: CreateUpdateRoleDto, 
      @Body('permissions') permissionsIds: string[]
    ): Promise<Role> {
      // Format data: [1, 2] ==> [{id: 1}, {id: 2}] --- .map() function!
      return this.rolesService.create(
        createRoleDto,
        permissionsIds.map((id) => ({
          id,
        })),
      )
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
      @Param('id') id: string,
      @Body() updateRoleDto: CreateUpdateRoleDto, 
      @Body('permissions') permissionsIds: string[]
    ): Promise<Role> {
    // Format data: [1, 2] ==> [{id: 1}, {id: 2}] --- .map() function!
    return this.rolesService.update(
      id,
      updateRoleDto,
      permissionsIds.map((id) => ({
        id,
      })),
      )
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string): Promise<Role> {
    return this.rolesService.remove(id)
  }
}
