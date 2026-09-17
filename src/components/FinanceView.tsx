import React, { useState } from 'react';
import {
  ArrowLeft,
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Trash2,
  Calendar,
  DollarSign,
  Coins,
  FileText,
  Printer
} from 'lucide-react';
import { FinanceRecord } from '../types';
import { formatCurrency, formatDateVi, getTodayDateString } from '../utils/storage';

interface FinanceViewProps {
  financeList: FinanceRecord[];
  onAddFinance: (record: Omit<FinanceRecord, 'id'>) => void;
  onDeleteFinance: (id: string) => void;
  onBackToHome: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  financeList,
  onAddFinance,
  onDeleteFinance,
  onBackToHome,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'thu' | 'chi'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [type, setType] = useState<'thu' | 'chi'>('chi');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [category, setCategory] = useState('Vật tư lớp');
  const [payerOrReceiver, setPayerOrReceiver] = useState('');
  const [notes, setNotes] = useState('');

  // Calculations
  const totalIncome = financeList
    .filter((f) => f.type === 'thu')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = financeList
    .filter((f) => f.type === 'chi')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentBalance = totalIncome - totalExpense;

  // Filtered list
  const filteredList = financeList.filter((f) => {
    if (activeTab !== 'all' && f.type !== activeTab) return false;
    const match =
      f.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      f.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (f.payerOrReceiver?.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false);
    return match;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (!title.trim()) {
      showToast('Vui lòng nhập nội dung thu/chi!', 'error');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      showToast('Số tiền phải lớn hơn 0đ!', 'error');
      return;
    }

    onAddFinance({
      type,
      title: title.trim(),
      amount: numAmount,
      date,
      category,
      payerOrReceiver: payerOrReceiver.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    // Reset
    setTitle('');
    setAmount('');
    setNotes('');
    setPayerOrReceiver('');
    setShowAddModal(false);
    showToast(
      `Đã thêm khoản ${type === 'thu' ? 'thu' : 'chi'}: ${formatCurrency(numAmount)}`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all text-slate-600"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900">Quản lý quỹ & tài chính lớp 9A2</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi minh bạch các khoản thu, chi quỹ hội phụ huynh và phong trào lớp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-all"
            title="In báo cáo thu chi"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">In sổ quỹ</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khoản thu / chi</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (Tổng thu, Tổng chi, Số dư) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tổng thu */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng thu</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-emerald-600">
            {formatCurrency(totalIncome)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {financeList.filter((f) => f.type === 'thu').length} khoản thu đã ghi nhận
          </p>
        </div>

        {/* Tổng chi */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng chi</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-rose-600">
            {formatCurrency(totalExpense)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {financeList.filter((f) => f.type === 'chi').length} khoản chi phục vụ lớp
          </p>
        </div>

        {/* Số dư hiện tại */}
        <div className="bg-gradient-to-br from-indigo-700 to-blue-700 text-white p-5 rounded-3xl shadow-md shadow-indigo-600/15 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Số dư quỹ lớp</span>
            <div className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-white">
            {formatCurrency(currentBalance)}
          </p>
          <p className="mt-1 text-xs text-indigo-200/90">
            Thủ quỹ: Phan Thùy Trang (Lớp 9A2)
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({financeList.length})
          </button>
          <button
            onClick={() => setActiveTab('thu')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'thu'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            Khoản thu ({financeList.filter((f) => f.type === 'thu').length})
          </button>
          <button
            onClick={() => setActiveTab('chi')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'chi'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Khoản chi ({financeList.filter((f) => f.type === 'chi').length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, danh mục hoặc người giao dịch..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Transactions Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Loại</th>
                <th className="py-3.5 px-4">Ngày</th>
                <th className="py-3.5 px-4">Nội dung thu / chi</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4">Người giao dịch</th>
                <th className="py-3.5 px-4 text-right">Số tiền</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    {item.type === 'thu' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>Khoản thu</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Khoản chi</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {formatDateVi(item.date)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    <div>{item.title}</div>
                    {item.notes && (
                      <span className="text-xs text-slate-400 font-normal block mt-0.5">
                        Ghi chú: {item.notes}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {item.payerOrReceiver || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                    <span
                      className={
                        item.type === 'thu' ? 'text-emerald-600 text-base' : 'text-rose-600 text-base'
                      }
                    >
                      {item.type === 'thu' ? '+' : '-'} {formatCurrency(item.amount)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm(`Xác nhận xóa giao dịch "${item.title}"?`)) {
                          onDeleteFinance(item.id);
                          showToast('Đã xóa giao dịch thành công!', 'info');
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Xóa khoản này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chưa có khoản thu/chi nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Thêm khoản giao dịch mới
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Ghi chép thu chi quỹ lớp 9A2 năm học 2026–2027
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Loại giao dịch
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('thu');
                      setCategory('Quỹ lớp');
                    }}
                    className={`py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                      type === 'thu'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Khoản Thu (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('chi');
                      setCategory('Vật tư lớp');
                    }}
                    className={`py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                      type === 'chi'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Khoản Chi (-)</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nội dung thu / chi *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Mua bình nước uống, Photo đề cương ôn tập..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Số tiền (VNĐ) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emerald-600 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ngày thực hiện
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category & Payer/Receiver */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Danh mục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="Quỹ lớp">Quỹ lớp đóng góp</option>
                    <option value="Vật tư lớp">Vật tư / Vệ sinh lớp</option>
                    <option value="Học tập">Học tập / Photo đề</option>
                    <option value="Nước uống">Nước uống học sinh</option>
                    <option value="Khen thưởng">Khen thưởng phong trào</option>
                    <option value="Hoạt động ngoại khóa">Hoạt động ngoại khóa</option>
                    <option value="Khác">Khoản khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Người nộp / nhận tiền
                  </label>
                  <input
                    type="text"
                    value={payerOrReceiver}
                    onChange={(e) => setPayerOrReceiver(e.target.value)}
                    placeholder="Ví dụ: Ban phụ huynh, Cửa hàng photo..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ghi chú bổ sung
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Có hóa đơn đỏ / chứng từ..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/25 transition-all active:scale-98"
                >
                  Lưu giao dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
