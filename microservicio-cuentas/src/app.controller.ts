import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get()
  root(@Res() res: Response) {
    // Sirve desde la raíz del proyecto en modo desarrollo
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
  }
}
