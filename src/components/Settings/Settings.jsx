import { useState } from 'react';
import './Settings.css';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('categories');
  
  // Categorías predefinidas
  const defaultCategories = {
    ingreso: ['Salario', 'Freelance', 'Inversiones', 'Ventas', 'Otros'],
    egreso: ['Alimentación', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Otros']
  };

  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState({ type: 'egreso', name: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  // Agregar nueva categoría
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.name.trim() && !categories[newCategory.type].includes(newCategory.name.trim())) {
      setCategories(prev => ({
        ...prev,
        [newCategory.type]: [...prev[newCategory.type], newCategory.name.trim()]
      }));
      setNewCategory({ type: 'egreso', name: '' });
    }
  };

  // Eliminar categoría
  const handleDeleteCategory = (type, categoryName) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${categoryName}"?`)) {
      setCategories(prev => ({
        ...prev,
        [type]: prev[type].filter(cat => cat !== categoryName)
      }));
    }
  };

  // Editar categoría
  const handleEditCategory = (type, oldName, newName) => {
    if (newName.trim() && !categories[type].includes(newName.trim())) {
      setCategories(prev => ({
        ...prev,
        [type]: prev[type].map(cat => cat === oldName ? newName.trim() : cat)
      }));
      setEditingCategory(null);
    }
  };

  // Restaurar categorías predeterminadas
  const handleResetCategories = () => {
    if (window.confirm('¿Estás seguro de restaurar las categorías predeterminadas? Se perderán las personalizaciones.')) {
      setCategories(defaultCategories);
    }
  };

  return (
    <div className="settings-container">
      {/* Tabs de navegación */}
      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <span className="tab-icon">🏷️</span>
          <span>Categorías</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'types' ? 'active' : ''}`}
          onClick={() => setActiveTab('types')}
        >
          <span className="tab-icon">💼</span>
          <span>Tipos de Transacción</span>
        </button>
      </div>

      {/* Contenido de Categorías */}
      {activeTab === 'categories' && (
        <div className="settings-content">
          <div className="section-header">
            <div>
              <h2>Gestión de Categorías</h2>
              <p className="section-subtitle">Administra las categorías de tus transacciones</p>
            </div>
            <button onClick={handleResetCategories} className="btn btn-outline-secondary">
              🔄 Restaurar Predeterminadas
            </button>
          </div>

          {/* Formulario para agregar categoría */}
          <div className="add-category-form">
            <h3>Agregar Nueva Categoría</h3>
            <form onSubmit={handleAddCategory}>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo</label>
                  <select
                    value={newCategory.type}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
                <div className="form-group flex-grow">
                  <label>Nombre de la Categoría</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Suscripciones"
                  />
                </div>
                <div className="form-group">
                  <label style={{ opacity: 0 }}>.</label>
                  <button type="submit" className="btn btn-primary">
                    + Agregar
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Lista de categorías */}
          <div className="categories-grid">
            {/* Categorías de Ingreso */}
            <div className="category-section">
              <div className="category-section-header ingreso">
                <h3>📈 Categorías de Ingreso</h3>
                <span className="category-count">{categories.ingreso.length}</span>
              </div>
              <div className="category-list">
                {categories.ingreso.map((category, index) => (
                  <div key={index} className="category-item ingreso">
                    {editingCategory?.type === 'ingreso' && editingCategory?.name === category ? (
                      <input
                        type="text"
                        defaultValue={category}
                        autoFocus
                        onBlur={(e) => handleEditCategory('ingreso', category, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditCategory('ingreso', category, e.target.value);
                          } else if (e.key === 'Escape') {
                            setEditingCategory(null);
                          }
                        }}
                      />
                    ) : (
                      <>
                        <span className="category-name">{category}</span>
                        <div className="category-actions">
                          <button
                            onClick={() => setEditingCategory({ type: 'ingreso', name: category })}
                            className="action-btn edit"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCategory('ingreso', category)}
                            className="action-btn delete"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {categories.ingreso.length === 0 && (
                  <div className="empty-categories">
                    <p>No hay categorías de ingreso</p>
                  </div>
                )}
              </div>
            </div>

            {/* Categorías de Egreso */}
            <div className="category-section">
              <div className="category-section-header egreso">
                <h3>📉 Categorías de Egreso</h3>
                <span className="category-count">{categories.egreso.length}</span>
              </div>
              <div className="category-list">
                {categories.egreso.map((category, index) => (
                  <div key={index} className="category-item egreso">
                    {editingCategory?.type === 'egreso' && editingCategory?.name === category ? (
                      <input
                        type="text"
                        defaultValue={category}
                        autoFocus
                        onBlur={(e) => handleEditCategory('egreso', category, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditCategory('egreso', category, e.target.value);
                          } else if (e.key === 'Escape') {
                            setEditingCategory(null);
                          }
                        }}
                      />
                    ) : (
                      <>
                        <span className="category-name">{category}</span>
                        <div className="category-actions">
                          <button
                            onClick={() => setEditingCategory({ type: 'egreso', name: category })}
                            className="action-btn edit"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCategory('egreso', category)}
                            className="action-btn delete"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {categories.egreso.length === 0 && (
                  <div className="empty-categories">
                    <p>No hay categorías de egreso</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido de Tipos de Transacción */}
      {activeTab === 'types' && (
        <div className="settings-content">
          <div className="section-header">
            <div>
              <h2>Tipos de Transacción</h2>
              <p className="section-subtitle">Gestiona los tipos de transacciones disponibles</p>
            </div>
          </div>

          <div className="info-box">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h4>Tipos de Transacción Predeterminados</h4>
              <p>La aplicación utiliza dos tipos principales de transacciones que no se pueden modificar:</p>
            </div>
          </div>

          <div className="transaction-types-grid">
            <div className="type-card ingreso">
              <div className="type-icon">📈</div>
              <h3>Ingreso</h3>
              <p>Representa el dinero que entra a tu cuenta</p>
              <ul className="type-examples">
                <li>Salarios</li>
                <li>Ventas</li>
                <li>Inversiones</li>
                <li>Freelance</li>
              </ul>
              <div className="type-badge success">Tipo Principal</div>
            </div>

            <div className="type-card egreso">
              <div className="type-icon">📉</div>
              <h3>Egreso</h3>
              <p>Representa el dinero que sale de tu cuenta</p>
              <ul className="type-examples">
                <li>Compras</li>
                <li>Servicios</li>
                <li>Alimentación</li>
                <li>Transporte</li>
              </ul>
              <div className="type-badge danger">Tipo Principal</div>
            </div>
          </div>

          <div className="future-feature">
            <div className="feature-icon">🚀</div>
            <h3>Próximamente</h3>
            <p>Podrás agregar tipos personalizados como Transferencias, Préstamos, Inversiones, etc.</p>
          </div>
        </div>
      )}

    </div>
  );
};
