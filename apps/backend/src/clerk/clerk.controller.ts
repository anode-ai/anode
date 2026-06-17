import { Controller, Post, Body } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { Public } from 'src/auth/public.decorator';

@Controller('clerk')
export class ClerkController {
  constructor(
    private readonly clerkService: ClerkService
  ) {}
  
  @Public()
  @Post('webhook')
  async webhook(@Body() event: any) {
    return this.clerkService.handleEvent(event);
  }
}