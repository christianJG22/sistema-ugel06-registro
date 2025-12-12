import React, { useState, useEffect } from 'react';
import { School, User, Phone, Mail, Save, List, Edit2, Trash2, X, Check, Search, CreditCard, Download, Upload, Lock, LogOut } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [formData, setFormData] = useState({
    nombreIE: '',
    nombreDirector: '',
    dniDirector: '',
    situacion: '',
    aula: '',
    telefono: '',
    correo: ''
  });

  const [instituciones, setInstituciones] = useState([]);
  const [editando, setEditando] = useState(null);
  const [vistaActual, setVistaActual] = useState('formulario');
  const [errors, setErrors] = useState({});
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [busqueda, setBusqueda] = useState('');

  // Estados para autenticación
  const [isAdmin, setIsAdmin] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [loginData, setLoginData] = useState({ usuario: '', password: '' });
  const [cargando, setCargando] = useState(false);

  // Cargar instituciones desde el backend
  useEffect(() => {
    cargarInstituciones();

    // Verificar si hay token guardado
    const token = localStorage.getItem('adminToken');
    if (token) {
      verificarToken(token);
    }
  }, []);

  // Función para cargar instituciones desde el backend
  const cargarInstituciones = async () => {
    try {
      const response = await fetch(`${API_URL}/instituciones`);
      const data = await response.json();

      if (data.success) {
        setInstituciones(data.data);
      }
    } catch (error) {
      console.error('Error al cargar instituciones:', error);
      setMensaje({ tipo: 'error', texto: '✗ Error al conectar con el servidor' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    }
  };

  // Verificar token guardado
  const verificarToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setIsAdmin(true);
      } else {
        localStorage.removeItem('adminToken');
        setIsAdmin(false);
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
    }
  };

  // Login de administrador
  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAdmin(true);
        setMostrarLogin(false);
        setLoginData({ usuario: '', password: '' });
        setMensaje({ tipo: 'success', texto: '✓ Bienvenido administrador' });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 2000);
      } else {
        setMensaje({ tipo: 'error', texto: '✗ ' + data.message });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      }
    } catch (error) {
      console.error('Error en login:', error);
      setMensaje({ tipo: 'error', texto: '✗ Error al conectar con el servidor' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } finally {
      setCargando(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    setVistaActual('formulario');
    setMensaje({ tipo: 'success', texto: '✓ Sesión cerrada' });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombreIE.trim()) {
      nuevosErrores.nombreIE = 'El nombre de la institución es requerido';
    }

    if (!formData.nombreDirector.trim()) {
      nuevosErrores.nombreDirector = 'El nombre del director es requerido';
    }

    if (!formData.dniDirector.trim()) {
      nuevosErrores.dniDirector = 'El DNI del director es requerido';
    } else if (!/^\d{8}$/.test(formData.dniDirector.replace(/\s/g, ''))) {
      nuevosErrores.dniDirector = 'El DNI debe tener 8 dígitos';
    }

    if (!formData.situacion) {
      nuevosErrores.situacion = 'La situación es requerida';
    }

    if (!formData.aula) {
      nuevosErrores.aula = 'El estado de aula es requerido';
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es requerido';
    } else if (!/^\d{9}$/.test(formData.telefono.replace(/\s/g, ''))) {
      nuevosErrores.telefono = 'Ingrese un número válido de 9 dígitos';
    }

    if (!formData.correo.trim()) {
      nuevosErrores.correo = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      nuevosErrores.correo = 'Ingrese un correo electrónico válido';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setCargando(true);

    try {
      if (editando !== null) {
        // Actualizar (requiere autenticación)
        const token = localStorage.getItem('adminToken');
        const institucion = instituciones[editando];

        const response = await fetch(`${API_URL}/instituciones/${institucion.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
          await cargarInstituciones();
          setMensaje({ tipo: 'success', texto: '✓ Institución actualizada exitosamente' });
          setEditando(null);
          setVistaActual('lista');
        } else {
          setMensaje({ tipo: 'error', texto: '✗ ' + data.message });
        }
      } else {
        // Crear nueva (público)
        const response = await fetch(`${API_URL}/instituciones`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
          await cargarInstituciones();
          setMensaje({ tipo: 'success', texto: '✓ Institución registrada exitosamente' });
        } else {
          setMensaje({ tipo: 'error', texto: '✗ ' + data.message });
        }
      }

      setFormData({
        nombreIE: '',
        nombreDirector: '',
        dniDirector: '',
        situacion: '',
        aula: '',
        telefono: '',
        correo: ''
      });

      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ tipo: 'error', texto: '✗ Error al conectar con el servidor' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (index) => {
    const institucion = instituciones[index];
    setFormData({
      nombreIE: institucion.nombreIE,
      nombreDirector: institucion.nombreDirector,
      dniDirector: institucion.dniDirector,
      situacion: institucion.situacion,
      aula: institucion.aula,
      telefono: institucion.telefono,
      correo: institucion.correo
    });
    setEditando(index);
    setVistaActual('formulario');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (index) => {
    if (window.confirm('¿Está seguro de eliminar esta institución?')) {
      const token = localStorage.getItem('adminToken');
      const institucion = instituciones[index];

      try {
        const response = await fetch(`${API_URL}/instituciones/${institucion.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          await cargarInstituciones();
          setMensaje({ tipo: 'success', texto: '✓ Institución eliminada' });
        } else {
          setMensaje({ tipo: 'error', texto: '✗ ' + data.message });
        }

        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      } catch (error) {
        console.error('Error:', error);
        setMensaje({ tipo: 'error', texto: '✗ Error al conectar con el servidor' });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      }
    }
  };

  const cancelarEdicion = () => {
    setFormData({
      nombreIE: '',
      nombreDirector: '',
      dniDirector: '',
      situacion: '',
      aula: '',
      telefono: '',
      correo: ''
    });
    setEditando(null);
    setErrors({});
  };

  const institucionesFiltradas = instituciones.filter(ie => {
    const termino = busqueda.toLowerCase();
    return (
      ie.nombreIE.toLowerCase().includes(termino) ||
      ie.nombreDirector.toLowerCase().includes(termino) ||
      (ie.dniDirector && ie.dniDirector.includes(termino)) ||
      ie.telefono.includes(termino) ||
      ie.correo.toLowerCase().includes(termino)
    );
  });

  const exportarAExcel = () => {
    const datosParaExportar = institucionesFiltradas.map((ie, index) => ({
      'N°': index + 1,
      'Institución Educativa': ie.nombreIE,
      'Director': ie.nombreDirector,
      'DNI': ie.dniDirector || 'No registrado',
      'Situación': ie.situacion || 'No registrado',
      'Aula': ie.aula || 'No registrado',
      'Teléfono': ie.telefono,
      'Correo Electrónico': ie.correo
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datosParaExportar);

    const columnWidths = [
      { wch: 5 },
      { wch: 40 },
      { wch: 30 },
      { wch: 12 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 35 }
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Instituciones');

    const fecha = new Date();
    const nombreArchivo = `Instituciones_UGEL06_${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}.xlsx`;

    XLSX.writeFile(wb, nombreArchivo);

    setMensaje({ tipo: 'success', texto: `✓ ${datosParaExportar.length} ${datosParaExportar.length === 1 ? 'institución exportada' : 'instituciones exportadas'} a Excel exitosamente` });
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  const importarDesdeExcel = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = async (evento) => {
      try {
        const data = new Uint8Array(evento.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const primerHoja = workbook.Sheets[workbook.SheetNames[0]];
        const datosImportados = XLSX.utils.sheet_to_json(primerHoja);

        if (datosImportados.length === 0) {
          setMensaje({ tipo: 'error', texto: '✗ El archivo está vacío o no tiene el formato correcto' });
          setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
          return;
        }

        setCargando(true);
        let exitosos = 0;
        let errores = 0;

        const token = localStorage.getItem('adminToken');

        for (const fila of datosImportados) {
          const institucion = {
            nombreIE: fila['Institución Educativa'] || fila['Institucion Educativa'] || '',
            nombreDirector: fila['Director'] || '',
            dniDirector: String(fila['DNI'] || '').trim(),
            situacion: fila['Situación'] || fila['Situacion'] || '',
            aula: fila['Aula'] || '',
            telefono: String(fila['Teléfono'] || fila['Telefono'] || '').trim(),
            correo: fila['Correo Electrónico'] || fila['Correo Electronico'] || ''
          };

          try {
            const response = await fetch(`${API_URL}/instituciones`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(institucion)
            });

            const data = await response.json();

            if (data.success) {
              exitosos++;
            } else {
              errores++;
            }
          } catch (error) {
            errores++;
          }
        }

        await cargarInstituciones();
        setCargando(false);

        setMensaje({
          tipo: exitosos > 0 ? 'success' : 'error',
          texto: `✓ ${exitosos} instituciones importadas. ${errores > 0 ? `${errores} errores.` : ''}`
        });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);

      } catch (error) {
        console.error('Error al importar:', error);
        setMensaje({ tipo: 'error', texto: '✗ Error al procesar el archivo' });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 4000);
        setCargando(false);
      }
    };

    reader.readAsArrayBuffer(archivo);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/images/logo-ugel-06.png" alt="UGEL 06" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Directorio de Instituciones Educativas Públicas – Registro de Directores (UGEL 06)
          </h1>
          <p className="text-gray-600">Sistema para el Registro y Actualización de Datos de Directores</p>

          {isAdmin && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión Admin
              </button>
            </div>
          )}
        </div>

        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-lg shadow-md ${mensaje.tipo === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' :
            'bg-red-100 border-l-4 border-red-500 text-red-700'
            }`}>
            {mensaje.texto}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setVistaActual('formulario');
              if (editando !== null) {
                setEditando(null);
                setFormData({
                  nombreIE: '',
                  nombreDirector: '',
                  dniDirector: '',
                  situacion: '',
                  aula: '',
                  telefono: '',
                  correo: ''
                });
                setErrors({});
              }
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${vistaActual === 'formulario'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Save className="inline-block w-5 h-5 mr-2" />
            Registrar
          </button>

          <button
            onClick={() => {
              if (!isAdmin) {
                setMostrarLogin(true);
              } else {
                setVistaActual('lista');
              }
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${vistaActual === 'lista'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            <List className="inline-block w-5 h-5 mr-2" />
            Ver Registros ({instituciones.length})
            {!isAdmin && <Lock className="inline-block w-4 h-4 ml-2" />}
          </button>
        </div>

        {/* MODAL DE LOGIN */}
        {mostrarLogin && !isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-indigo-600" />
                Acceso Administrativo
              </h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={loginData.usuario}
                    onChange={(e) => setLoginData({ ...loginData, usuario: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ingrese usuario"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ingrese contraseña"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={cargando}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400"
                  >
                    {cargando ? 'Verificando...' : 'Ingresar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarLogin(false);
                      setLoginData({ usuario: '', password: '' });
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>

              <p className="mt-4 text-sm text-gray-500 text-center">
                Solo administradores autorizados pueden acceder
              </p>
            </div>
          </div>
        )}

        {/* FORMULARIO */}
        {vistaActual === 'formulario' && (
          <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editando !== null ? 'Editar Institución' : 'Registrar Datos del Director'}
            </h2>

            <div className="space-y-6">

              {/* Nombre IE */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <School className="w-4 h-4 mr-2 text-indigo-600" />
                  Nombre de la Institución Educativa
                </label>
                <input
                  type="text"
                  name="nombreIE"
                  value={formData.nombreIE}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.nombreIE ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ej: I.E. 1192 Florentino Prat"
                />
                {errors.nombreIE && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombreIE}</p>
                )}
              </div>

              {/* Director */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2 text-indigo-600" />
                  Nombre del Director
                </label>
                <input
                  type="text"
                  name="nombreDirector"
                  value={formData.nombreDirector}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.nombreDirector ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ej: María González Pérez"
                />
                {errors.nombreDirector && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombreDirector}</p>
                )}
              </div>

              {/* DNI Director */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 mr-2 text-indigo-600" />
                  DNI del Director
                </label>
                <input
                  type="text"
                  name="dniDirector"
                  value={formData.dniDirector}
                  onChange={handleChange}
                  maxLength="8"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.dniDirector ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ej: 12345678"
                />
                {errors.dniDirector && (
                  <p className="mt-1 text-sm text-red-600">{errors.dniDirector}</p>
                )}
              </div>

              {/* Situación */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 mr-2 text-indigo-600" />
                  Situación
                </label>
                <select
                  name="situacion"
                  value={formData.situacion}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.situacion ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Encargado">Encargado</option>
                  <option value="Designado">Designado</option>
                </select>
                {errors.situacion && (
                  <p className="mt-1 text-sm text-red-600">{errors.situacion}</p>
                )}
              </div>

              {/* Aula */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <School className="w-4 h-4 mr-2 text-indigo-600" />
                  Aula
                </label>
                <select
                  name="aula"
                  value={formData.aula}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.aula ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Seleccione una opción</option>
                  <option value="Con aula a cargo">Con aula a cargo</option>
                  <option value="Sin aula a cargo">Sin aula a cargo</option>
                </select>
                {errors.aula && (
                  <p className="mt-1 text-sm text-red-600">{errors.aula}</p>
                )}
              </div>

              {/* Telefono */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 mr-2 text-indigo-600" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.telefono ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ej: 987654321"
                />
                {errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
                )}
              </div>

              {/* Correo */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 mr-2 text-indigo-600" />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${errors.correo ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Ej: director@institucion.edu.pe"
                />
                {errors.correo && (
                  <p className="mt-1 text-sm text-red-600">{errors.correo}</p>
                )}
              </div>

              {/* BOTONES */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={cargando}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl flex items-center justify-center disabled:bg-gray-400"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {cargando ? 'Guardando...' : (editando !== null ? 'Actualizar' : 'Guardar')}
                </button>

                {editando !== null && (
                  <button
                    onClick={cancelarEdicion}
                    className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancelar
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* LISTA */}
        {vistaActual === 'lista' && isAdmin && (
          <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Instituciones Registradas
            </h2>

            {/* BUSCADOR */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de IE, director, DNI, teléfono o correo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-600">
                  Mostrando {institucionesFiltradas.length} de {instituciones.length} instituciones
                </p>
                <div className="flex gap-3">
                  {instituciones.length > 0 && (
                    <button
                      onClick={exportarAExcel}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Exportar a Excel
                    </button>
                  )}
                  <input
                    type="file"
                    id="importarExcel"
                    accept=".xlsx, .xls"
                    onChange={importarDesdeExcel}
                    className="hidden"
                  />
                  <button
                    onClick={() => document.getElementById('importarExcel').click()}
                    disabled={cargando}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg flex items-center gap-2 disabled:bg-gray-400"
                  >
                    <Upload className="w-5 h-5" />
                    {cargando ? 'Importando...' : 'Importar desde Excel'}
                  </button>
                </div>
              </div>
            </div>

            {/* LISTA DE REGISTROS */}
            {institucionesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {busqueda ? 'No se encontraron resultados para tu búsqueda' : 'No hay instituciones registradas'}
                </p>

                {busqueda ? (
                  <button
                    onClick={() => setBusqueda('')}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Limpiar búsqueda
                  </button>
                ) : (
                  <button
                    onClick={() => setVistaActual('formulario')}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Registrar la primera institución
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {institucionesFiltradas.map((ie, index) => {
                  const indiceOriginal = instituciones.findIndex(inst => inst.id === ie.id);
                  return (
                    <div
                      key={ie.id || index}
                      className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">

                        <div className="flex-1 space-y-2">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <School className="w-5 h-5 mr-2 text-indigo-600" />
                            {ie.nombreIE}
                          </h3>
                          <p className="text-gray-600 flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Director:</span>&nbsp;{ie.nombreDirector}
                          </p>
                          <p className="text-gray-600 flex items-center">
                            <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">DNI:</span>&nbsp;{ie.dniDirector || 'No registrado'}
                          </p>
                          <p className="text-gray-600 flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Situación:</span>&nbsp;{ie.situacion || 'No registrado'}
                          </p>
                          <p className="text-gray-600 flex items-center">
                            <School className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="font-medium">Aula:</span>&nbsp;{ie.aula || 'No registrado'}
                          </p>
                          <p className="text-gray-600 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {ie.telefono}
                          </p>
                          <p className="text-gray-600 flex items-center break-all">
                            <Mail className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                            {ie.correo}
                          </p>
                        </div>

                        <div className="flex sm:flex-col gap-2">
                          <button
                            onClick={() => handleEditar(indiceOriginal)}
                            className="flex-1 sm:flex-none bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                          >
                            <Edit2 className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>

                          <button
                            onClick={() => handleEliminar(indiceOriginal)}
                            className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Programador Christian J.</p>
        </div>

      </div>
    </div>
  );
}

export default App;
