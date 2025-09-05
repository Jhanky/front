import React, { useState } from 'react';

const ProductTooltip = ({ product, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, position: 'right' });

  const getProductTypeLabel = (type) => {
    switch (type) {
      case 'panel':
        return 'Panel Solar';
      case 'inverter':
        return 'Inversor';
      case 'battery':
        return 'Batería';
      default:
        return 'Producto';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-CO').format(value);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={(e) => {
        setIsVisible(true);
        // Calcular posición del tooltip
        const rect = e.currentTarget.getBoundingClientRect();
        const tooltipWidth = 256; // w-64 = 256px
        const tooltipHeight = 120; // Altura aproximada del tooltip
        const margin = 10; // Margen mínimo
        
        // Verificar espacio disponible en cada dirección
        const spaceRight = window.innerWidth - rect.right - margin;
        const spaceLeft = rect.left - margin;
        const spaceBottom = window.innerHeight - rect.bottom - margin;
        const spaceTop = rect.top - margin;
        
        // Determinar la mejor posición
        let position = 'right';
        let x = rect.right + margin;
        let y = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        
        if (spaceRight < tooltipWidth) {
          if (spaceLeft >= tooltipWidth) {
            position = 'left';
            x = rect.left - tooltipWidth - margin;
          } else if (spaceBottom >= tooltipHeight) {
            position = 'bottom';
            x = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            y = rect.bottom + margin;
          } else if (spaceTop >= tooltipHeight) {
            position = 'top';
            x = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            y = rect.top - tooltipHeight - margin;
          }
        }
        
        // Asegurar que el tooltip no se salga de la pantalla
        x = Math.max(margin, Math.min(x, window.innerWidth - tooltipWidth - margin));
        y = Math.max(margin, Math.min(y, window.innerHeight - tooltipHeight - margin));
        
        // Guardar posición para el tooltip
        setTooltipPosition({ x, y, position });
      }}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div 
          className="fixed z-50 w-64 bg-primary-card border border-text-disabled/30 rounded-lg shadow-lg p-3 max-w-xs"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          {/* Flecha del tooltip */}
          <div 
            className="absolute w-0 h-0"
            style={{
              left: tooltipPosition.position === 'left' ? '100%' : tooltipPosition.position === 'right' ? '-8px' : '50%',
              top: tooltipPosition.position === 'top' ? '100%' : tooltipPosition.position === 'bottom' ? '-8px' : '50%',
              transform: tooltipPosition.position === 'left' ? 'translateY(-50%)' : 
                         tooltipPosition.position === 'right' ? 'translateY(-50%)' :
                         tooltipPosition.position === 'top' ? 'translateX(-50%)' :
                         'translateX(-50%)',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: tooltipPosition.position === 'bottom' ? '8px solid rgb(17 24 39)' : '8px solid transparent',
              borderBottom: tooltipPosition.position === 'top' ? '8px solid rgb(17 24 39)' : '8px solid transparent',
            }}
          ></div>
          
          <div className="space-y-2">
            {/* Header */}
            <div className="pb-2">
              <h4 className="font-semibold text-text-primary text-sm">
                {getProductTypeLabel(product.product_type)}
              </h4>
              <p className="text-accent-primary font-medium text-xs">
                {product.product_brand} - {product.product_model}
              </p>
            </div>

            {/* Especificaciones técnicas */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Potencia:</span>
                <span className="text-text-primary font-medium">{product.product_power}</span>
              </div>
              
              {product.product?.type && (
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Tipo:</span>
                  <span className="text-text-primary font-medium">{product.product.type}</span>
                </div>
              )}
              
              {product.product?.system_type && (
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Sistema:</span>
                  <span className="text-text-primary font-medium">{product.product.system_type}</span>
                </div>
              )}
              
              {product.product?.grid_type && (
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Red:</span>
                  <span className="text-text-primary font-medium">{product.product.grid_type}</span>
                </div>
              )}
              
              {product.product?.capacity && (
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">Capacidad:</span>
                  <span className="text-text-primary font-medium">{product.product.capacity} Ah</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTooltip;
