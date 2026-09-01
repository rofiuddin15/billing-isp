<?php

namespace App\Services;

use RouterOS\Client;
use RouterOS\Query;
use App\Models\Router;
use Exception;

class MikrotikService
{
    protected $client;
    protected $router;
    protected $connected = false;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function connect()
    {
        if ($this->connected) {
            return true;
        }

        try {
            $this->client = new Client([
                'host' => $this->router->ip_address,
                'user' => $this->router->username,
                'pass' => $this->router->password ?? '',
                'port' => (int)$this->router->port,
            ]);
            $this->connected = true;
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function getActivePppoe()
    {
        if (!$this->connect()) return [];
        return $this->client->query(new Query('/ppp/active/print'))->read();
    }

    public function getPppProfiles()
    {
        if (!$this->connect()) return [];
        return $this->client->query(new Query('/ppp/profile/print'))->read();
    }

    public function syncPppoeSecret($name, $password, $profile, $comment = '', $service = 'pppoe', $disabled = 'no')
    {
        if (!$this->connect()) return false;

        $existing = $this->client->query(
            (new Query('/ppp/secret/print'))->where('name', $name)
        )->read();

        if (count($existing) > 0) {
            $id = $existing[0]['.id'];
            return $this->client->query(
                (new Query('/ppp/secret/set'))
                    ->equal('.id', $id)
                    ->equal('password', $password)
                    ->equal('profile', $profile)
                    ->equal('comment', $comment)
                    ->equal('disabled', $disabled)
            )->read();
        } else {
            return $this->client->query(
                (new Query('/ppp/secret/add'))
                    ->equal('name', $name)
                    ->equal('password', $password)
                    ->equal('profile', $profile)
                    ->equal('service', $service)
                    ->equal('comment', $comment)
                    ->equal('disabled', $disabled)
            )->read();
        }
    }

    public function disablePppoeSecret($name)
    {
        if (!$this->connect()) return false;

        $existing = $this->client->query(
            (new Query('/ppp/secret/print'))->where('name', $name)
        )->read();

        if (count($existing) > 0) {
            $id = $existing[0]['.id'];
            
            $this->client->query(
                (new Query('/ppp/secret/set'))
                    ->equal('.id', $id)
                    ->equal('disabled', 'yes')
            )->read();

            $active = $this->client->query(
                (new Query('/ppp/active/print'))->where('name', $name)
            )->read();
            
            if (count($active) > 0) {
                $this->client->query(
                    (new Query('/ppp/active/remove'))
                        ->equal('.id', $active[0]['.id'])
                )->read();
            }
            return true;
        }
        return false;
    }

    public function removePppoeSecret($name)
    {
        if (!$this->connect()) return false;
        
        $existing = $this->client->query(
            (new Query('/ppp/secret/print'))->where('name', $name)
        )->read();

        if (count($existing) > 0) {
            return $this->client->query(
                (new Query('/ppp/secret/remove'))
                    ->equal('.id', $existing[0]['.id'])
            )->read();
        }
        return false;
    }

    public function getHotspotProfiles()
    {
        if (!$this->connect()) return [];
        return $this->client->query(new Query('/ip/hotspot/user/profile/print'))->read();
    }

    public function addHotspotUser($name, $password, $profile, $server = 'all', $comment = '', $limitUptime = null)
    {
        if (!$this->connect()) return false;

        $query = (new Query('/ip/hotspot/user/add'))
            ->equal('name', $name)
            ->equal('password', $password)
            ->equal('profile', $profile)
            ->equal('server', $server)
            ->equal('comment', $comment);

        if ($limitUptime) {
            $query->equal('limit-uptime', $limitUptime);
        }

        return $this->client->query($query)->read();
    }

    public function syncHotspotProfile($name, $rateLimit = null, $sharedUsers = 1, $pool = null, $validityDays = null)
    {
        if (!$this->connect()) return false;

        $query = (new Query('/ip/hotspot/user/profile/print'))->where('name', $name);
        $existing = $this->client->query($query)->read();

        $onLoginScript = "";
        if ($validityDays) {
            // Mikhmon style expiration script
            $onLoginScript = ":local mac $\"mac-address\";
:local time [/system clock get time];
:local date [/system clock get date];
:local user \$user;
:local validity {$validityDays}d;
/system scheduler add name=\$user interval=\$validity on-event=\"/ip hotspot user remove [find name=\$user]; /ip hotspot active remove [find user=\$user]; /system scheduler remove [find name=\$user];\";";
        }

        $isUpdate = count($existing) > 0;
        
        $cmd = $isUpdate ? '/ip/hotspot/user/profile/set' : '/ip/hotspot/user/profile/add';
        
        $q = new Query($cmd);
        if ($isUpdate) {
            $q->equal('.id', $existing[0]['.id']);
        } else {
            $q->equal('name', $name);
        }
        
        $q->equal('shared-users', (string)$sharedUsers);
        
        if ($rateLimit) {
            $q->equal('rate-limit', $rateLimit);
        }
        
        if ($pool) {
            $q->equal('address-pool', $pool);
        }

        if ($onLoginScript) {
            $q->equal('on-login', $onLoginScript);
            // On-logout cleanup scheduler if user is removed manually
            $onLogoutScript = "/system scheduler remove [find name=\$user] on-error={};";
            $q->equal('on-logout', $onLogoutScript);
        }

        return $this->client->query($q)->read();
    }
}
