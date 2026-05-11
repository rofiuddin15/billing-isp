import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReceiptService = {
    generatePaymentReceipt: (payment, customer, appSettings = {}) => {
        const doc = new jsPDF({
            unit: 'mm',
            format: [80, 150] // Thermal printer format
        });

        const ISP_NAME = appSettings.company_name || "MinISP Networks";
        const ISP_ADDRESS = appSettings.company_address || "Jl. Raya Digital No. 101, Indonesia";
        const ISP_PHONE = appSettings.company_phone || "0812-3456-7890";

        // Header
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(ISP_NAME, 40, 10, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const splitAddress = doc.splitTextToSize(ISP_ADDRESS, 70);
        doc.text(splitAddress, 40, 15, { align: 'center' });
        
        let y = 15 + (splitAddress.length * 4);
        doc.text(`Telp: ${ISP_PHONE}`, 40, y, { align: 'center' });
        y += 3;

        doc.setLineWidth(0.3);
        doc.line(5, y, 75, y);
        y += 6;

        // Transaction Info
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("STRUK PEMBAYARAN", 40, y, { align: 'center' });
        y += 7;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`No. Transaksi`, 5, y);
        doc.text(`: ${payment.invoice_number}`, 28, y);
        y += 5;
        doc.text(`Tanggal Bayar`, 5, y);
        doc.text(`: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 28, y);
        y += 5;
        doc.text(`Pelanggan`, 5, y);
        doc.text(`: ${customer.name}`, 28, y);
        y += 5;
        doc.text(`ID Pelanggan`, 5, y);
        doc.text(`: ${customer.customer_code}`, 28, y);

        doc.line(5, y + 3, 75, y + 3);
        y += 10;

        // Table
        doc.autoTable({
            startY: y,
            theme: 'plain',
            styles: { fontSize: 8, cellPadding: 1 },
            head: [['Deskripsi', 'Jumlah']],
            body: [
                [`Tagihan Bulan ${payment.period}`, `Rp ${Number(payment.amount).toLocaleString('id-ID')}`],
                [{ content: 'Total Pembayaran', styles: { fontStyle: 'bold' } }, { content: `Rp ${Number(payment.amount).toLocaleString('id-ID')}`, styles: { fontStyle: 'bold' } }]
            ],
            margin: { left: 5, right: 5 },
            columnStyles: {
                1: { halign: 'right' }
            }
        });

        y = doc.lastAutoTable.finalY + 10;

        // Footer
        doc.setFontSize(7);
        doc.setFont("helvetica", "italic");
        doc.text("Terima kasih telah berlangganan.", 40, y, { align: 'center' });
        y += 4;
        doc.text("Simpan struk ini sebagai bukti pembayaran sah.", 40, y, { align: 'center' });
        
        y += 10;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Staff Administrasi", 55, y, { align: 'center' });
        y += 12;
        doc.text(payment.confirmed_by?.name || "Petugas Kasir", 55, y, { align: 'center' });
        doc.line(40, y + 1, 70, y + 1);

        // Save
        doc.save(`Struk_${payment.invoice_number}.pdf`);
    }
};

export default ReceiptService;
