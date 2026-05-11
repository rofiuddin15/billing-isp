<?php

namespace App\Observers;

use App\Models\CashFlow;
use App\Services\AccountingService;

class CashFlowObserver
{
    protected $accounting;

    public function __construct(AccountingService $accounting)
    {
        $this->accounting = $accounting;
    }

    /**
     * Handle the CashFlow "created" event.
     */
    public function created(CashFlow $cashFlow): void
    {
        $this->accounting->recordCashFlow($cashFlow);
    }
}
