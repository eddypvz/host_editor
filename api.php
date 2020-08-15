<?php
include_once("process.php");

if (isset($_GET["openFile"])) {
    print "<pre>";
    print openFile();
    print "</pre>";
    die();
}
if (isset($_POST["save_preferences"]) && $_POST["save_preferences"]) {
    $save = savePreferences($_POST);
    if ($save) {
        print 1;
    }
    else {
        print 0;
    }
    die();
}
if (isset($_POST["hosts"]) && count($_POST["hosts"]) > 0) {
    $save = saveHost($_POST["hosts"]);

    if ($save) {
        print 1;
    }
    else {
        print 0;
    }
    die();
}