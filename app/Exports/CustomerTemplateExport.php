<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CustomerTemplateExport implements FromCollection, WithHeadings, WithStyles
{
    public function collection()
    {
        return collect([
            [
                'kode_pelanggan' => '',
                'nama' => 'Contoh Pelanggan',
                'alamat' => 'Jl. Contoh No. 123',
                'telepon' => '08123456789',
                'pppoe_user' => 'user@mikrotik',
                'paket' => 'Paket Dasar',
                'biaya_pemasangan' => '500000',
                'status' => 'aktif',
                'latitude' => '-6.200000',
                'longitude' => '106.816666'
            ]
        ]);
    }

    public function headings(): array
    {
        return [
            'kode_pelanggan',
            'nama',
            'alamat',
            'telepon',
            'pppoe_user',
            'paket',
            'biaya_pemasangan',
            'status',
            'latitude',
            'longitude'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
