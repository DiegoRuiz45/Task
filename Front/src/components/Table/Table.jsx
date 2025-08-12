import React, { useMemo } from "react";
import { Plus } from "lucide-react";

/**
 * DataTable - Componente de tabla reutilizable
 *
 * @param {{
 *  title?: React.ReactNode,
 *  data: any[],
 *  columns: Array<{
 *    key: string,                // clave del objeto (o virtual)
 *    header: React.ReactNode,    // encabezado visible
 *    accessor?: (row:any)=>any,  // cómo obtener el valor (si no usas key directo)
 *    cell?: (value:any, row:any)=>React.ReactNode, // render de celda
 *    className?: string
 *  }>,
 *  search: string,
 *  onSearchChange: (v:string)=>void,
 *  searchBy?: Array<string> | ((row:any, query:string)=>boolean), // claves o función
 *  emptyText?: string,
 *  noResultsText?: string,
 *  onCreate?: ()=>void,
 *  createLabel?: string,
 *  actions?: (row:any)=>React.ReactNode, // botones/acciones por fila (columna derecha)
 *  className?: string
 * }} props
 */
export default function DataTable({
  title,
  data = [],
  columns = [],
  search,
  onSearchChange,
  searchBy, // si no viene, intenta con todas las columnas que tengan key
  emptyText = "No hay registros.",
  noResultsText = "Sin resultados para el filtro.",
  onCreate,
  createLabel = "Nuevo",
  actions,
  className = "",
}) {
  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return data;

    // función de comparación por defecto
    const defaultMatch = (row) => {
      // si pasan claves específicas (searchBy = ['name','description'])
      if (Array.isArray(searchBy) && searchBy.length) {
        return searchBy.some((k) =>
          String(row?.[k] ?? "")
            .toLowerCase()
            .includes(q)
        );
      }
      // si pasan función personalizada
      if (typeof searchBy === "function") {
        return !!searchBy(row, q);
      }
      // por defecto: intenta con todas las columnas definidas con key
      return columns.some((col) => {
        const val = (col.accessor ? col.accessor(row) : row?.[col.key]) ?? "";
        return String(val).toLowerCase().includes(q);
      });
    };

    return data.filter(defaultMatch);
  }, [data, search, searchBy, columns]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header: título + búsqueda + botón crear */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-left">
          {title && (
            <h2 className="text-xl font-semibold leading-tight">{title}</h2>
          )}
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input
            type="text"
            placeholder="Buscar…"
            className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring focus:ring-indigo-500 sm:w-64"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {onCreate && (
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
            >
              <Plus size={18} />
              {createLabel}
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/60">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-300"
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-6 text-center text-sm text-gray-400"
                >
                  {data.length === 0 ? emptyText : noResultsText}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id ?? JSON.stringify(row)}
                  className="hover:bg-gray-700/40"
                >
                  {columns.map((col) => {
                    const value = col.accessor
                      ? col.accessor(row)
                      : row?.[col.key];
                    const content = col.cell
                      ? col.cell(value, row)
                      : value ?? "—";
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm ${
                          col.className ?? "text-gray-300"
                        }`}
                      >
                        {content}
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
