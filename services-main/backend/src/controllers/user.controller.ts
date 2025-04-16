import { Controller, Get, Post, UseGuards, Body, Req, Res } from '@nestjs/common'
import { CreateUser, LoginUser } from 'src/dtos'
import { UserService, AuthGuard } from 'src/services'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(AuthGuard)
  @Get('/me')
  async me(@Req() req, @Res() res) {
    return this.userService.me(req, res)
  }
  
  @Post('/login')
  async login(@Body() body: LoginUser, @Req() req, @Res() res) {
    return this.userService.login(body, req, res)
  }

  @Post('/create')
  async create(@Body() body: CreateUser, @Req() req, @Res() res) {
    return this.userService.create(body, req, res)
  }
}
