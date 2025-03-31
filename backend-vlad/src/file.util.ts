import { BadRequestException } from "@nestjs/common";
import { Request } from "express";
var createHash = require('hash-generator');

export const fileNameEditor = (
    res: Request, 
    file: any, 
    callback:(erros: any, filename)=>void
) => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    let secondsDate = today.getSeconds();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let hash = createHash(14);

    let extensionFile; 
    switch (file.mimetype) {
        case 'image/jpeg':
            extensionFile = 'jpg';
            break;
        case 'image/png':
            extensionFile = 'png';
            break;
        case 'image/webp':
            extensionFile = 'webp';
            break;
    }

    const newFileName = `${yyyy}${mm}${dd}${hours}${minutes}${secondsDate}-${hash}.${extensionFile}`;
    callback(null, newFileName)
}

export const imageFileFilter = (
    res: Request, 
    file: any, 
    callback: (error: any, valid: boolean)=>void) => {
    if(!file.originalname || !file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
        return callback(new BadRequestException('File must be of image type'), false)
    }
    callback(null, true);
}