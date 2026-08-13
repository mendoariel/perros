"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var fs = require("fs");
var path = require("path");
var nodemailer = require("nodemailer");
var dotenv = require("dotenv");
// Load environment variables
dotenv.config();
var prisma = new client_1.PrismaClient();
var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.MODULE_MAIL_USER,
        pass: process.env.MODULE_MAIL_PASS,
    },
});
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var isExecutionMode, medals, publicFilesPath, missingCount, emailsSent, missingByOwner, _i, medals_1, medal, filename, filePath, ownerEmail, _a, _b, email, ownerPets, ownerName, petNames, mailOptions, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    isExecutionMode = process.argv.includes('--execute');
                    if (isExecutionMode) {
                        console.log('🚀 MODO EJECUCIÓN: Los correos reales SERÁN ENVIADOS.');
                    }
                    else {
                        console.log('🧪 MODO SIMULACIÓN (DRY RUN): No se enviará ningún correo. Usa --execute para enviar.');
                    }
                    return [4 /*yield*/, prisma.medal.findMany({
                            where: {
                                image: {
                                    not: null,
                                },
                            },
                            include: {
                                owner: true,
                            },
                        })];
                case 1:
                    medals = _c.sent();
                    publicFilesPath = path.join(process.cwd(), 'public', 'files');
                    missingCount = 0;
                    emailsSent = 0;
                    missingByOwner = {};
                    console.log("Buscando archivos faltantes en: ".concat(publicFilesPath));
                    for (_i = 0, medals_1 = medals; _i < medals_1.length; _i++) {
                        medal = medals_1[_i];
                        if (!medal.image)
                            continue;
                        filename = path.basename(medal.image);
                        filePath = path.join(publicFilesPath, filename);
                        if (!fs.existsSync(filePath)) {
                            missingCount++;
                            ownerEmail = medal.owner.email;
                            if (!missingByOwner[ownerEmail]) {
                                missingByOwner[ownerEmail] = [];
                            }
                            missingByOwner[ownerEmail].push(medal);
                        }
                    }
                    console.log("\nResultados: ".concat(missingCount, " fotos faltantes encontradas."));
                    _a = 0, _b = Object.keys(missingByOwner);
                    _c.label = 2;
                case 2:
                    if (!(_a < _b.length)) return [3 /*break*/, 9];
                    email = _b[_a];
                    ownerPets = missingByOwner[email];
                    ownerName = ownerPets[0].owner.firstName || 'Dueño/a';
                    petNames = ownerPets.map(function (p) { return p.petName; }).join(', ');
                    console.log("\n-----------------------------------");
                    console.log("\uD83D\uDCE7 Preparando correo para: ".concat(email));
                    console.log("\uD83D\uDC3E Mascota(s) afectada(s): ".concat(petNames));
                    mailOptions = {
                        from: "\"Mi Perro QR\" <".concat(process.env.MODULE_MAIL_USER, ">"),
                        to: email,
                        subject: "\u00A1Ups! Necesitamos tu ayuda con el perfil de ".concat(petNames, " \uD83D\uDC3E"),
                        html: "\n        <div style=\"font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;\">\n          <h2 style=\"color: #FF5A5F;\">\u00A1Hola ".concat(ownerName, "!</h2>\n          <p>Estamos mejorando nuestros servidores en <strong>Mi Perro QR</strong> para ofrecerte un servicio m\u00E1s r\u00E1pido y seguro.</p>\n          <p>Durante esta mudanza, notamos que la foto de tu mascota <strong>").concat(petNames, "</strong> no pudo transferirse correctamente.</p>\n          <p>Para que su perfil y su c\u00F3digo QR sigan vi\u00E9ndose geniales, \u00BFpodr\u00EDas ingresar a tu cuenta y volver a subir su foto?</p>\n          <div style=\"text-align: center; margin: 30px 0;\">\n            <a href=\"").concat(process.env.FRONTEND_URL || 'https://peludosclick.com', "\" style=\"background-color: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;\">\n              Ir a Mi Perro QR\n            </a>\n          </div>\n          <p>\u00A1Lamentamos mucho las molestias y te agradecemos por ser parte de nuestra manada!</p>\n          <p>Atentamente,<br>El equipo de Mi Perro QR</p>\n        </div>\n      "),
                    };
                    if (!isExecutionMode) return [3 /*break*/, 7];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, transporter.sendMail(mailOptions)];
                case 4:
                    _c.sent();
                    console.log("\u2705 Correo enviado exitosamente a ".concat(email));
                    emailsSent++;
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _c.sent();
                    console.error("\u274C Error enviando correo a ".concat(email, ":"), error_1);
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 8];
                case 7:
                    console.log("[SIMULACI\u00D3N] Correo generado. No se ha enviado.");
                    _c.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 2];
                case 9:
                    console.log("\n===================================");
                    console.log("Proceso terminado.");
                    console.log("Usuarios afectados: ".concat(Object.keys(missingByOwner).length));
                    if (isExecutionMode) {
                        console.log("Correos enviados: ".concat(emailsSent));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Error fatal:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
