"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { QrCode, Printer, Plus, Users, Clock, CheckCircle2, AlertCircle, Edit, Trash2, X, Loader2, PlusCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Table {
  id: number;
  table_number: string;
  table_name: string;
  capacity: number;
  status: string;
  is_active: boolean;
  qr_code_url: string;
  active_order_id?: number;
}

export default function TablesPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({ table_number: '', capacity: '4', status: 'AVAILABLE' });
  const [isSaving, setIsSaving] = useState(false);

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [targetTableId, setTargetTableId] = useState<number | ''>('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Global Transfer Modal State
  const [isGlobalTransferModalOpen, setIsGlobalTransferModalOpen] = useState(false);
  const [globalSourceId, setGlobalSourceId] = useState<number | ''>('');
  const [globalTargetId, setGlobalTargetId] = useState<number | ''>('');

  // Split Order State
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [splitTargetId, setSplitTargetId] = useState<number | ''>('');
  const [splitItems, setSplitItems] = useState<{item_id: number, name: string, quantity: number, max: number}[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);

  // Tab state for right sidebar (QR Code vs Order/Cart)
  const [sidebarTab, setSidebarTab] = useState<'qr' | 'order'>('qr');
  
  // Order & Product State
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Calculations
  const subTotal = activeOrder?.subtotal ? Number(activeOrder.subtotal) : 0;
  const taxAmount = subTotal * 0.10; // 10% tax mock
  const total = subTotal + taxAmount;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tables/restauranttable/');
      setTables(response.data);
      setError('');
    } catch (err: any) {
      setError('Məlumatları yükləmək mümkün olmadı.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/menu/product/');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, []);

  const fetchActiveOrder = async (table: Table) => {
    setIsOrderLoading(true);
    try {
      if (table.active_order_id) {
        const res = await api.get(`/orders/order/${table.active_order_id}/`);
        setActiveOrder(res.data);
      } else {
        setActiveOrder(null);
      }
    } catch (e) {
      console.error(e);
      setActiveOrder(null);
    } finally {
      setIsOrderLoading(false);
    }
  };

  const handleAddProductToOrder = async (product: any) => {
    if (!selectedTable) return;
    try {
      let orderId = activeOrder?.id;
      
      if (!orderId) {
        // Create new order
        const orderRes = await api.post('/orders/order/', {
          table: selectedTable.id,
          order_type: 'DINE_IN',
          status: 'NEW'
        });
        orderId = orderRes.data.id;
        
        // Mark table as OCCUPIED
        await api.patch(`/tables/restauranttable/${selectedTable.id}/`, { status: 'OCCUPIED' });
        
        // Update selectedTable locally
        const updatedTable = { ...selectedTable, status: 'OCCUPIED', active_order_id: orderId };
        setSelectedTable(updatedTable as any);
        fetchData();
      }

      await api.post(`/orders/order/${orderId}/add_items/`, {
        items: [{
          product: product.id,
          quantity: 1,
          unit_price: product.price,
          total_price: product.price
        }]
      });

      // Refresh order
      await fetchActiveOrder({ ...selectedTable, active_order_id: orderId } as any);
      setIsAddingProduct(false);
      
    } catch (err) {
      console.error(err);
      alert("Ürün eklenirken bir hata oluştu.");
    }
  };

  const openModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity.toString(),
        status: table.status,
      });
    } else {
      setEditingTable(null);
      setFormData({ table_number: '', capacity: '4', status: 'AVAILABLE' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
  };

  useEffect(() => {
    if (selectedTable) {
      if (selectedTable.status === 'OCCUPIED') {
        setSidebarTab('order');
        fetchActiveOrder(selectedTable);
      } else {
        setSidebarTab('qr');
        setActiveOrder(null);
      }
    }
  }, [selectedTable?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        table_number: formData.table_number,
        capacity: parseInt(formData.capacity),
        status: formData.status,
        is_active: true
      };

      if (editingTable) {
        await api.patch(`/tables/restauranttable/${editingTable.id}/`, payload);
      } else {
        await api.post('/tables/restauranttable/', payload);
      }
      closeModal();
      fetchData();
    } catch (err) {
      alert("Xəta baş verdi. Zəhmət olmasa təkrar yoxlayın.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransferTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !targetTableId) return;

    setIsTransferring(true);
    try {
      await api.post(`/tables/restauranttable/${selectedTable.id}/merge/`, {
        target_table_id: targetTableId
      });
      setIsTransferModalOpen(false);
      setSelectedTable(null);
      setSidebarTab('qr');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Masa daşınarkən xəta baş verdi.");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleGlobalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSourceId || !globalTargetId) return;

    setIsTransferring(true);
    try {
      await api.post(`/tables/restauranttable/${globalSourceId}/merge/`, {
        target_table_id: globalTargetId
      });
      setIsGlobalTransferModalOpen(false);
      setGlobalSourceId('');
      setGlobalTargetId('');
      setSelectedTable(null);
      setSidebarTab('qr');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Masa daşınarkən xəta baş verdi.");
    } finally {
      setIsTransferring(false);
    }
  };

  const openSplitModal = () => {
    if (!activeOrder || !activeOrder.items) return;
    setSplitItems(activeOrder.items.map((i: any) => ({
      item_id: i.id,
      name: i.product_name_snapshot,
      quantity: 0,
      max: Number(i.quantity)
    })));
    setSplitTargetId('');
    setIsSplitModalOpen(true);
  };

  const handleSplitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !splitTargetId) return;

    const itemsToMove = splitItems.filter(i => i.quantity > 0).map(i => ({
      item_id: i.item_id,
      quantity: i.quantity
    }));

    if (itemsToMove.length === 0) {
      alert("Transfer edilecek hiçbir ürün seçmediniz!");
      return;
    }

    setIsSplitting(true);
    try {
      await api.post(`/orders/order/${activeOrder.id}/split_order/`, {
        target_table_id: splitTargetId,
        items: itemsToMove
      });
      setIsSplitModalOpen(false);
      fetchData();
      if (selectedTable) {
        fetchActiveOrder(selectedTable);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Sipariş bölünürken hata oluştu.");
    } finally {
      setIsSplitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu masanı silmək istədiyinizə əminsiniz?')) return;
    try {
      await api.delete(`/tables/restauranttable/${id}/`);
      if (selectedTable?.id === id) setSelectedTable(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Masa silinərkən xəta baş verdi");
    }
  };

  if (isLoading && tables.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Masalar & QR Sistem</h1>
          <p className="text-gray-500 mt-2 font-medium">Restoran masalarınızı idarə edin və QR menyu etiketlərini yaradın.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsGlobalTransferModalOpen(true)}
            className="flex-1 md:flex-none bg-orange-50 hover:bg-orange-100 text-orange-600 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-orange-100"
          >
            Masa Taşı
          </button>
          <button className="flex-1 md:flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-indigo-100">
            <Printer className="w-4 h-4" /> Bütün QR-ları Çap Et
          </button>
          <button onClick={() => openModal()} className="flex-1 md:flex-none bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 transition-all flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Yeni Masa
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tables Grid */}
        <div className="flex-1">
          {tables.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[20px] p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Heç bir masa tapılmadı</h3>
              <p className="text-sm text-gray-500 mb-6">Restoranınıza ilk masanızı əlavə edərək işə başlayın.</p>
              <button onClick={() => openModal()} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                Masa Əlavə Et
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map(table => (
                <div 
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`cursor-pointer bg-white rounded-[20px] p-5 border-2 transition-all duration-300 relative group flex flex-col justify-between min-h-[160px] ${
                    selectedTable?.id === table.id 
                      ? 'border-indigo-600 shadow-md shadow-indigo-600/10 scale-[1.02]' 
                      : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                  }`}
                >
                  {/* Action buttons on hover */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); openModal(table); }} className="p-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
                      <Edit size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(table.id); }} className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Masa {table.table_number}</h3>
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${
                        table.status === 'OCCUPIED' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' :
                        table.status === 'RESERVED' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                        'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      }`}></div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-4">
                      <Users className="w-4 h-4 text-gray-400" /> {table.capacity} Nəfərlik
                    </div>
                  </div>
                  
                  {table.status === 'OCCUPIED' && (
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mt-auto">
                      <div className="flex items-center justify-center text-xs font-bold text-gray-600">
                        <Clock className="w-3 h-3 mr-1" /> Aktiv Sipariş Var
                      </div>
                    </div>
                  )}
                  
                  {table.status === 'AVAILABLE' && (
                    <div className="h-10 mt-auto flex items-center justify-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Boş</span>
                    </div>
                  )}
                  
                  {table.status === 'RESERVED' && (
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 h-10 mt-auto flex flex-col justify-center text-center">
                      <span className="text-xs font-bold text-amber-600">Rezerve Edilib</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: QR Code or Order/Cart */}
        <div className="w-full lg:w-[400px]">
          {selectedTable ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden sticky top-6 animate-in slide-in-from-right-8 fade-in duration-300">
              
              {/* Sidebar Tabs */}
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => setSidebarTab('order')}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${sidebarTab === 'order' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Adisyon (Sipariş)
                </button>
                <button 
                  onClick={() => setSidebarTab('qr')}
                  className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${sidebarTab === 'qr' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  QR Menü
                </button>
              </div>

              {sidebarTab === 'qr' ? (
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">QR Etiketi</h3>
                  <p className="text-xs text-gray-500 font-medium mb-6">Masa {selectedTable.table_number} üçün QR kodu</p>
                  
                  <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center mb-6 shadow-inner relative overflow-hidden group hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                    <div className="w-48 h-48 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-2 mb-4 relative z-10 group-hover:scale-105 transition-transform overflow-hidden">
                       {selectedTable.qr_code_url ? (
                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedTable.qr_code_url)}`} alt="QR Code" className="w-full h-full object-contain mix-blend-multiply opacity-90" />
                       ) : (
                         <QrCode className="w-12 h-12 text-gray-300" />
                       )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-900 font-black text-xl z-10 tracking-tight">
                      <QrCode className="w-6 h-6 text-indigo-600" />
                      NeyMenu
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <a 
                      href={selectedTable.qr_code_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mb-2"
                    >
                      Canlı Menüyü İzle
                    </a>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                      <Printer className="w-5 h-5" /> Çap Et
                    </button>
                    <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 transition-all">
                      PDF Yüklə
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-[600px]">
                  {/* Order Items Area */}
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${activeOrder ? 'bg-emerald-500' : 'bg-gray-400'}`}></span> 
                        {activeOrder ? 'Aktif Sipariş' : 'Sipariş Yok'}
                      </h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsTransferModalOpen(true)}
                          className="text-xs text-orange-600 font-bold px-3 py-1.5 bg-orange-50 rounded-lg flex items-center gap-1 hover:bg-orange-100 transition-colors"
                        >
                          Masa Taşı
                        </button>
                        <button 
                          onClick={openSplitModal}
                          className="text-xs text-blue-600 font-bold px-3 py-1.5 bg-blue-50 rounded-lg flex items-center gap-1 hover:bg-blue-100 transition-colors"
                        >
                          Siparişi Böl
                        </button>
                        <button 
                          onClick={() => {
                            const orderIdParam = activeOrder ? `&order_id=${activeOrder.id}` : '';
                            router.push(`/operations/orders/create?table_id=${selectedTable.id}${orderIdParam}&source=tables`);
                          }}
                          className="text-xs text-indigo-600 font-bold px-3 py-1.5 bg-indigo-50 rounded-lg flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                        >
                          <PlusCircle size={14} /> Ürün Ekle
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {isOrderLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                      ) : !activeOrder || activeOrder.items?.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 font-medium">
                          Masa boş. Sağ üstten yeni sipariş ekleyebilirsiniz.
                        </div>
                      ) : (
                        activeOrder.items?.map((item: any) => (
                          <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm text-gray-800">{item.product_name_snapshot}</p>
                              <p className="text-xs font-bold text-gray-400">₼{Number(item.snapshot_selling_price).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-indigo-600">{Number(item.quantity)} Ad.</span>
                              <span className="text-sm font-black text-gray-800">₼{Number(item.total_price).toFixed(2)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Checkout Area */}
                  <div className="p-6 bg-white border-t border-gray-100">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm font-bold text-gray-500">
                        <span>Ara Toplam</span><span>₼{subTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-gray-500">
                        <span>Vergi (10%)</span><span>₼{(subTotal * 0.10).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-100">
                        <span>Toplam</span><span className="text-indigo-600">₼{total.toFixed(2)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (activeOrder) {
                          router.push(`/operations/cashier?order_id=${activeOrder.id}`);
                        } else {
                          alert("Ödeme alınacak aktif sipariş yok.");
                        }
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Ödeme Al
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[24px] h-[400px] flex flex-col items-center justify-center p-8 text-center sticky top-6 hidden lg:flex">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-300 mb-4">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-700 mb-1">Masa Seçin</h3>
              <p className="text-sm text-gray-500 leading-relaxed">QR kodunu görmək və ya çap etmək üçün sol tərəfdən bir masa seçin.</p>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">{editingTable ? 'Masaya Düzəliş Et' : 'Yeni Masa'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Masa Nömrəsi / Adı</label>
                <input 
                  type="text" 
                  required
                  value={formData.table_number}
                  onChange={e => setFormData({...formData, table_number: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Məs: 15, B-12, Balkon-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Tutum (Nəfər)</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="AVAILABLE">Boş</option>
                    <option value="OCCUPIED">Dolu</option>
                    <option value="RESERVED">Rezerve</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Ləğv Et
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex justify-center items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Masa Taşı / Birleştir</h2>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleTransferTable} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Hedef Masayı Seçin</label>
                <select 
                  required
                  value={targetTableId}
                  onChange={e => setTargetTableId(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="" disabled>-- Masa Seçin --</option>
                  {tables.filter(t => t.id !== selectedTable.id).map(t => (
                    <option key={t.id} value={t.id}>
                      Masa {t.table_number} ({t.status === 'AVAILABLE' ? 'Boş' : t.status === 'OCCUPIED' ? 'Dolu' : 'Rezerve'})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Not: Eğer dolu bir masa seçerseniz, adisyonlar birleştirilir. Boş bir masa seçerseniz adisyon o masaya taşınır.
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-gray-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Ləğv Et
                </button>
                <button 
                  type="submit" 
                  disabled={isTransferring}
                  className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all flex justify-center items-center gap-2"
                >
                  {isTransferring && <Loader2 size={16} className="animate-spin" />}
                  Taşı / Birleştir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Split Order Modal */}
      {isSplitModalOpen && selectedTable && activeOrder && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Siparişi Böl / Transfer Et</h2>
              <button onClick={() => setIsSplitModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSplitOrder} className="flex flex-col overflow-hidden h-full">
              <div className="p-6 overflow-y-auto">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Hedef Masa (Ürünlerin Gideceği Masa)</label>
                  <select 
                    required
                    value={splitTargetId}
                    onChange={e => setSplitTargetId(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="" disabled>-- Hedef Masa Seçin --</option>
                    {tables.filter(t => t.id !== selectedTable.id).map(t => (
                      <option key={t.id} value={t.id}>
                        Masa {t.table_number} ({t.status === 'AVAILABLE' ? 'Boş' : t.status === 'OCCUPIED' ? 'Dolu' : 'Rezerve'})
                      </option>
                    ))}
                  </select>
                </div>

                <label className="block text-sm font-bold text-gray-700 mb-2">Taşınacak Ürünleri Seçin</label>
                <div className="space-y-2 border border-gray-100 rounded-xl p-2 bg-gray-50/50">
                  {splitItems.map((item, idx) => (
                    <div key={item.item_id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <div className="font-bold text-sm text-gray-800">{item.name} <span className="text-xs text-gray-400 font-medium">(Mevcut: {item.max})</span></div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => setSplitItems(prev => {
                            const newArr = [...prev];
                            if (newArr[idx].quantity > 0) newArr[idx].quantity -= 1;
                            return newArr;
                          })}
                          className="w-7 h-7 flex items-center justify-center bg-rose-50 text-rose-600 rounded-md hover:bg-rose-100 font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-black text-sm text-gray-900">{item.quantity}</span>
                        <button 
                          type="button"
                          onClick={() => setSplitItems(prev => {
                            const newArr = [...prev];
                            if (newArr[idx].quantity < newArr[idx].max) newArr[idx].quantity += 1;
                            return newArr;
                          })}
                          className="w-7 h-7 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                  {splitItems.length === 0 && (
                    <p className="text-center text-sm text-gray-500 py-4">Bu siparişte ürün bulunmuyor.</p>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 mt-auto">
                <button 
                  type="button" 
                  onClick={() => setIsSplitModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Ləğv Et
                </button>
                <button 
                  type="submit" 
                  disabled={isSplitting || splitItems.every(i => i.quantity === 0)}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSplitting && <Loader2 size={16} className="animate-spin" />}
                  Ayır ve Taşı
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Global Transfer Modal */}
      {isGlobalTransferModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Masa Taşı / Birleştir</h2>
              <button onClick={() => setIsGlobalTransferModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleGlobalTransfer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Kaynak Masayı Seçin (Hangi Masa Taşınacak?)</label>
                <select 
                  required
                  value={globalSourceId}
                  onChange={e => setGlobalSourceId(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="" disabled>-- Kaynak Masa --</option>
                  {tables.filter(t => t.status === 'OCCUPIED').map(t => (
                    <option key={t.id} value={t.id}>
                      Masa {t.table_number} (Dolu)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Hedef Masayı Seçin (Nereye Taşınacak?)</label>
                <select 
                  required
                  value={globalTargetId}
                  onChange={e => setGlobalTargetId(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="" disabled>-- Hedef Masa --</option>
                  {tables.filter(t => t.id !== globalSourceId).map(t => (
                    <option key={t.id} value={t.id}>
                      Masa {t.table_number} ({t.status === 'AVAILABLE' ? 'Boş' : t.status === 'OCCUPIED' ? 'Dolu' : 'Rezerve'})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  * Seçtiğiniz masa BOŞ ise sipariş oraya taşınır. <br/>
                  * Seçtiğiniz masa DOLU ise siparişler birleştirilir.
                </p>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsGlobalTransferModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                  İptal
                </button>
                <button type="submit" disabled={isTransferring || !globalSourceId || !globalTargetId} className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20 disabled:opacity-70 flex items-center justify-center">
                  {isTransferring ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Taşı / Birleştir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-black text-gray-900">Masaya Ürün Ekle</h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Masa {selectedTable?.table_number} için adisyona ürün seçin.</p>
              </div>
              <button onClick={() => setIsAddingProduct(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Ürün Ara..." 
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(product => (
                  <button 
                    key={product.id}
                    onClick={() => handleAddProductToOrder(product)}
                    className="flex flex-col text-left bg-white p-3 rounded-xl border border-gray-100 hover:border-indigo-500 hover:shadow-md transition-all group"
                  >
                    <span className="font-bold text-gray-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{product.name}</span>
                    <span className="font-black text-indigo-600 mt-auto">₼{Number(product.price).toFixed(2)}</span>
                  </button>
                ))}
              </div>
              {products.length === 0 && (
                <div className="text-center py-10 text-gray-400">Ürün bulunamadı.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
