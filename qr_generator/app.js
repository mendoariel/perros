const fs = require('fs');

const qr = require('qrcode');
const { getClient } = require('./get-client');

let createHash = require('hash-generator');


function insertVirginMedalRegister(howManyMedalsCreate) {
    (async () => {
        const client = await getClient();
        
        for (let index = howManyMedalsCreate; index > 0; index--) {
            const medalString = await createUniqueHash(client);
            let createQuery = `
                INSERT INTO virgin_medals (status, medal_string, register_hash) 
                VALUES ('VIRGIN', '${medalString}', 'first-round-ezequiel');
            `;
    
        const res = await client.query(createQuery);
        console.log('res from app ', res);
        }
        await client.end()
       
        
    }
    )();
}

var createUniqueHash = async function (client) {
    let medalString = createHash(36);
    //const client = await getClient();
    let createQuery = `SELECT * FROM virgin_medals  WHERE medal_string = '${medalString}'`;
    const medal = await client.query(createQuery);
    if(medal.rows.length>0) createUniqueHash(client);
    else return medalString;
}

//insertVirginMedalRegister(200);




var  qrMakeSvgFile = async function () {
    // query to get all virgin medal
    const client = await getClient();
    let createQuery = `SELECT * FROM virgin_medals 
        WHERE register_hash = 'first-round-ezequiel'`;
    const medalToSvg = await client.query(createQuery);
    client.end();

    medalToSvg.rows.map(medal => {
        const data = `https://www.peludosclick.com/mascota-checking?medalString=${medal.medal_string}`;
        const filePath = `medals_qr_images/ezequiel/first-round/2025-05-06-${medal.id}-png-qr-file-${medal.medal_string}-${medal.register_hash}.png`
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


// qr.toFile(
//     filePath,
//     data,
//     {
//         errorCorrectionalLevel: 'H',
//         margin: 2,
//         scale: 4,
//         type: "svg"
//     },
//     err => {
//         if(err) {
//             console.log('Error generation')
//         } else {
//             console.log('code generated')
//         }
//     }
// );