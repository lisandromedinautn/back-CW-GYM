/**
 * Personas ficticias de la semilla de usuarios (RN-IDE-12, decisión 41). Cualquier parecido con
 * personas reales es casual. Todos los DNI empiezan con 30 (profesores) o 40 (alumnos).
 */
export interface PersonaSemilla {
  nombre: string;
  apellido: string;
  dni: string;
}

export interface ProfesorSemilla extends PersonaSemilla {
  legajo: string;
}

export interface AlumnoSemilla extends PersonaSemilla {
  domicilio: string;
  alturaCm: number;
  pesoKg: number;
  edad: number;
}

export const PROFESORES_SEMILLA: ProfesorSemilla[] = [
  { nombre: 'Laura', apellido: 'Gómez', dni: '30000001', legajo: 'P-001' },
  { nombre: 'Diego', apellido: 'Fernández', dni: '30000002', legajo: 'P-002' },
  { nombre: 'Carla', apellido: 'Ruiz', dni: '30000003', legajo: 'P-003' },
];

export const ALUMNOS_SEMILLA: AlumnoSemilla[] = [
  {
    nombre: 'Martín',
    apellido: 'Pérez',
    dni: '40000001',
    domicilio: 'Av. Colón 1234, Córdoba',
    alturaCm: 175,
    pesoKg: 75,
    edad: 24,
  },
  {
    nombre: 'Sofía',
    apellido: 'López',
    dni: '40000002',
    domicilio: 'Bv. San Juan 560, Córdoba',
    alturaCm: 162,
    pesoKg: 58,
    edad: 21,
  },
  {
    nombre: 'Lucas',
    apellido: 'Martínez',
    dni: '40000003',
    domicilio: 'Obispo Trejo 245, Córdoba',
    alturaCm: 181,
    pesoKg: 82,
    edad: 29,
  },
  {
    nombre: 'Valentina',
    apellido: 'García',
    dni: '40000004',
    domicilio: 'Av. Vélez Sársfield 1500, Córdoba',
    alturaCm: 168,
    pesoKg: 61,
    edad: 26,
  },
  {
    nombre: 'Tomás',
    apellido: 'Rodríguez',
    dni: '40000005',
    domicilio: 'Duarte Quirós 890, Córdoba',
    alturaCm: 178,
    pesoKg: 79,
    edad: 33,
  },
  {
    nombre: 'Camila',
    apellido: 'Sánchez',
    dni: '40000006',
    domicilio: 'Av. Hipólito Yrigoyen 320, Córdoba',
    alturaCm: 158,
    pesoKg: 54,
    edad: 19,
  },
  {
    nombre: 'Joaquín',
    apellido: 'Romero',
    dni: '40000007',
    domicilio: 'Av. Rafael Núñez 4200, Córdoba',
    alturaCm: 185,
    pesoKg: 90,
    edad: 37,
  },
  {
    nombre: 'Martina',
    apellido: 'Díaz',
    dni: '40000008',
    domicilio: 'Belgrano 710, Córdoba',
    alturaCm: 165,
    pesoKg: 63,
    edad: 28,
  },
  {
    nombre: 'Facundo',
    apellido: 'Álvarez',
    dni: '40000009',
    domicilio: 'Av. Sabattini 2100, Córdoba',
    alturaCm: 172,
    pesoKg: 70,
    edad: 22,
  },
  {
    nombre: 'Agustina',
    apellido: 'Torres',
    dni: '40000010',
    domicilio: 'Ituzaingó 455, Córdoba',
    alturaCm: 170,
    pesoKg: 66,
    edad: 31,
  },
  {
    nombre: 'Nicolás',
    apellido: 'Ramírez',
    dni: '40000011',
    domicilio: 'Av. Fuerza Aérea 3300, Córdoba',
    alturaCm: 177,
    pesoKg: 85,
    edad: 40,
  },
  {
    nombre: 'Julieta',
    apellido: 'Flores',
    dni: '40000012',
    domicilio: 'Rondeau 120, Córdoba',
    alturaCm: 160,
    pesoKg: 52,
    edad: 20,
  },
  {
    nombre: 'Matías',
    apellido: 'Acosta',
    dni: '40000013',
    domicilio: 'Av. Colón 3800, Córdoba',
    alturaCm: 183,
    pesoKg: 88,
    edad: 35,
  },
  {
    nombre: 'Lucía',
    apellido: 'Benítez',
    dni: '40000014',
    domicilio: 'Chacabuco 980, Córdoba',
    alturaCm: 166,
    pesoKg: 59,
    edad: 25,
  },
  {
    nombre: 'Santiago',
    apellido: 'Medina',
    dni: '40000015',
    domicilio: 'Av. Recta Martinolli 6500, Córdoba',
    alturaCm: 179,
    pesoKg: 77,
    edad: 27,
  },
  {
    nombre: 'Florencia',
    apellido: 'Herrera',
    dni: '40000016',
    domicilio: 'Tucumán 340, Córdoba',
    alturaCm: 163,
    pesoKg: 57,
    edad: 23,
  },
  {
    nombre: 'Ignacio',
    apellido: 'Castro',
    dni: '40000017',
    domicilio: 'Av. Maipú 650, Córdoba',
    alturaCm: 188,
    pesoKg: 95,
    edad: 42,
  },
  {
    nombre: 'Milagros',
    apellido: 'Suárez',
    dni: '40000018',
    domicilio: 'Santa Rosa 1450, Córdoba',
    alturaCm: 159,
    pesoKg: 55,
    edad: 18,
  },
  {
    nombre: 'Bruno',
    apellido: 'Giménez',
    dni: '40000019',
    domicilio: 'Av. Armada Argentina 900, Córdoba',
    alturaCm: 174,
    pesoKg: 73,
    edad: 30,
  },
  {
    nombre: 'Rocío',
    apellido: 'Molina',
    dni: '40000020',
    domicilio: 'Independencia 760, Córdoba',
    alturaCm: 167,
    pesoKg: 60,
    edad: 34,
  },
];
