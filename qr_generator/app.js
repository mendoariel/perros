const fs = require('fs');

const qr = require('qrcode');

const data = 'https://www.bici-arbol.com';
const filePath = 'qr-code.png';

qr.toFile(
    filePath,
    data,
    {
        errorCorrectionalLevel: 'H',
        margin: 2,
        scale: 4
    },
    err => {
        if(err) {
            console.log('Error generation')
        } else {
            console.log('code generated')
        }
    }
);