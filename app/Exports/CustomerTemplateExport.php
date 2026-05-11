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
                'email' => 'pelanggan@contoh.com',
                'alamat' => 'Jl. Contoh No. 123',
                'telepon' => '08123456789',
                'pppoe_user' => 'user@mikrotik',
                'paket' => 'Paket Dasar',
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
            'email',
            'alamat',
            'telepon',
            'pppoe_user',
            'paket',
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
