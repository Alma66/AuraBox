export interface FinancialMovement {
  id: string;
  date: string;
  type: 'ingreso' | 'egreso';
  category: 'suscripciones' | 'proveedores' | 'impuestos' | 'sueldos' | 'packaging' | 'productos' | 'utilities' | 'marketing' | 'reembolsos' | 'patrocinios' | 'juicios' | 'permisos' | 'otros';
  description: string;
  amount: number;
  status: 'pendiente' | 'confirmado' | 'pagado' | 'procesado';
}

export interface MonthlyTotal {
  ingresos: number;
  egresos: number;
  balance: number;
}

export interface FinancialData {
  monthlyTotals: Record<string, MonthlyTotal>;
  movements: FinancialMovement[];
}

export interface Invoice {
  id: string;
  date: string;
  clientId: string;
  amount: number;
  status: 'pendiente' | 'pagada' | 'vencida';
  pdfUrl?: string; 
}

export interface TeamUser  {
  id: string;
  name: string;
  email: string;
  role: 'administrador_del_club' | 'gestor_de_suscripciones' | 'coordinador_de_entregas' | 'delivery_rider' | 'encargado_de_marketing_y_contenido' | 'moderador_de_reseñas' | 'analista_de_datos' | 'administrador_financiero' | 'planificador_de_inventario' | 'coordinador_de_eventos_y_comunidad' | 'encargado_de_atencion_post_venta' | 'administrador_de_seguridad_y_accesos';
  status: 'activo' | 'inactivo';
  assignedDate: string;
}

export interface GeneralSetting {
  key: string;
  value: string | number | boolean | string[]; 
  category: 'finances' | 'team' | 'notifications';
}