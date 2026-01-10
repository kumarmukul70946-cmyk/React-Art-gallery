
import { useState, useEffect, useRef } from 'react'
import { DataTable, type DataTablePageEvent, type DataTableSelectionMultipleChangeEvent, type DataTableSortEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';

import './App.css'
import { type Artwork, type ApiResponse } from './types';

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(12);
  const [first, setFirst] = useState(0);

  // Sorting State
  const [sortField, setSortField] = useState<string>('curr'); // Default to none or specific
  const [sortOrder, setSortOrder] = useState<0 | 1 | -1>(0);

  // Persistent Selection State
  const [selectionLimit, setSelectionLimit] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set());
  const [customRowCount, setCustomRowCount] = useState<number | null>(null);

  const op = useRef<OverlayPanel>(null);

  useEffect(() => {
    fetchData(page, rows, sortField, sortOrder);
  }, [page, rows, sortField, sortOrder]);

  const fetchData = async (p: number, r: number, sField: string, sOrder: 0 | 1 | -1) => {
    setLoading(true);
    try {
      let url = `https://api.artic.edu/api/v1/artworks?page=${p}&limit=${r}`;
      if (sField && sOrder !== 0) {
        const prefix = sOrder === -1 ? '-' : '';
        url += `&sort=${prefix}${sField}`;
      }

      const response = await fetch(url);
      const data: ApiResponse = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onPageChange = (event: DataTablePageEvent) => {
    setFirst(event.first);
    setRows(event.rows);
    const newPage = (event.first / event.rows) + 1;
    setPage(newPage);
  };

  const onSort = (event: DataTableSortEvent) => {
    setSortField(event.sortField);
    setSortOrder(event.sortOrder ?? 0);
  };

  // Selection Logic
  const isRowSelected = (row: Artwork, index: number) => {
    if (!row || !row.id) return false; // Safety for skeletons
    const globalIndex = (page - 1) * rows + index;
    if (globalIndex < selectionLimit) {
      return !deselectedIds.has(row.id);
    } else {
      return selectedIds.has(row.id);
    }
  };

  const selectedArtworks = artworks.filter((row, i) => isRowSelected(row, i));

  const onSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Artwork[]>) => {
    const newSelected: Artwork[] = e.value;
    const newSelectedIdsSet = new Set(newSelected.map(r => r.id));

    artworks.forEach((row, i) => {
      if (!row.id) return; // Skip skeletons

      const currentlySelected = isRowSelected(row, i);
      const inNewSelection = newSelectedIdsSet.has(row.id);
      const globalIndex = (page - 1) * rows + i;

      if (currentlySelected && !inNewSelection) { // Deselected
        if (globalIndex < selectionLimit) {
          setDeselectedIds(prev => { const n = new Set(prev); n.add(row.id); return n; });
        } else {
          setSelectedIds(prev => { const n = new Set(prev); n.delete(row.id); return n; });
        }
      } else if (!currentlySelected && inNewSelection) { // Selected
        if (globalIndex < selectionLimit) {
          setDeselectedIds(prev => { const n = new Set(prev); n.delete(row.id); return n; });
        } else {
          setSelectedIds(prev => { const n = new Set(prev); n.add(row.id); return n; });
        }
      }
    });
  };

  const submitCustomSelection = () => {
    if (customRowCount !== null && customRowCount >= 0) {
      setSelectionLimit(customRowCount);
      setSelectedIds(new Set());
      setDeselectedIds(new Set());
      op.current?.hide();
      setCustomRowCount(null);
    }
  };

  const rowSelectionHeader = (
    <div className="flex align-items-center" style={{ gap: '10px' }}>
      <Button type="button" icon="pi pi-chevron-down" className="custom-select-btn" label="Select Custom Rows" onClick={(e) => op.current?.toggle(e)} />
      <OverlayPanel ref={op}>
        <div className="flex flex-column gap-3 p-3" style={{ width: '300px' }}>
          <h3>Select Rows</h3>
          <div className="p-inputgroup">
            <InputNumber placeholder="Number of rows..." value={customRowCount} onValueChange={(e) => setCustomRowCount(e.value ?? null)} />
            <Button label="Submit" onClick={submitCustomSelection} />
          </div>
        </div>
      </OverlayPanel>
    </div>
  );

  // Skeleton / Body Templates
  const bodyTemplate = (field: keyof Artwork) => {
    return (rowData: Artwork) => {
      if (loading) return <Skeleton />;
      return rowData[field];
    }
  }

  // Use dummy data for skeleton view
  const tableValue = loading ? Array.from({ length: rows }).map((_, i) => ({ id: i } as Partial<Artwork>)) : artworks;

  return (
    <div className="main-layout">
      <div className="glass-container">
        <div className="flex justify-content-between align-items-end mb-5">
          <div>
            <h1 className="main-title">Art Institute of Chicago</h1>
            <p className="subtitle">Discover Artwork Collection</p>
          </div>
          {rowSelectionHeader}
        </div>

        <DataTable
          value={tableValue}
          lazy
          dataKey="id"
          paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={onPageChange}
          // Remove built-in loading to show skeletons instead
          // loading={loading} 
          selection={loading ? [] : selectedArtworks}
          onSelectionChange={onSelectionChange}
          selectionMode="checkbox"

          sortField={sortField}
          sortOrder={sortOrder}
          onSort={onSort}

          tableStyle={{ minWidth: '50rem' }}
          rowsPerPageOptions={[12, 24, 48]}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          <Column field="title" header="TITLE" sortable body={bodyTemplate('title')}></Column>
          <Column field="place_of_origin" header="PLACE OF ORIGIN" sortable body={bodyTemplate('place_of_origin')}></Column>
          <Column field="artist_display" header="ARTIST" sortable body={bodyTemplate('artist_display')}></Column>
          <Column field="inscriptions" header="INSCRIPTIONS" sortable body={bodyTemplate('inscriptions')}></Column>
          <Column field="date_start" header="START DATE" sortable body={bodyTemplate('date_start')}></Column>
          <Column field="date_end" header="END DATE" sortable body={bodyTemplate('date_end')}></Column>
        </DataTable>
      </div>
    </div>
  )
}

export default App
