import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'users.db');
const db = new Database(dbPath);

// JWT Secret - En producción debe estar en .env
const JWT_SECRET = process.env.JWT_SECRET || 'leggox-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token válido por 7 días

// Crear tabla de usuarios si no existe
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    postalCode TEXT,
    country TEXT DEFAULT 'Spain',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

/**
 * Registrar un nuevo usuario
 */
export async function registerUser(userData) {
  const { email, password, firstName, lastName } = userData;

  try {
    // Verificar si el email ya existe
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const stmt = db.prepare(`
      INSERT INTO users (email, password, firstName, lastName)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(email, hashedPassword, firstName, lastName);

    // Obtener el usuario creado (sin la contraseña)
    const user = db.prepare(`
      SELECT id, email, firstName, lastName, phone, address, city, postalCode, country, createdAt
      FROM users
      WHERE id = ?
    `).get(result.lastInsertRowid);

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return { user, token };
  } catch (error) {
    throw error;
  }
}

/**
 * Login de usuario
 */
export async function loginUser(email, password) {
  try {
    // Buscar usuario por email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Retornar usuario sin la contraseña
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  } catch (error) {
    throw error;
  }
}

/**
 * Verificar token JWT
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}

/**
 * Obtener usuario por ID
 */
export function getUserById(userId) {
  try {
    const user = db.prepare(`
      SELECT id, email, firstName, lastName, phone, address, city, postalCode, country, createdAt
      FROM users
      WHERE id = ?
    `).get(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Actualizar perfil de usuario
 */
export function updateUserProfile(userId, updates) {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'postalCode', 'country'];
    const fields = [];
    const values = [];

    // Construir query dinámicamente solo con campos permitidos
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    // Añadir updatedAt
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(userId);

    const stmt = db.prepare(`
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return getUserById(userId);
  } catch (error) {
    throw error;
  }
}

/**
 * Middleware para proteger rutas
 */
export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

export default {
  registerUser,
  loginUser,
  verifyToken,
  getUserById,
  updateUserProfile,
  authMiddleware,
};
