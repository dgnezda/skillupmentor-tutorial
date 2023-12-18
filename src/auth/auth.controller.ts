import { Body, ClassSerializerInterceptor, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'decorators/public.decorator';
import { User } from 'entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { RequestWithUser } from 'interfaces/auth.interface';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() body: RegisterUserDto): Promise<User> {
        return this.authService.register(body)
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response): Promise<User> {
        const access_token = await this.authService.generateJwt(req.user)
        res.cookie('access_token', access_token, { httpOnly: true })
        return req.user
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async user(@Req() req: Request): Promise<User> {
        const cookie = req.cookies['access_token']
        return this.authService.user(cookie)
    }

    //@UseGuards(JwtAuthGuard)
    @Post('signout')
    @HttpCode(HttpStatus.OK)
    async signout(@Res({ passthrough: true }) res: Response): Promise<{msg: string}> {
        res.clearCookie('access_token')
        return { msg: 'ok' }
    }

    // @UseGuards(JwtAuthGuard)
    // @Get()
    // @HttpCode(HttpStatus.OK)
    // async getCurrentUser(@GetCurrentUser() user: User): Promise<UserData> {
    //     return {
    //         id: user.id,
    //         first_name: user.first_name,
    //         last_name: user.last_name,
    //         email: user.email,
    //         avatar: user.avatar,
    //         role: user.role?.id ? {id: user.role?.id, name: user.role?.name} : null
    //     }
    // }
}
