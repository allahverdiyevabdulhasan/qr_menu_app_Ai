import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TableStatus = 'empty' | 'full' | 'payment_locked';

export interface Table {
  id: string;
  number: string;
  status: TableStatus;
  currentOrderTotal: number;
}

interface TablesState {
  tables: Table[];
  loading: boolean;
  error: string | null;
}

const initialState: TablesState = {
  tables: [
    { id: '1', number: 'Masa 1', status: 'full', currentOrderTotal: 145.5 },
    { id: '2', number: 'Masa 2', status: 'payment_locked', currentOrderTotal: 320.0 },
    { id: '3', number: 'Masa 3', status: 'empty', currentOrderTotal: 0 },
    { id: '4', number: 'Masa 4', status: 'full', currentOrderTotal: 85.0 },
    { id: '5', number: 'Masa 5', status: 'empty', currentOrderTotal: 0 },
    { id: '6', number: 'Teras 1', status: 'payment_locked', currentOrderTotal: 540.0 },
  ],
  loading: false,
  error: null,
};

const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {
    setTables: (state, action: PayloadAction<Table[]>) => {
      state.tables = action.payload;
    },
    updateTableStatus: (state, action: PayloadAction<{ id: string; status: TableStatus }>) => {
      const table = state.tables.find((t) => t.id === action.payload.id);
      if (table) {
        table.status = action.payload.status;
      }
    },
    mergeTables: (state, action: PayloadAction<{ sourceId: string; targetId: string }>) => {
      const source = state.tables.find(t => t.id === action.payload.sourceId);
      const target = state.tables.find(t => t.id === action.payload.targetId);
      
      if (source && target) {
        target.currentOrderTotal += source.currentOrderTotal;
        source.status = 'empty';
        source.currentOrderTotal = 0;
        target.status = 'full';
      }
    }
  },
});

export const { setTables, updateTableStatus, mergeTables } = tablesSlice.actions;
export default tablesSlice.reducer;
