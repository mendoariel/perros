// Configuraciones de colores predefinidas para frentes de medallas
// 80 combinaciones de colores exterior/interior (20 originales + 20 invertidas + 40 con blanco como fondo)

export interface MedalColorPreset {
  id: number;
  name: string;
  exteriorColor: string;
  interiorColor: string;
  exteriorHex: string;
  interiorHex: string;
  description?: string;
}

export const MEDAL_COLOR_PRESETS: MedalColorPreset[] = [
  {
    id: 1,
    name: 'Azul Eléctrico - Naranja Puro',
    exteriorColor: 'Azul eléctrico',
    interiorColor: 'Naranja puro',
    exteriorHex: '#0000FF',
    interiorHex: '#FFA500',
    description: 'Combinación vibrante y contrastante'
  },
  {
    id: 2,
    name: 'Verde Lima Vibrante - Magenta',
    exteriorColor: 'Verde lima vibrante',
    interiorColor: 'Magenta',
    exteriorHex: '#00FF00',
    interiorHex: '#FF00FF',
    description: 'Colores neón complementarios'
  },
  {
    id: 3,
    name: 'Cian Turquesa - Rojo Intenso',
    exteriorColor: 'Cian (turquesa fuerte)',
    interiorColor: 'Rojo intenso',
    exteriorHex: '#00FFFF',
    interiorHex: '#FF0000',
    description: 'Contraste cálido-frío'
  },
  {
    id: 4,
    name: 'Azul Real Profundo - Amarillo Pálido',
    exteriorColor: 'Azul real profundo',
    interiorColor: 'Amarillo pálido',
    exteriorHex: '#234E70',
    interiorHex: '#FBF8BE',
    description: 'Elegante y sofisticado'
  },
  {
    id: 5,
    name: 'Verde Esmeralda - Rosa Fucsia',
    exteriorColor: 'Verde esmeralda',
    interiorColor: 'Rosa fucsia',
    exteriorHex: '#007F5F',
    interiorHex: '#FF007F',
    description: 'Naturaleza y pasión'
  },
  {
    id: 6,
    name: 'Rojo Brillante - Cian Profundo',
    exteriorColor: 'Rojo brillante',
    interiorColor: 'Cian profundo',
    exteriorHex: '#FF0000',
    interiorHex: '#00BFFF',
    description: 'Energía y frescura'
  },
  {
    id: 7,
    name: 'Púrpura Medio - Amarillo Vibrante',
    exteriorColor: 'Púrpura medio (violeta)',
    interiorColor: 'Amarillo vibrante',
    exteriorHex: '#800080',
    interiorHex: '#FFFF00',
    description: 'Real y luminoso'
  },
  {
    id: 8,
    name: 'Azul Petróleo - Amarillo Mostaza',
    exteriorColor: 'Azul petróleo oscuro',
    interiorColor: 'Amarillo mostaza',
    exteriorHex: '#004B87',
    interiorHex: '#FFDB58',
    description: 'Profesional y cálido'
  },
  {
    id: 9,
    name: 'Turquesa Claro - Rojo Coral',
    exteriorColor: 'Turquesa claro',
    interiorColor: 'Rojo coral',
    exteriorHex: '#40E0D0',
    interiorHex: '#FF4040',
    description: 'Frescura y vitalidad'
  },
  {
    id: 10,
    name: 'Verde Azulado Intenso - Naranja Neón',
    exteriorColor: 'Verde azulado intenso',
    interiorColor: 'Naranja neón',
    exteriorHex: '#008080',
    interiorHex: '#FFA500',
    description: 'Equilibrio y energía'
  },
  {
    id: 11,
    name: 'Azul Rey - Naranja Clarito',
    exteriorColor: 'Azul rey',
    interiorColor: 'Naranja clarito',
    exteriorHex: '#4169E1',
    interiorHex: '#FFD700',
    description: 'Nobleza y brillo'
  },
  {
    id: 12,
    name: 'Rojo Tomate - Verde Manzana',
    exteriorColor: 'Rojo tomate',
    interiorColor: 'Verde manzana',
    exteriorHex: '#FF6347',
    interiorHex: '#7FFF00',
    description: 'Frescura natural'
  },
  {
    id: 13,
    name: 'Azul Zafiro - Amarillo Canario',
    exteriorColor: 'Azul zafiro',
    interiorColor: 'Amarillo canario',
    exteriorHex: '#082567',
    interiorHex: '#FFFF33',
    description: 'Precioso y luminoso'
  },
  {
    id: 14,
    name: 'Verde Esmeralda Oscuro - Amarillo Limón',
    exteriorColor: 'Verde esmeralda oscuro',
    interiorColor: 'Amarillo limón',
    exteriorHex: '#006400',
    interiorHex: '#F7FF00',
    description: 'Naturaleza vibrante'
  },
  {
    id: 15,
    name: 'Azul Eléctrico - Rojo Cereza',
    exteriorColor: 'Azul eléctrico',
    interiorColor: 'Rojo cereza',
    exteriorHex: '#1E90FF',
    interiorHex: '#DD2244',
    description: 'Energía y pasión'
  },
  {
    id: 16,
    name: 'Rojo Vibrante - Azul Cielo',
    exteriorColor: 'Rojo vibrante',
    interiorColor: 'Azul cielo',
    exteriorHex: '#FF4500',
    interiorHex: '#87CEEB',
    description: 'Fuego y calma'
  },
  {
    id: 17,
    name: 'Turquesa Neón - Magenta Neón',
    exteriorColor: 'Turquesa neón',
    interiorColor: 'Magenta neón',
    exteriorHex: '#00FFEF',
    interiorHex: '#FF00CB',
    description: 'Futurista y vibrante'
  },
  {
    id: 18,
    name: 'Violeta Neón - Verde Lima Eléctrico',
    exteriorColor: 'Violeta neón',
    interiorColor: 'Verde lima eléctrico',
    exteriorHex: '#9400D3',
    interiorHex: '#00FF00',
    description: 'Místico y natural'
  },
  {
    id: 19,
    name: 'Azul Cobalto - Amarillo Oro Intenso',
    exteriorColor: 'Azul cobalto',
    interiorColor: 'Amarillo oro intenso',
    exteriorHex: '#0047AB',
    interiorHex: '#FFD700',
    description: 'Lujo y elegancia'
  },
  {
    id: 20,
    name: 'Azul Ultramar - Naranja Brillante',
    exteriorColor: 'Azul ultramar',
    interiorColor: 'Naranja brillante',
    exteriorHex: '#3F00FF',
    interiorHex: '#FF7F00',
    description: 'Profundo y energético'
  },
  // Combinaciones invertidas (21-40)
  {
    id: 21,
    name: 'Naranja Puro - Azul Eléctrico',
    exteriorColor: 'Naranja puro',
    interiorColor: 'Azul eléctrico',
    exteriorHex: '#FFA500',
    interiorHex: '#0000FF',
    description: 'Combinación vibrante invertida'
  },
  {
    id: 22,
    name: 'Magenta - Verde Lima Vibrante',
    exteriorColor: 'Magenta',
    interiorColor: 'Verde lima vibrante',
    exteriorHex: '#FF00FF',
    interiorHex: '#00FF00',
    description: 'Colores neón complementarios invertidos'
  },
  {
    id: 23,
    name: 'Rojo Intenso - Cian Turquesa',
    exteriorColor: 'Rojo intenso',
    interiorColor: 'Cian (turquesa fuerte)',
    exteriorHex: '#FF0000',
    interiorHex: '#00FFFF',
    description: 'Contraste cálido-frío invertido'
  },
  {
    id: 24,
    name: 'Amarillo Pálido - Azul Real Profundo',
    exteriorColor: 'Amarillo pálido',
    interiorColor: 'Azul real profundo',
    exteriorHex: '#FBF8BE',
    interiorHex: '#234E70',
    description: 'Elegante y sofisticado invertido'
  },
  {
    id: 25,
    name: 'Rosa Fucsia - Verde Esmeralda',
    exteriorColor: 'Rosa fucsia',
    interiorColor: 'Verde esmeralda',
    exteriorHex: '#FF007F',
    interiorHex: '#007F5F',
    description: 'Pasión y naturaleza invertidos'
  },
  {
    id: 26,
    name: 'Cian Profundo - Rojo Brillante',
    exteriorColor: 'Cian profundo',
    interiorColor: 'Rojo brillante',
    exteriorHex: '#00BFFF',
    interiorHex: '#FF0000',
    description: 'Frescura y energía invertidas'
  },
  {
    id: 27,
    name: 'Amarillo Vibrante - Púrpura Medio',
    exteriorColor: 'Amarillo vibrante',
    interiorColor: 'Púrpura medio (violeta)',
    exteriorHex: '#FFFF00',
    interiorHex: '#800080',
    description: 'Luminoso y real invertido'
  },
  {
    id: 28,
    name: 'Amarillo Mostaza - Azul Petróleo',
    exteriorColor: 'Amarillo mostaza',
    interiorColor: 'Azul petróleo oscuro',
    exteriorHex: '#FFDB58',
    interiorHex: '#004B87',
    description: 'Cálido y profesional invertido'
  },
  {
    id: 29,
    name: 'Rojo Coral - Turquesa Claro',
    exteriorColor: 'Rojo coral',
    interiorColor: 'Turquesa claro',
    exteriorHex: '#FF4040',
    interiorHex: '#40E0D0',
    description: 'Vitalidad y frescura invertidas'
  },
  {
    id: 30,
    name: 'Naranja Neón - Verde Azulado Intenso',
    exteriorColor: 'Naranja neón',
    interiorColor: 'Verde azulado intenso',
    exteriorHex: '#FFA500',
    interiorHex: '#008080',
    description: 'Energía y equilibrio invertidos'
  },
  {
    id: 31,
    name: 'Naranja Clarito - Azul Rey',
    exteriorColor: 'Naranja clarito',
    interiorColor: 'Azul rey',
    exteriorHex: '#FFD700',
    interiorHex: '#4169E1',
    description: 'Brillo y nobleza invertidos'
  },
  {
    id: 32,
    name: 'Verde Manzana - Rojo Tomate',
    exteriorColor: 'Verde manzana',
    interiorColor: 'Rojo tomate',
    exteriorHex: '#7FFF00',
    interiorHex: '#FF6347',
    description: 'Natural y fresco invertido'
  },
  {
    id: 33,
    name: 'Amarillo Canario - Azul Zafiro',
    exteriorColor: 'Amarillo canario',
    interiorColor: 'Azul zafiro',
    exteriorHex: '#FFFF33',
    interiorHex: '#082567',
    description: 'Luminoso y precioso invertido'
  },
  {
    id: 34,
    name: 'Amarillo Limón - Verde Esmeralda Oscuro',
    exteriorColor: 'Amarillo limón',
    interiorColor: 'Verde esmeralda oscuro',
    exteriorHex: '#F7FF00',
    interiorHex: '#006400',
    description: 'Vibrante y natural invertido'
  },
  {
    id: 35,
    name: 'Rojo Cereza - Azul Eléctrico',
    exteriorColor: 'Rojo cereza',
    interiorColor: 'Azul eléctrico',
    exteriorHex: '#DD2244',
    interiorHex: '#1E90FF',
    description: 'Pasión y energía invertidas'
  },
  {
    id: 36,
    name: 'Azul Cielo - Rojo Vibrante',
    exteriorColor: 'Azul cielo',
    interiorColor: 'Rojo vibrante',
    exteriorHex: '#87CEEB',
    interiorHex: '#FF4500',
    description: 'Calma y fuego invertidos'
  },
  {
    id: 37,
    name: 'Magenta Neón - Turquesa Neón',
    exteriorColor: 'Magenta neón',
    interiorColor: 'Turquesa neón',
    exteriorHex: '#FF00CB',
    interiorHex: '#00FFEF',
    description: 'Vibrante y futurista invertido'
  },
  {
    id: 38,
    name: 'Verde Lima Eléctrico - Violeta Neón',
    exteriorColor: 'Verde lima eléctrico',
    interiorColor: 'Violeta neón',
    exteriorHex: '#00FF00',
    interiorHex: '#9400D3',
    description: 'Natural y místico invertido'
  },
  {
    id: 39,
    name: 'Amarillo Oro Intenso - Azul Cobalto',
    exteriorColor: 'Amarillo oro intenso',
    interiorColor: 'Azul cobalto',
    exteriorHex: '#FFD700',
    interiorHex: '#0047AB',
    description: 'Elegante y lujoso invertido'
  },
  {
    id: 40,
    name: 'Naranja Brillante - Azul Ultramar',
    exteriorColor: 'Naranja brillante',
    interiorColor: 'Azul ultramar',
    exteriorHex: '#FF7F00',
    interiorHex: '#3F00FF',
    description: 'Energético y profundo invertido'
  },
  // Combinaciones con blanco como fondo (41-60)
  {
    id: 41,
    name: 'Blanco - Azul Eléctrico',
    exteriorColor: 'Blanco',
    interiorColor: 'Azul eléctrico',
    exteriorHex: '#FFFFFF',
    interiorHex: '#0000FF',
    description: 'Fondo blanco con azul eléctrico'
  },
  {
    id: 42,
    name: 'Blanco - Verde Lima Vibrante',
    exteriorColor: 'Blanco',
    interiorColor: 'Verde lima vibrante',
    exteriorHex: '#FFFFFF',
    interiorHex: '#00FF00',
    description: 'Fondo blanco con verde neón'
  },
  {
    id: 43,
    name: 'Blanco - Cian Turquesa',
    exteriorColor: 'Blanco',
    interiorColor: 'Cian (turquesa fuerte)',
    exteriorHex: '#FFFFFF',
    interiorHex: '#00FFFF',
    description: 'Fondo blanco con cian vibrante'
  },
  {
    id: 44,
    name: 'Blanco - Azul Real Profundo',
    exteriorColor: 'Blanco',
    interiorColor: 'Azul real profundo',
    exteriorHex: '#FFFFFF',
    interiorHex: '#234E70',
    description: 'Fondo blanco con azul elegante'
  },
  {
    id: 45,
    name: 'Blanco - Verde Esmeralda',
    exteriorColor: 'Blanco',
    interiorColor: 'Verde esmeralda',
    exteriorHex: '#FFFFFF',
    interiorHex: '#007F5F',
    description: 'Fondo blanco con verde esmeralda'
  },
  {
    id: 46,
    name: 'Blanco - Rojo Brillante',
    exteriorColor: 'Blanco',
    interiorColor: 'Rojo brillante',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FF0000',
    description: 'Fondo blanco con rojo intenso'
  },
  {
    id: 47,
    name: 'Blanco - Púrpura Medio',
    exteriorColor: 'Blanco',
    interiorColor: 'Púrpura medio (violeta)',
    exteriorHex: '#FFFFFF',
    interiorHex: '#800080',
    description: 'Fondo blanco con púrpura real'
  },
  {
    id: 48,
    name: 'Blanco - Azul Petróleo',
    exteriorColor: 'Blanco',
    interiorColor: 'Azul petróleo oscuro',
    exteriorHex: '#FFFFFF',
    interiorHex: '#004B87',
    description: 'Fondo blanco con azul profesional'
  },
  {
    id: 49,
    name: 'Blanco - Turquesa Claro',
    exteriorColor: 'Blanco',
    interiorColor: 'Turquesa claro',
    exteriorHex: '#FFFFFF',
    interiorHex: '#40E0D0',
    description: 'Fondo blanco con turquesa fresco'
  },
  {
    id: 50,
    name: 'Blanco - Verde Azulado Intenso',
    exteriorColor: 'Blanco',
    interiorColor: 'Verde azulado intenso',
    exteriorHex: '#FFFFFF',
    interiorHex: '#008080',
    description: 'Fondo blanco con verde azulado'
  },
  {
    id: 51,
    name: 'Blanco - Azul Rey',
    exteriorColor: 'Blanco',
    interiorColor: 'Azul rey',
    exteriorHex: '#FFFFFF',
    interiorHex: '#4169E1',
    description: 'Fondo blanco con azul noble'
  },
  {
    id: 52,
    name: 'Blanco - Rojo Tomate',
    exteriorColor: 'Blanco',
    interiorColor: 'Rojo tomate',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FF6347',
    description: 'Fondo blanco con rojo cálido'
  },
  {
    id: 53,
    name: 'Blanco - Azul Zafiro',
    exteriorColor: 'Blanco',
    interiorColor: 'Azul zafiro',
    exteriorHex: '#FFFFFF',
    interiorHex: '#082567',
    description: 'Fondo blanco con azul precioso'
  },
  {
    id: 54,
    name: 'Blanco - Verde Esmeralda Oscuro',
    exteriorColor: 'Blanco',
    interiorColor: 'Verde esmeralda oscuro',
    exteriorHex: '#FFFFFF',
    interiorHex: '#006400',
    description: 'Fondo blanco con verde profundo'
  },
  {
    id: 55,
    name: 'Blanco - Azul Eléctrico (Cereza)',
    exteriorColor: 'Blanco',
    interiorColor: 'Azul eléctrico',
    exteriorHex: '#FFFFFF',
    interiorHex: '#1E90FF',
    description: 'Fondo blanco con azul eléctrico suave'
  },
  {
    id: 56,
    name: 'Blanco - Rojo Vibrante',
    exteriorColor: 'Blanco',
    interiorColor: 'Rojo vibrante',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FF4500',
    description: 'Fondo blanco con rojo vibrante'
  },
  {
    id: 57,
    name: 'Blanco - Turquesa Neón',
    exteriorColor: 'Blanco',
    interiorColor: 'Turquesa neón',
    exteriorHex: '#FFFFFF',
    interiorHex: '#00FFEF',
    description: 'Fondo blanco con turquesa neón'
  },
  {
    id: 58,
    name: 'Blanco - Violeta Neón',
    exteriorColor: 'Blanco',
    interiorColor: 'Violeta neón',
    exteriorHex: '#FFFFFF',
    interiorHex: '#9400D3',
    description: 'Fondo blanco con violeta místico'
  },
  {
    id: 59,
    name: 'Blanco - Azul Cobalto',
    exteriorColor: 'Blanco',
    interiorColor: 'Azul cobalto',
    exteriorHex: '#FFFFFF',
    interiorHex: '#0047AB',
    description: 'Fondo blanco con azul elegante'
  },
  {
    id: 60,
    name: 'Blanco - Azul Ultramar',
    exteriorColor: 'Blanco',
    interiorColor: 'Azul ultramar',
    exteriorHex: '#FFFFFF',
    interiorHex: '#3F00FF',
    description: 'Fondo blanco con azul profundo'
  },
  // Combinaciones con blanco como fondo - colores complementarios (61-80)
  {
    id: 61,
    name: 'Blanco - Naranja Puro',
    exteriorColor: 'Blanco',
    interiorColor: 'Naranja puro',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FFA500',
    description: 'Fondo blanco con naranja vibrante'
  },
  {
    id: 62,
    name: 'Blanco - Magenta',
    exteriorColor: 'Blanco',
    interiorColor: 'Magenta',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FF00FF',
    description: 'Fondo blanco con magenta neón'
  },
  {
    id: 63,
    name: 'Blanco - Rojo Intenso',
    exteriorColor: 'Blanco',
    interiorColor: 'Rojo intenso',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FF0000',
    description: 'Fondo blanco con rojo intenso'
  },
  {
    id: 64,
    name: 'Blanco - Amarillo Pálido',
    exteriorColor: 'Blanco',
    interiorColor: 'Amarillo pálido',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FBF8BE',
    description: 'Fondo blanco con amarillo suave'
  },
  {
    id: 65,
    name: 'Blanco - Rosa Fucsia',
    exteriorColor: 'Blanco',
    interiorColor: 'Rosa fucsia',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FF007F',
    description: 'Fondo blanco con rosa vibrante'
  },
  {
    id: 66,
    name: 'Blanco - Cian Profundo',
    exteriorColor: 'Blanco',
    interiorColor: 'Cian profundo',
    exteriorHex: '#FFFFFF',
    interiorHex: '#00BFFF',
    description: 'Fondo blanco con cian profundo'
  },
  {
    id: 67,
    name: 'Blanco - Amarillo Vibrante',
    exteriorColor: 'Blanco',
    interiorColor: 'Amarillo vibrante',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FFFF00',
    description: 'Fondo blanco con amarillo vibrante'
  },
  {
    id: 68,
    name: 'Blanco - Amarillo Mostaza',
    exteriorColor: 'Blanco',
    interiorColor: 'Amarillo mostaza',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FFDB58',
    description: 'Fondo blanco con amarillo cálido'
  },
  {
    id: 69,
    name: 'Blanco - Rojo Coral',
    exteriorColor: 'Blanco',
    interiorColor: 'Rojo coral',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FF4040',
    description: 'Fondo blanco con rojo coral'
  },
  {
    id: 70,
    name: 'Blanco - Naranja Neón',
    exteriorColor: 'Blanco',
    interiorColor: 'Naranja neón',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FFA500',
    description: 'Fondo blanco con naranja neón'
  },
  {
    id: 71,
    name: 'Blanco - Naranja Clarito',
    exteriorColor: 'Blanco',
    interiorColor: 'Naranja clarito',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FFD700',
    description: 'Fondo blanco con naranja dorado'
  },
  {
    id: 72,
    name: 'Blanco - Verde Manzana',
    exteriorColor: 'Blanco',
    interiorColor: 'Verde manzana',
    exteriorHex: '#FFFFFF',
    interiorHex: '#7FFF00',
    description: 'Fondo blanco con verde manzana'
  },
  {
    id: 73,
    name: 'Blanco - Amarillo Canario',
    exteriorColor: 'Blanco',
    interiorColor: 'Amarillo canario',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FFFF33',
    description: 'Fondo blanco con amarillo canario'
  },
  {
    id: 74,
    name: 'Blanco - Amarillo Limón',
    exteriorColor: 'Blanco',
    interiorColor: 'Amarillo limón',
    exteriorHex: '#FFFFFF',
    interiorHex: '#F7FF00',
    description: 'Fondo blanco con amarillo limón'
  },
  {
    id: 75,
    name: 'Blanco - Rojo Cereza',
    exteriorColor: 'Blanco',
    interiorColor: 'Rojo cereza',
    exteriorHex: '#FFFFFF',
    interiorHex: '#DD2244',
    description: 'Fondo blanco con rojo cereza'
  },
  {
    id: 76,
    name: 'Blanco - Azul Cielo',
    exteriorColor: 'Blanco',
    interiorColor: 'Azul cielo',
    exteriorHex: '#FFFFFF',
    interiorHex: '#87CEEB',
    description: 'Fondo blanco con azul cielo'
  },
  {
    id: 77,
    name: 'Blanco - Magenta Neón',
    exteriorColor: 'Blanco',
    interiorColor: 'Magenta neón',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FF00CB',
    description: 'Fondo blanco con magenta neón'
  },
  {
    id: 78,
    name: 'Blanco - Verde Lima Eléctrico',
    exteriorColor: 'Blanco',
    interiorColor: 'Verde lima eléctrico',
    exteriorHex: '#FFFFFF',
    interiorHex: '#00FF00',
    description: 'Fondo blanco con verde lima eléctrico'
  },
  {
    id: 79,
    name: 'Blanco - Amarillo Oro Intenso',
    exteriorColor: 'Blanco',
    interiorColor: 'Amarillo oro intenso',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FFD700',
    description: 'Fondo blanco con amarillo oro'
  },
  {
    id: 80,
    name: 'Blanco - Naranja Brillante',
    exteriorColor: 'Blanco',
    interiorColor: 'Naranja brillante',
    exteriorHex: '#FFFFFF',
    interiorHex: '#FF7F00',
    description: 'Fondo blanco con naranja brillante'
  }
];

// Función helper para obtener un preset por ID
export const getMedalColorPreset = (id: number): MedalColorPreset | undefined => {
  return MEDAL_COLOR_PRESETS.find(preset => preset.id === id);
};

// Función helper para obtener todos los presets
export const getAllMedalColorPresets = (): MedalColorPreset[] => {
  return MEDAL_COLOR_PRESETS;
};

// Función helper para buscar presets por nombre
export const searchMedalColorPresets = (searchTerm: string): MedalColorPreset[] => {
  const term = searchTerm.toLowerCase();
  return MEDAL_COLOR_PRESETS.filter(preset => 
    preset.name.toLowerCase().includes(term) ||
    preset.exteriorColor.toLowerCase().includes(term) ||
    preset.interiorColor.toLowerCase().includes(term)
  );
};

