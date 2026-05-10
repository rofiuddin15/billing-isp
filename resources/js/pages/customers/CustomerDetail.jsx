import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    User, 
    MapPin, 
    Phone, 
    Mail, 
    Package, 
    Calendar, 
    ArrowLeft, 
    Edit, 
    CreditCard, 
    CheckCircle, 
    AlertCircle,
    Download
} from 'lucide-react';
import apiFetch from '../../utils/api';
import Badge from '../../components/Badge';
import MapPicker from '../../components/MapPicker';
import { toast } from 'react-toastify';

const CustomerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCustomerData = async () => {
        try {
            const data = await apiFetch(`/api/customers/${id}`);
            setCustomer(data);
        } catch (error) {
            toast.error('Failed to load customer details');
            navigate('/customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerData();
    }, [id]);

    const handlePay = async (invoiceId) => {
        if (confirm('Confirm payment for this invoice?')) {
            try {
                await apiFetch(`/api/payments/${invoiceId}/pay`, { method: 'POST' });
                toast.success('Payment recorded successfully');
                fetchCustomerData();
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse">Loading customer details...</div>;
    if (!customer) return null;

    // Calculate Unpaid Balance
    const unpaidInvoices = customer.payments?.filter(p => p.status === 'unpaid') || [];
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/customers')}
                    className="flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to List
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate(`/customers/${id}/edit`)}
                        className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-sm text-sm font-semibold hover:bg-slate-50 transition-all"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm overflow-hidden shadow-sm">
                        <div className="bg-indigo-600 h-24"></div>
                        <div className="px-6 pb-6">
                            <div className="-mt-12 flex justify-center">
                                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <User className="w-12 h-12" />
                                </div>
                            </div>
                            <div className="text-center mt-4">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{customer.name}</h2>
                                <p className="text-sm text-slate-500 font-mono mt-1">{customer.customer_code}</p>
                                <div className="flex justify-center mt-3">
                                    <Badge variant={customer.status === 'active' ? 'success' : (customer.status === 'isolir' ? 'warning' : 'danger')}>
                                        {customer.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span>{customer.address || 'No address provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    <span>{customer.phone || 'No phone provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <Package className="w-4 h-4 text-slate-400" />
                                    <span className="font-bold text-indigo-600">{customer.monthly_package?.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">Location Point</h3>
                        <MapPicker lat={customer.latitude} lng={customer.longitude} onChange={() => {}} />
                    </div>
                </div>

                {/* Billing History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary Bar */}
                    <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 p-6 rounded-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-100 dark:bg-rose-900/20 rounded-full text-rose-600">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Total Unpaid Balance</p>
                                <p className="text-2xl font-black text-rose-800 dark:text-rose-400">Rp {Number(totalUnpaid).toLocaleString()}</p>
                            </div>
                        </div>
                        {totalUnpaid > 0 && (
                            <Badge variant="danger">Action Required</Badge>
                        )}
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white">Billing History</h3>
                            <CreditCard className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950/50">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Period</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {customer.payments?.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No billing history found.</td>
                                        </tr>
                                    ) : (
                                        customer.payments?.map((inv) => (
                                            <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">{inv.invoice_number}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{inv.period}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">Rp {Number(inv.amount).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <Badge variant={inv.status === 'paid' ? 'success' : 'danger'}>
                                                        {inv.status.toUpperCase()}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {inv.status === 'unpaid' && (
                                                        <button 
                                                            onClick={() => handlePay(inv.id)}
                                                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-xs font-bold transition-all shadow-sm active:scale-95"
                                                        >
                                                            Mark as Paid
                                                        </button>
                                                    )}
                                                    {inv.status === 'paid' && (
                                                        <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
