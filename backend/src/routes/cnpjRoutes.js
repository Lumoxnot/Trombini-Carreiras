import express from 'express';
import { checkCnpjEMPRESA } from '../controllers/cnpjController.js';

const rotaCnpj = express.Router();

rotaCnpj.post("/validar", checkCnpjEMPRESA);

export default rotaCnpj;
