import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { Record } from '../models/Record.js';

const router = express.Router();

function toRecordPayload(record) {
  return {
    id: record._id.toString(),
    nombres: record.nombres,
    apellidos: record.apellidos,
    edad: record.edad,
    profesion: record.profesion,
    createdAt: record.createdAt?.toISOString?.() ?? null,
    updatedAt: record.updatedAt?.toISOString?.() ?? null
  };
}

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const records = await Record.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.json({
      message: 'Registros obtenidos correctamente',
      records: records.map(toRecordPayload)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener registros', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nombres, apellidos, edad, profesion } = req.body;

    if (!nombres || !apellidos || edad === undefined || edad === null || !profesion) {
      return res.status(400).json({ message: 'Completa todos los campos' });
    }

    const parsedEdad = Number(edad);

    if (Number.isNaN(parsedEdad) || parsedEdad < 0) {
      return res.status(400).json({ message: 'La edad debe ser un numero valido' });
    }

    const record = await Record.create({
      userId: req.user.id,
      nombres,
      apellidos,
      edad: parsedEdad,
      profesion
    });

    return res.status(201).json({
      message: 'Registro creado correctamente',
      record: toRecordPayload(record)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear el registro', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, edad, profesion } = req.body;

    const record = await Record.findOne({ _id: id, userId: req.user.id });

    if (!record) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    if (nombres !== undefined) record.nombres = nombres;
    if (apellidos !== undefined) record.apellidos = apellidos;
    if (edad !== undefined) {
      const parsedEdad = Number(edad);
      if (Number.isNaN(parsedEdad) || parsedEdad < 0) {
        return res.status(400).json({ message: 'La edad debe ser un numero valido' });
      }
      record.edad = parsedEdad;
    }
    if (profesion !== undefined) record.profesion = profesion;

    await record.save();

    return res.json({
      message: 'Registro actualizado correctamente',
      record: toRecordPayload(record)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar el registro', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Record.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!record) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    return res.json({
      message: 'Registro eliminado correctamente',
      record: toRecordPayload(record)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar el registro', error: error.message });
  }
});

export default router;
