export interface DashboardMetric {
  title: string;
  value: string | number;
  change: string;
}

export interface DashboardData {
  todayRevenuePaise: number;
  vehiclesInWorkshopCount: number;
  activeJobCardsCount: number;
  lowStockItemsCount: number;
}
