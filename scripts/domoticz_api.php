<?php
$domoticz_ip = '192.168.4.1'; // Adresse IP du Raspberry
$domoticz_port = '8080';

// Fonction pour récupérer les données d’un équipement
function getDeviceData($idx) {
    global $domoticz_ip, $domoticz_port;
    $url = "http://{$domoticz_ip}:{$domoticz_port}/json.htm?type=devices&rid=" . $idx;

    $response = @file_get_contents($url);
    if ($response === FALSE) {
        return json_encode(['status' => 'error', 'message' => 'Erreur de récupération depuis Domoticz']);
    }

    return $response;
}

// Fonction pour changer l’état d’un interrupteur
function switchDevice($idx, $switchcmd) {
    global $domoticz_ip, $domoticz_port;
    $url = "http://{$domoticz_ip}:{$domoticz_port}/json.htm?type=command&param=switchlight&idx={$idx}&switchcmd={$switchcmd}";

    $response = @file_get_contents($url);
    if ($response === FALSE) {
        return json_encode(['status' => 'error', 'message' => 'Échec de la commande']);
    }

    return $response;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action']) && isset($_POST['idx'])) {
        $idx = intval($_POST['idx']);
        $action = $_POST['action'];

        if ($action === 'getData') {
            echo getDeviceData($idx);
        } elseif ($action === 'switchOn') {
            echo switchDevice($idx, 'On');
        } elseif ($action === 'switchOff') {
            echo switchDevice($idx, 'Off');
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Action invalide']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Paramètres manquants']);
    }
}
?>
