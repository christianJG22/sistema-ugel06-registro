const jwt = require('jsonwebtoken');

// Clave secreta para JWT (en producción debería estar en variable de entorno)
const JWT_SECRET = 'ugel06-secret-key-2024';

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No se proporcionó token de autenticación'
        });
    }

    try {
        // Remover "Bearer " si está presente
        const tokenLimpio = token.startsWith('Bearer ') ? token.slice(7) : token;

        const decoded = jwt.verify(tokenLimpio, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

// Generar token JWT
const generarToken = (usuario) => {
    return jwt.sign(
        {
            id: usuario.id,
            usuario: usuario.usuario,
            rol: usuario.rol
        },
        JWT_SECRET,
        { expiresIn: '24h' } // Token válido por 24 horas
    );
};

module.exports = {
    verificarToken,
    generarToken,
    JWT_SECRET
};
