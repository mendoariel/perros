import { BadRequestException } from "@nestjs/common";
import { Request } from "express"

export const fileNameEditor = (
    res: Request, 
    file: any, 
    callback:(erros: any, filename)=>void
) => {
    //const newFileName = 'urban-animal-' + file.originalname;
    console.log(file)
    const newFileName = 'secrect'+ file.originalname;
    callback(null, newFileName)
}

export const imageFileFilter = (
    res: Request, 
    file: any, 
    callback: (error: any, valid: boolean)=>void) => {
    if(!file.originalname || !file.originalname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
        return callback(new BadRequestException('File must be of image type'), false)
    }
    callback(null, true);
}