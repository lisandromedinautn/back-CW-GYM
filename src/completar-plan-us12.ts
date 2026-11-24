import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { Reloj } from './compartido/dominio/reloj/reloj.puerto.js';
import { ModuloRaiz } from './modulo-raiz.module.js';
import { CompletarPlanUS12 } from './semillas/completar-plan-us12.js';

const app = await NestFactory.createApplicationContext(ModuloRaiz);
try {
  await new CompletarPlanUS12(app.get(DataSource), app.get(Reloj).ahora()).ejecutar();
  console.log('Plan de prueba US12 completado con ejercicios en sus 28 días.');
} finally {
  await app.close();
}
