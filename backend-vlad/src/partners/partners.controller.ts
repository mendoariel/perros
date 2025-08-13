import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { 
  CreatePartnerDto, 
  UpdatePartnerDto, 
  CreateArticleDto, 
  CreateServiceDto, 
  CreateOfferDto, 
  CreateCommentDto 
} from './dto';
import { AtGuard } from '../common/guards/at.guard';
import { PartnerType, PartnerStatus } from '@prisma/client';
import { Public } from '../common/decorators';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  // Partner CRUD endpoints
  @Post()
  @UseGuards(AtGuard)
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnersService.createPartner(createPartnerDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.partnersService.findAllPartners();
  }

  @Public()
  @Get('search')
  search(@Query('q') query: string) {
    return this.partnersService.searchPartners(query);
  }

  @Public()
  @Get('type/:type')
  findByType(@Param('type') type: PartnerType) {
    return this.partnersService.findPartnersByType(type);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.findPartnerById(id);
  }

  @Get(':id/stats')
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.getPartnerStats(id);
  }

  @Patch(':id')
  @UseGuards(AtGuard)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePartnerDto: UpdatePartnerDto
  ) {
    return this.partnersService.updatePartner(id, updatePartnerDto);
  }

  @Patch(':id/status')
  @UseGuards(AtGuard)
  updateStatus(
    @Param('id', ParseIntPipe) id: number, 
    @Body('status') status: PartnerStatus
  ) {
    return this.partnersService.updatePartnerStatus(id, status);
  }

  @Delete(':id')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.deletePartner(id);
  }

  // Article endpoints
  @Post(':id/articles')
  @UseGuards(AtGuard)
  createArticle(
    @Param('id', ParseIntPipe) partnerId: number,
    @Body() createArticleDto: CreateArticleDto
  ) {
    return this.partnersService.createArticle(partnerId, createArticleDto);
  }

  @Get(':id/articles')
  findPartnerArticles(@Param('id', ParseIntPipe) partnerId: number) {
    return this.partnersService.findPartnerArticles(partnerId);
  }

  @Patch(':id/articles/:articleId')
  @UseGuards(AtGuard)
  updateArticle(
    @Param('id', ParseIntPipe) partnerId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
    @Body() updateData: Partial<CreateArticleDto>
  ) {
    return this.partnersService.updateArticle(partnerId, articleId, updateData);
  }

  @Delete(':id/articles/:articleId')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteArticle(
    @Param('id', ParseIntPipe) partnerId: number,
    @Param('articleId', ParseIntPipe) articleId: number
  ) {
    return this.partnersService.deleteArticle(partnerId, articleId);
  }

  // Service endpoints
  @Post(':id/services')
  @UseGuards(AtGuard)
  createService(
    @Param('id', ParseIntPipe) partnerId: number,
    @Body() createServiceDto: CreateServiceDto
  ) {
    return this.partnersService.createService(partnerId, createServiceDto);
  }

  @Get(':id/services')
  findPartnerServices(@Param('id', ParseIntPipe) partnerId: number) {
    return this.partnersService.findPartnerServices(partnerId);
  }

  @Patch(':id/services/:serviceId')
  @UseGuards(AtGuard)
  updateService(
    @Param('id', ParseIntPipe) partnerId: number,
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Body() updateData: Partial<CreateServiceDto>
  ) {
    return this.partnersService.updateService(partnerId, serviceId, updateData);
  }

  @Delete(':id/services/:serviceId')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteService(
    @Param('id', ParseIntPipe) partnerId: number,
    @Param('serviceId', ParseIntPipe) serviceId: number
  ) {
    return this.partnersService.deleteService(partnerId, serviceId);
  }

  // Offer endpoints
  @Post(':id/offers')
  @UseGuards(AtGuard)
  createOffer(
    @Param('id', ParseIntPipe) partnerId: number,
    @Body() createOfferDto: CreateOfferDto
  ) {
    return this.partnersService.createOffer(partnerId, createOfferDto);
  }

  @Get(':id/offers')
  findPartnerOffers(@Param('id', ParseIntPipe) partnerId: number) {
    return this.partnersService.findPartnerOffers(partnerId);
  }

  @Get(':id/offers/active')
  findActiveOffers(@Param('id', ParseIntPipe) partnerId: number) {
    return this.partnersService.findActiveOffers(partnerId);
  }

  @Patch(':id/offers/:offerId')
  @UseGuards(AtGuard)
  updateOffer(
    @Param('id', ParseIntPipe) partnerId: number,
    @Param('offerId', ParseIntPipe) offerId: number,
    @Body() updateData: Partial<CreateOfferDto>
  ) {
    return this.partnersService.updateOffer(partnerId, offerId, updateData);
  }

  @Delete(':id/offers/:offerId')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOffer(
    @Param('id', ParseIntPipe) partnerId: number,
    @Param('offerId', ParseIntPipe) offerId: number
  ) {
    return this.partnersService.deleteOffer(partnerId, offerId);
  }

  // Comment endpoints
  @Post(':id/comments')
  createComment(
    @Param('id', ParseIntPipe) partnerId: number,
    @Body() createCommentDto: CreateCommentDto
  ) {
    return this.partnersService.createComment(partnerId, createCommentDto);
  }

  @Get(':id/comments')
  findPartnerComments(@Param('id', ParseIntPipe) partnerId: number) {
    return this.partnersService.findPartnerComments(partnerId);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(AtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteComment(
    @Param('id', ParseIntPipe) partnerId: number,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    return this.partnersService.deleteComment(partnerId, commentId);
  }

  // Catalog endpoints
  @Post(':id/catalog')
  @UseGuards(AtGuard)
  createCatalog(
    @Param('id', ParseIntPipe) partnerId: number,
    @Body() body: { name: string; description?: string }
  ) {
    return this.partnersService.createCatalog(partnerId, body.name, body.description);
  }

  @Get(':id/catalog')
  findPartnerCatalog(@Param('id', ParseIntPipe) partnerId: number) {
    return this.partnersService.findPartnerCatalog(partnerId);
  }

  @Patch(':id/catalog')
  @UseGuards(AtGuard)
  updateCatalog(
    @Param('id', ParseIntPipe) partnerId: number,
    @Body() body: { name: string; description?: string }
  ) {
    return this.partnersService.updateCatalog(partnerId, body.name, body.description);
  }
} 