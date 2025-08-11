import { CreatePartnerRequest } from '../types/dashboard';
import { partnerService } from '../services/partnerService';

// Datos de ejemplo de pet shops en Godoy Cruz, Mendoza
const samplePartners: CreatePartnerRequest[] = [
  {
    name: "Hakuna Matata",
    address: "Beltrán 1910, M5501 Godoy Cruz, Mendoza",
    whatsapp: "+54 9 261 338-2462",
    phone: "+54 261 338-2462",
    description: "Veterinaria y Pet Shop con años de experiencia en la comunidad. Especialistas en el cuidado de mascotas con atención personalizada.",
    website: "https://www.facebook.com/hakunamatatapetshop",
    partnerType: "VETERINARIAN"
  },
  {
    name: "Veterinaria Dr. Mascotas",
    address: "Calle Belgrano 567, Godoy Cruz, Mendoza",
    whatsapp: "+54 9 261 234-5678",
    phone: "+54 261 234-5678",
    description: "Clínica veterinaria con atención las 24 horas. Especialistas en cirugía y medicina preventiva.",
    website: "https://drmascotas.com.ar",
    partnerType: "VETERINARIAN"
  },
  {
    name: "Café con Mascotas",
    address: "Av. Libertador 890, Godoy Cruz, Mendoza",
    whatsapp: "+54 9 261 345-6789",
    phone: "+54 261 345-6789",
    description: "Restaurante pet-friendly con terraza para mascotas. Menú especial para perros y gatos.",
    website: "https://cafeconmascotas.com.ar",
    partnerType: "RESTAURANT"
  },
  {
    name: "Mundo Animal",
    address: "Calle San Juan 432, Godoy Cruz, Mendoza",
    whatsapp: "+54 9 261 456-7890",
    phone: "+54 261 456-7890",
    description: "Tienda de mascotas con peluquería canina y felina. Productos de higiene y juguetes.",
    website: "https://mundoanimal.com.ar",
    partnerType: "PET_SHOP"
  },
  {
    name: "Clínica Veterinaria San Martín",
    address: "Av. San Martín 2100, Godoy Cruz, Mendoza",
    whatsapp: "+54 9 261 567-8901",
    phone: "+54 261 567-8901",
    description: "Clínica veterinaria especializada en animales exóticos y de compañía. Laboratorio propio.",
    website: "https://clinicasanmartin.com.ar",
    partnerType: "VETERINARIAN"
  },
  {
    name: "Parrilla El Perro",
    address: "Calle Rivadavia 765, Godoy Cruz, Mendoza",
    whatsapp: "+54 9 261 678-9012",
    phone: "+54 261 678-9012",
    description: "Parrilla tradicional con patio para mascotas. Especialidad en carnes argentinas.",
    website: "https://parrillaelperro.com.ar",
    partnerType: "RESTAURANT"
  },
  {
    name: "Mascotas Express",
    address: "Av. Godoy Cruz 1500, Godoy Cruz, Mendoza",
    whatsapp: "+54 9 261 789-0123",
    phone: "+54 261 789-0123",
    description: "Tienda de mascotas con delivery express. Productos premium y atención personalizada.",
    website: "https://mascotasexpress.com.ar",
    partnerType: "PET_SHOP"
  },
  {
    name: "Centro Veterinario Mendoza",
    address: "Calle Las Heras 987, Godoy Cruz, Mendoza",
    whatsapp: "+54 9 261 890-1234",
    phone: "+54 261 890-1234",
    description: "Centro veterinario integral con especialistas en diferentes áreas. Radiología y ecografía.",
    website: "https://centroveterinariomendoza.com.ar",
    partnerType: "VETERINARIAN"
  },
  {
    name: "Pizzería La Mascota",
    address: "Av. San Martín 1800, Godoy Cruz, Mendoza",
    whatsapp: "+54 9 261 901-2345",
    phone: "+54 261 901-2345",
    description: "Pizzería con terraza pet-friendly. Menú especial para mascotas y delivery.",
    website: "https://pizzerialamascota.com.ar",
    partnerType: "RESTAURANT"
  },
  {
    name: "Animales y Más",
    address: "Calle Dorrego 654, Godoy Cruz, Mendoza",
    whatsapp: "+54 9 261 012-3456",
    phone: "+54 261 012-3456",
    description: "Tienda especializada en productos naturales para mascotas. Asesoramiento nutricional.",
    website: "https://animalesymas.com.ar",
    partnerType: "PET_SHOP"
  }
];

export class SampleDataLoader {
  static async loadSamplePartners(): Promise<void> {
    console.log('🚀 Iniciando carga de datos de ejemplo...');
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const partner of samplePartners) {
        try {
          await partnerService.createPartner(partner);
          successCount++;
          console.log(`✅ Partner creado: ${partner.name}`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Error creando partner ${partner.name}:`, error);
        }
        
        // Pequeña pausa entre creaciones para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`\n📊 Resumen de carga:`);
      console.log(`✅ Partners creados exitosamente: ${successCount}`);
      console.log(`❌ Errores: ${errorCount}`);
      console.log(`📈 Total procesados: ${samplePartners.length}`);
      
    } catch (error) {
      console.error('❌ Error general en la carga de datos:', error);
    }
  }
  
  static getSamplePartners(): CreatePartnerRequest[] {
    return samplePartners;
  }
  
  static getSamplePartner(index: number): CreatePartnerRequest | null {
    return samplePartners[index] || null;
  }
} 