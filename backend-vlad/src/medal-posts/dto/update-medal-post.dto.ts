import { PartialType } from '@nestjs/mapped-types';
import { CreateMedalPostDto } from './create-medal-post.dto';

export class UpdateMedalPostDto extends PartialType(CreateMedalPostDto) {}
