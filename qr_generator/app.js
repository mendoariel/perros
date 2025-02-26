const fs = require('fs');

const qr = require('qrcode');

const data = 'https://peludosclick.com/mascota-checking?medalString=rosa_mosqueta';
// const data = 'https://peludosclick.com';
const filePath = 'qr-rose.png';

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