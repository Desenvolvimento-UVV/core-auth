import { Body, Controller, Post, Res, Req, UseInterceptors } from '@nestjs/common'
import { FileInterceptor, UploadedFile, MemoryStorageFile } from '@blazity/nest-file-fastify'
import { AppService } from 'src/services'
import { Status, Report } from 'src/dtos'

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post('/report')
  @UseInterceptors(FileInterceptor('image'))
  async report(@Body() body: Report, @UploadedFile() image: MemoryStorageFile, @Req() req, @Res() res) {
    return this.appService.report(body, image, req, res)
  }

  @Post('/status')
  async status(@Body() body: Status, @Res() res) {
    return this.appService.status(body, res)
  }
}
