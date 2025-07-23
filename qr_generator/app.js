const fs = require('fs');

const qr = require('qrcode');
const { getClient } = require('./get-client');

let createHash = require('hash-generator');


function insertVirginMedalRegister() {
    (async () => {
        const client = await getClient();
        const medalString = await createUniqueHash();
    
        let createQuery = `
            INSERT INTO virgin_medals (status, medal_string, register_hash) 
            VALUES ('VIRGIN', '${medalString}', 'third-round');
        `;
    
        const res = await client.query(createQuery);
        console.log('res from app ', res);
        await client.end();
    }
    )();
}

var createUniqueHash = async function () {
    let medalString = createHash(36);
    const client = await getClient();
    let createQuery = `SELECT * FROM virgin_medals  WHERE medal_string = '${medalString}'`;
    const medal = await client.query(createQuery);
    client.end();
    if(medal.rows.length>0) createUniqueHash();
    else return medalString;
}


//function to insert register into medal register
for (let index = 16; index > 0; index--) {
    insertVirginMedalRegister();
}


var  qrMakeSvgFile = async function () {
    // query to get all virgin medal
    const client = await getClient();
    let createQuery = `SELECT * FROM virgin_medals 
        WHERE register_hash = 'second-round'`;
    const medalToSvg = await client.query(createQuery);
    client.end();

    medalToSvg.rows.map(medal => {
        const data = `https://peludosclick.com/mascota-checking?medalString=${medal.medal_string}`;
        const filePath = `medals_qr_images/2025-03-27-${medal.id}-sgv-qr-file-${medal.medal_string}-${medal.register_hash}.png`
        qr.toFile(
            filePath,
            data,
            {
                errorCorrectionalLevel: 'H',
                margin: 2,
                scale: 4,
                type: "png"
            },
            err => {
                if(err) {
                    console.log('Error generation')
                } else {
                    console.log('code generated')
                }
            }
        );
    });
    


}

qrMakeSvgFile();

// query to get all virgin medal

// then loop the res, and make one file to each one medal that
//      that resgister hash === 'genesis'


qr.toFile(
    filePath,
    data,
    {
        errorCorrectionalLevel: 'H',
        margin: 2,
        scale: 4,
        type: "svg"
    },
    err => {
        if(err) {
            console.log('Error generation')
        } else {
            console.log('code generated')
        }
    }
);