import React, { useState, useEffect } from "react";
import { siigoService } from '../../../services/siigoService';

const Siigo = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar productos de Siigo a través del backend
  const cargarProductos = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🚀 Siigo Component - Iniciando carga de productos:', {
        page,
        itemsPerPage,
        searchTerm,
        timestamp: new Date().toISOString()
      });
      
      const data = await siigoService.getProducts({
        page,
        page_size: itemsPerPage,
        name: searchTerm || undefined
        // Removido search - no existe en la API, solo name y code
      });
      
      console.log('📊 Siigo Component - Datos procesados:', {
        success: data.success,
        message: data.message,
        resultsCount: data.data?.results?.length || 0,
        pagination: data.data?.pagination
      });
      
      if (data.success) {
        setProductos(data.data?.results || []);
        setTotalPages(Math.ceil((data.data?.pagination?.total_results || 0) / itemsPerPage));
        console.log('✅ Siigo Component - Productos cargados exitosamente:', {
          productosCount: data.data?.results?.length || 0,
          totalPages
        });
      } else {
        throw new Error(data.message || "Error al cargar productos de Siigo");
      }
    } catch (error) {
      console.error("💥 Siigo Component - Error cargando productos:", {
        message: error.message,
        stack: error.stack,
        page,
        searchTerm,
        timestamp: new Date().toISOString()
      });
      setError(error.message);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar productos cuando cambie la página o término de búsqueda
  useEffect(() => {
    cargarProductos(currentPage);
  }, [currentPage, searchTerm]);

  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Resetear a la primera página
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };


  // Renderizar paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 mx-1 rounded-md text-sm font-medium ${
            i === currentPage
              ? "bg-accent-primary text-white"
              : "bg-primary-card text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-text-secondary">
          Página {currentPage} de {totalPages}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 mx-1 rounded-md text-sm font-medium bg-primary-card text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 mx-1 rounded-md text-sm font-medium bg-primary-card text-text-secondary hover:bg-accent-primary/10 hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-3 h-full w-full">
      <div className="h-fit w-full">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Productos de Siigo</h2>
              <p className="text-text-secondary">
                Gestiona los productos sincronizados desde Siigo API
              </p>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y controles */}
        <div className="mb-6 space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos por nombre..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-text-disabled/30 bg-primary-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Información de conexión y debug */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-1 bg-blue-100 rounded-full">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Conectado a Siigo API</span> - Los productos se cargan automáticamente desde el backend
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    try {
                      console.log('🔧 Debug - Probando conexión con backend...');
                      const result = await siigoService.testConnection();
                      console.log('🔧 Debug - Resultado de test:', result);
                      alert(`Conexión: ${result.success ? '✅ Exitosa' : '❌ Fallida'}\nMensaje: ${result.message || 'Sin mensaje'}`);
                    } catch (error) {
                      console.error('🔧 Debug - Error en test:', error);
                      alert(`Error en conexión: ${error.message}`);
                    }
                  }}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Test Conexión
                </button>
                <button
                  onClick={async () => {
                    try {
                      console.log('🔧 Debug - Obteniendo info del token...');
                      const result = await siigoService.getTokenInfo();
                      console.log('🔧 Debug - Info del token:', result);
                      alert(`Token Info: ${JSON.stringify(result, null, 2)}`);
                    } catch (error) {
                      console.error('🔧 Debug - Error obteniendo token info:', error);
                      alert(`Error obteniendo token info: ${error.message}`);
                    }
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Token Info
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas de productos */}
        {productos.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Productos</p>
                  <p className="text-2xl font-bold text-blue-900">{productos.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Activos</p>
                  <p className="text-2xl font-bold text-green-900">
                    {productos.filter(p => p.active).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Con Stock</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {productos.filter(p => p.available_quantity > 0).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Precio Promedio</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${Math.round(
                      productos
                        .filter(p => p.prices?.[0]?.price_list?.[0]?.value)
                        .reduce((sum, p) => sum + (p.prices[0].price_list[0].value || 0), 0) / 
                      productos.filter(p => p.prices?.[0]?.price_list?.[0]?.value).length || 1
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="bg-primary-card rounded-lg shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
              <span className="ml-3 text-text-secondary">Cargando productos...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <p className="text-red-500 font-medium">Error al cargar productos</p>
                <p className="text-text-secondary text-sm mt-1">{error}</p>
                {error.includes('Failed to fetch') && (
                  <div className="mt-4 p-4 bg-yellow-100 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Problema de CORS detectado:</strong> El backend debe implementar los endpoints de Siigo API.
                      <br />
                      Consulta el archivo <code>Endpoints/SiigoEndpoints.md</code> para la implementación.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => cargarProductos(currentPage)}
                  className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : productos.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-text-secondary text-4xl mb-4">📦</div>
                <p className="text-text-secondary font-medium">No hay productos disponibles</p>
                <p className="text-text-secondary text-sm mt-1">
                  {searchTerm ? "No se encontraron productos con ese criterio de búsqueda" : "Los productos se cargan automáticamente desde Siigo API a través del backend"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => cargarProductos(currentPage)}
                    className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    Recargar Productos
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Tabla de productos */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-text-disabled/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Grupo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Unidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-text-disabled/10">
                    {productos.map((producto, index) => (
                      <tr key={producto.id || index} className="hover:bg-text-disabled/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                          <div className="flex flex-col">
                            <span className="font-medium">{producto.code || "N/A"}</span>
                            {producto.reference && (
                              <span className="text-xs text-text-secondary">Ref: {producto.reference}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          <div className="flex flex-col">
                            <span className="font-medium">{producto.name || "N/A"}</span>
                            {producto.additional_fields?.brand && (
                              <span className="text-xs text-text-secondary">Marca: {producto.additional_fields.brand}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary max-w-xs">
                          <div className="flex flex-col">
                            <span className="truncate">{producto.description || "Sin descripción"}</span>
                            {producto.additional_fields?.model && (
                              <span className="text-xs text-text-secondary">Modelo: {producto.additional_fields.model}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              producto.type === 'Product' 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-purple-100 text-purple-800"
                            }`}>
                              {producto.type === 'Product' ? 'Producto' : 'Servicio'}
                            </span>
                            {producto.tax_classification && (
                              <span className="text-xs text-text-secondary">
                                {producto.tax_classification}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          <div className="flex flex-col">
                            <span>{producto.account_group?.name || "N/A"}</span>
                            {producto.account_group?.id && (
                              <span className="text-xs text-text-secondary">ID: {producto.account_group.id}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          <div className="flex flex-col">
                            <span>{producto.unit?.name || producto.unit_label || "Unidad"}</span>
                            {producto.unit?.code && (
                              <span className="text-xs text-text-secondary">Código: {producto.unit.code}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          {producto.prices && producto.prices.length > 0 && producto.prices[0].price_list && producto.prices[0].price_list.length > 0 ? (
                            <div className="flex flex-col">
                              <span className="font-medium">
                                ${parseFloat(producto.prices[0].price_list[0].value || 0).toLocaleString()}
                              </span>
                              <span className="text-xs text-text-secondary">
                                {producto.prices[0].currency_code || 'COP'}
                              </span>
                              {producto.prices[0].price_list[0].name && (
                                <span className="text-xs text-text-secondary">
                                  {producto.prices[0].price_list[0].name}
                                </span>
                              )}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          <div className="flex flex-col">
                            <span className={`font-medium ${
                              producto.available_quantity > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {producto.available_quantity || 0}
                            </span>
                            {producto.stock_control && (
                              <span className="text-xs text-text-secondary">Control de stock</span>
                            )}
                            {producto.warehouses && producto.warehouses.length > 0 && (
                              <span className="text-xs text-text-secondary">
                                {producto.warehouses.length} almacén(es)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              producto.active 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {producto.active ? "Activo" : "Inactivo"}
                            </span>
                            {producto.tax_included !== undefined && (
                              <span className="text-xs text-text-secondary">
                                {producto.tax_included ? 'IVA incluido' : 'IVA excluido'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                // Mostrar detalles del producto
                                const details = {
                                  id: producto.id,
                                  code: producto.code,
                                  name: producto.name,
                                  description: producto.description,
                                  type: producto.type,
                                  account_group: producto.account_group?.name,
                                  unit: producto.unit?.name || producto.unit_label,
                                  price: producto.prices?.[0]?.price_list?.[0]?.value,
                                  currency: producto.prices?.[0]?.currency_code,
                                  available_quantity: producto.available_quantity,
                                  stock_control: producto.stock_control,
                                  active: producto.active,
                                  tax_classification: producto.tax_classification,
                                  tax_included: producto.tax_included,
                                  created: producto.metadata?.created,
                                  additional_fields: producto.additional_fields
                                };
                                console.log("Detalles del producto:", details);
                                alert(`Producto: ${producto.name}\nCódigo: ${producto.code}\nPrecio: $${producto.prices?.[0]?.price_list?.[0]?.value?.toLocaleString() || 'N/A'}\nStock: ${producto.available_quantity || 0}`);
                              }}
                              className="text-accent-primary hover:text-accent-hover font-medium text-xs px-2 py-1 rounded hover:bg-accent-primary/10"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => {
                                // Copiar información del producto al portapapeles
                                const productInfo = `Código: ${producto.code}\nNombre: ${producto.name}\nPrecio: $${producto.prices?.[0]?.price_list?.[0]?.value?.toLocaleString() || 'N/A'}\nStock: ${producto.available_quantity || 0}`;
                                navigator.clipboard.writeText(productInfo).then(() => {
                                  alert('Información del producto copiada al portapapeles');
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2 py-1 rounded hover:bg-blue-50"
                            >
                              Copiar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {renderPagination()}
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default Siigo;
