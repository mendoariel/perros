import { BadRequestException } from "@nestjs/common";
import { Request } from "express";
var createHash = require('hash-generator');

export const fileNameEditor = (
    res: Request, 
    file: any, 
    callback:(erros: any, filename)=>void
) => {
    try {
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let secondsDate = today.getSeconds();
        let hours = today.getHours();
        let minutes = today.getMinutes();
        let hash = createHash(14);

        let extensionFile = 'jpg'; // default
        if (file.mimetype) {
            switch (file.mimetype) {
                case 'image/jpeg':
                case 'image/jpg':
                    extensionFile = 'jpg';
                    break;
                case 'image/png':
                    extensionFile = 'png';
                    break;
                case 'image/webp':
                    extensionFile = 'webp';
                    break;
                case 'image/gif':
                    extensionFile = 'gif';
                    break;
                default:
                    // Intentar extraer extensión del nombre original si no reconocemos el mimetype
                    if (file.originalname) {
                        const match = file.originalname.match(/\.([^.]+)$/);
                        if (match && match[1]) {
                            extensionFile = match[1].toLowerCase();
                        }
                    }
                    break;
            }
        } else if (file.originalname) {
            // Si no hay mimetype, intentar extraer de originalname
            const match = file.originalname.match(/\.([^.]+)$/);
            if (match && match[1]) {
                extensionFile = match[1].toLowerCase();
            }
        }

        const newFileName = `${yyyy}${mm}${dd}${hours}${minutes}${secondsDate}-${hash}.${extensionFile}`;
        callback(null, newFileName);
    } catch (error) {
        console.error('Error en fileNameEditor:', error);
        callback(error, null);
    }
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