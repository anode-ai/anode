import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { Public } from 'src/auth/public.decorator';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Public()
  @Get()
  async crawl(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('url is required');
    }

    return this.crawlerService.crawl(url);
  }
}