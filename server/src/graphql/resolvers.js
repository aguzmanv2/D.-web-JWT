import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { User } from '../models/User.js';

function toUserPayload(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt?.toISOString?.() ?? null,
    updatedAt: user.updatedAt?.toISOString?.() ?? null
  };
}

function requireAuth(context) {
  if (!context.user) {
    throw new GraphQLError(context.authError || 'Token no proporcionado', {
      extensions: { code: 'UNAUTHORIZED' }
    });
  }

  return context.user;
}

export const root = {
  users: async (_, context) => {
    requireAuth(context);
    const users = await User.find().sort({ createdAt: -1 });
    return users.map(toUserPayload);
  },

  user: async ({ id }, context) => {
    requireAuth(context);
    const user = await User.findById(id);

    if (!user) {
      return null;
    }

    return toUserPayload(user);
  },

  me: async (_, context) => {
    const decoded = requireAuth(context);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new GraphQLError('Usuario no encontrado', {
        extensions: { code: 'NOT_FOUND' }
      });
    }

    console.log('Token verificado para GraphQL:', decoded);

    return toUserPayload(user);
  },

  register: async ({ name, email, password }) => {
    if (!name || !email || !password) {
      throw new GraphQLError('Completa todos los campos', {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new GraphQLError('El usuario ya existe', {
        extensions: { code: 'CONFLICT' }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    return {
      message: 'Usuario registrado correctamente',
      user: toUserPayload(user)
    };
  },

  login: async ({ email, password }) => {
    if (!email || !password) {
      throw new GraphQLError('Completa email y contraseña', {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new GraphQLError('Credenciales inválidas', {
        extensions: { code: 'UNAUTHORIZED' }
      });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new GraphQLError('Credenciales inválidas', {
        extensions: { code: 'UNAUTHORIZED' }
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    console.log('Token creado en GraphQL:', token);
    console.log('Datos usados para validación en GraphQL:', {
      email,
      userId: user._id.toString(),
      name: user.name
    });

    return {
      message: 'Ingreso validado',
      token,
      user: toUserPayload(user)
    };
  }
};
