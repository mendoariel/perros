import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreatePartnerDto, 
  UpdatePartnerDto, 
  CreateArticleDto, 
  CreateServiceDto, 
  CreateOfferDto, 
  CreateCommentDto 
} from './dto';
import { PartnerType, PartnerStatus } from '@prisma/client';

@Injectable()
export class PartnersService {
  constructor(private prisma: PrismaService) {}

  // Partner CRUD operations
  async createPartner(createPartnerDto: CreatePartnerDto) {
    return this.prisma.partner.create({
      data: createPartnerDto,
      include: {
        articles: true,
        services: true,
        offers: true,
        comments: true,
        catalog: true,
      },
    });
  }

  async findAllPartners() {
    return this.prisma.partner.findMany({
      include: {
        articles: true,
        services: true,
        offers: true,
        comments: true,
        catalog: true,
        _count: {
          select: {
            articles: true,
            services: true,
            offers: true,
            comments: true,
          },
        },
      },
    });
  }

  async findPartnerById(id: number) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
      include: {
        articles: true,
        services: true,
        offers: true,
        comments: true,
        catalog: true,
      },
    });

    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }

    return partner;
  }

  async findPartnersByType(partnerType: PartnerType) {
    return this.prisma.partner.findMany({
      where: { partnerType },
      include: {
        articles: true,
        services: true,
        offers: true,
        comments: true,
        catalog: true,
      },
    });
  }

  async updatePartner(id: number, updatePartnerDto: UpdatePartnerDto) {
    await this.findPartnerById(id);

    return this.prisma.partner.update({
      where: { id },
      data: updatePartnerDto,
      include: {
        articles: true,
        services: true,
        offers: true,
        comments: true,
        catalog: true,
      },
    });
  }

  async updatePartnerStatus(id: number, status: PartnerStatus) {
    await this.findPartnerById(id);

    return this.prisma.partner.update({
      where: { id },
      data: { status },
      include: {
        articles: true,
        services: true,
        offers: true,
        comments: true,
        catalog: true,
      },
    });
  }

  async deletePartner(id: number) {
    await this.findPartnerById(id);

    return this.prisma.partner.delete({
      where: { id },
    });
  }

  // Article operations
  async createArticle(partnerId: number, createArticleDto: CreateArticleDto) {
    await this.findPartnerById(partnerId);

    return this.prisma.article.create({
      data: {
        ...createArticleDto,
        partnerId,
      },
    });
  }

  async findPartnerArticles(partnerId: number) {
    await this.findPartnerById(partnerId);

    return this.prisma.article.findMany({
      where: { partnerId },
    });
  }

  async updateArticle(partnerId: number, articleId: number, updateData: Partial<CreateArticleDto>) {
    await this.findPartnerById(partnerId);

    const article = await this.prisma.article.findFirst({
      where: { id: articleId, partnerId },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found for partner ${partnerId}`);
    }

    return this.prisma.article.update({
      where: { id: articleId },
      data: updateData,
    });
  }

  async deleteArticle(partnerId: number, articleId: number) {
    await this.findPartnerById(partnerId);

    const article = await this.prisma.article.findFirst({
      where: { id: articleId, partnerId },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found for partner ${partnerId}`);
    }

    return this.prisma.article.delete({
      where: { id: articleId },
    });
  }

  // Service operations
  async createService(partnerId: number, createServiceDto: CreateServiceDto) {
    await this.findPartnerById(partnerId);

    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        partnerId,
      },
    });
  }

  async findPartnerServices(partnerId: number) {
    await this.findPartnerById(partnerId);

    return this.prisma.service.findMany({
      where: { partnerId },
    });
  }

  async updateService(partnerId: number, serviceId: number, updateData: Partial<CreateServiceDto>) {
    await this.findPartnerById(partnerId);

    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, partnerId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found for partner ${partnerId}`);
    }

    return this.prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    });
  }

  async deleteService(partnerId: number, serviceId: number) {
    await this.findPartnerById(partnerId);

    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, partnerId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found for partner ${partnerId}`);
    }

    return this.prisma.service.delete({
      where: { id: serviceId },
    });
  }

  // Offer operations
  async createOffer(partnerId: number, createOfferDto: CreateOfferDto) {
    await this.findPartnerById(partnerId);

    const startDate = new Date(createOfferDto.startDate);
    const endDate = new Date(createOfferDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.prisma.offer.create({
      data: {
        ...createOfferDto,
        startDate,
        endDate,
        partnerId,
      },
    });
  }

  async findPartnerOffers(partnerId: number) {
    await this.findPartnerById(partnerId);

    return this.prisma.offer.findMany({
      where: { partnerId },
    });
  }

  async findActiveOffers(partnerId: number) {
    await this.findPartnerById(partnerId);

    const now = new Date();
    return this.prisma.offer.findMany({
      where: {
        partnerId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
  }

  async updateOffer(partnerId: number, offerId: number, updateData: Partial<CreateOfferDto>) {
    await this.findPartnerById(partnerId);

    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, partnerId },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found for partner ${partnerId}`);
    }

    if (updateData.startDate && updateData.endDate) {
      const startDate = new Date(updateData.startDate);
      const endDate = new Date(updateData.endDate);

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    return this.prisma.offer.update({
      where: { id: offerId },
      data: updateData,
    });
  }

  async deleteOffer(partnerId: number, offerId: number) {
    await this.findPartnerById(partnerId);

    const offer = await this.prisma.offer.findFirst({
      where: { id: offerId, partnerId },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${offerId} not found for partner ${partnerId}`);
    }

    return this.prisma.offer.delete({
      where: { id: offerId },
    });
  }

  // Comment operations
  async createComment(partnerId: number, createCommentDto: CreateCommentDto) {
    await this.findPartnerById(partnerId);

    return this.prisma.comment.create({
      data: {
        ...createCommentDto,
        partnerId,
      },
    });
  }

  async findPartnerComments(partnerId: number) {
    await this.findPartnerById(partnerId);

    return this.prisma.comment.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteComment(partnerId: number, commentId: number) {
    await this.findPartnerById(partnerId);

    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, partnerId },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found for partner ${partnerId}`);
    }

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }

  // Catalog operations
  async createCatalog(partnerId: number, name: string, description?: string) {
    await this.findPartnerById(partnerId);

    const existingCatalog = await this.prisma.catalog.findUnique({
      where: { partnerId },
    });

    if (existingCatalog) {
      throw new BadRequestException(`Partner ${partnerId} already has a catalog`);
    }

    return this.prisma.catalog.create({
      data: {
        name,
        description,
        partnerId,
      },
    });
  }

  async findPartnerCatalog(partnerId: number) {
    await this.findPartnerById(partnerId);

    return this.prisma.catalog.findUnique({
      where: { partnerId },
      include: {
        partner: {
          include: {
            articles: true,
            services: true,
          },
        },
      },
    });
  }

  async updateCatalog(partnerId: number, name: string, description?: string) {
    await this.findPartnerById(partnerId);

    const catalog = await this.prisma.catalog.findUnique({
      where: { partnerId },
    });

    if (!catalog) {
      throw new NotFoundException(`Catalog not found for partner ${partnerId}`);
    }

    return this.prisma.catalog.update({
      where: { partnerId },
      data: { name, description },
    });
  }

  // Search and filtering
  async searchPartners(query: string) {
    return this.prisma.partner.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
        ],
        status: 'ACTIVE',
      },
      include: {
        articles: true,
        services: true,
        offers: true,
        comments: true,
        catalog: true,
      },
    });
  }

  async getPartnerStats(partnerId: number) {
    await this.findPartnerById(partnerId);

    const [articles, services, offers, comments] = await Promise.all([
      this.prisma.article.count({ where: { partnerId } }),
      this.prisma.service.count({ where: { partnerId } }),
      this.prisma.offer.count({ where: { partnerId } }),
      this.prisma.comment.count({ where: { partnerId } }),
    ]);

    const averageRating = await this.prisma.comment.aggregate({
      where: { partnerId, rating: { not: null } },
      _avg: { rating: true },
    });

    return {
      articles,
      services,
      offers,
      comments,
      averageRating: averageRating._avg.rating || 0,
    };
  }
} 