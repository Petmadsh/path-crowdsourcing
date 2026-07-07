export interface CellUpdate { // Interfaccia per rappresentare un aggiornamento di cella, con le coordinate x e y e il nuovo valore (0 o 1)
  x: number;
  y: number;
  newValue: number; // 0 o 1
}
