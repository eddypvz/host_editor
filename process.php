<?php
function dd($var){
    print "<pre>";
    print_r($var);
    print "</pre>";
}

function getPreferences(){
    if(file_exists("preferences.db")){
        $preferences = trim(file_get_contents("preferences.db"));

        $response = @json_decode($preferences, true);

        if(is_array($response)){
            return $response;
        }
        else{
            return [];
        }
    }
    else{
        //creo el archivo de preferencias
        $fh = fopen("preferences.db", 'w') or die("La carpeta donde se encuentra el proyecto no tiene permiso para escritura de archivo de preferencias");
        fclose($fh);
        return [];
    }
}

function getHost(){
    global $arrConfig;

    $arrHost = [];

    if(file_exists("config.conf")){

        $conf = trim(file_get_contents("config.conf"));

        if(file_exists($conf)){

            $file = fopen($conf, "r") or exit("Error al leer el archivo \"{$conf}\", verifica tus permisos de lectura o que el archivo exista");

            $count = 0;
            while(!feof($file)){

                $lineHostRaw = trim(fgets($file));

                if($lineHostRaw != ""){
                    $active = (substr($lineHostRaw, 0, 1) != "#");

                    if($active){
                        $lineHost = substr($lineHostRaw, 0, strlen($lineHostRaw));
                    }
                    else{
                        $lineHost = substr($lineHostRaw, 1, strlen($lineHostRaw));
                    }
                    $direction = substr($lineHost, 0, strrpos($lineHost, " "));
                    $domain = substr($lineHost, strrpos($lineHost, " "), strlen($lineHost));

                    $arrHost[$count]["active"] = $active;
                    $arrHost[$count]["direction"] = trim($direction);
                    $arrHost[$count]["domain"] = trim($domain);
                    $arrHost[$count]["favorite"] = false;
                    $arrHost[$count]["tags"] = [];

                    //Key para favoritos y tags
                    $keyTMP = "{$arrHost[$count]["domain"]}_{$arrHost[$count]["direction"]}";

                    $arrHost[$count]["id"] = $keyTMP;

                    //Favoritos
                    if(isset($arrConfig["favorite"])){
                        if(array_key_exists($keyTMP, $arrConfig["favorite"])){
                            $arrHost[$count]["favorite"] = true;
                        }
                    }

                    //Tags
                    if(isset($arrConfig["tags"])){
                        if(array_key_exists($keyTMP, $arrConfig["tags"])){
                            $arrHost[$count]["tags"] = $arrConfig["tags"][$keyTMP];
                        }
                    }
                    $count++;
                }
            }
            fclose($file);



            //sort host by domain
            usort($arrHost, function($a, $b) {
                return $a['domain'] > $b['domain'];
            });


            //order by ip
            $arrHostByIP = [];
            foreach($arrHost as $item){
                $arrHostByIP[$item["direction"]]["_group_tags"] = [];
                $arrHostByIP[$item["direction"]][] = $item;

                //search tags by group
                if(isset($arrConfig["tags_group"])){
                    if(array_key_exists($item["direction"], $arrConfig["tags_group"])){
                        $arrHostByIP[$item["direction"]]["_group_tags"] = $arrConfig["tags_group"][$item["direction"]];
                    }
                }
            }

            return $arrHostByIP;
        }
        else{
            die("El archivo \"{$conf}\" no existe o no tiene permisos para lectura");
        }
    }
    else{
        die("El archivo \"config.conf\" no existe o no tiene permisos para lectura");
    }
}


function saveHost($data = []){

    $stringContentFile = "";

    foreach($data as $hostItem){
        $enable = ($hostItem["enable"] == "false")?"#":"";
        $stringContentFile .= "{$enable}{$hostItem["direction"]}    {$hostItem["domain"]}\r\n";
    }

    if(file_exists("config.conf")){

        $conf = trim(file_get_contents("config.conf"));

        if(file_exists($conf)){
            return file_put_contents($conf, $stringContentFile);
        }
        else{
            return false;
        }
    }
    else{
        return false;
    }
}

function savePreferences($data = []){

    $stringContentFile = json_encode($data);

    if(file_exists("preferences.db")){
        return file_put_contents("preferences.db", $stringContentFile);
    }
    else{
        return false;
    }
}

function openFile(){

    if(file_exists("config.conf")){

        $fileHost = trim(file_get_contents("config.conf"));

        if(file_exists($fileHost)){
            $host = "Archivo cargado: {$fileHost}<br><br>";
            $host .= trim(file_get_contents($fileHost));
            return $host;
        }
        else{
            die("El archivo \"{$fileHost}\" no existe o no tiene permisos para lectura");
        }
    }
    else{
        die("El archivo \"config.conf\" no existe o no tiene permisos para lectura");
    }
}