<?php
include_once("process.php");
$arrConfig = getPreferences();
$arrHost = getHost();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8"/>
    <title>EDITOR DE HOST</title>
    <link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/all.css">
    <link rel="stylesheet" type="text/css" href="assets/css/toastr.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/jquery-confirm.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/style.css">
</head>
<body>
<header>
    <div class="headerFilter">
        <div>
            <div class="row">
                <div class="col-xs-1 col-md-4">
                    <h1>Editor de host</h1>
                </div>
                <div class="col-xs-1 col-md-8 text-right">
                    <div class="filterContent">
                        <div>
                            <i class="far fa-eye"></i>Solo activos
                        </div>
                        <label class="switch">
                            <?php $checked = (isset($arrConfig["only_active"]) && $arrConfig["only_active"] == "true") ? "checked='checked'" : ""; ?>
                            <input id="onlyActiveFilter" class="updatePreference" type="checkbox" value="1" data-preference="only_active" <?php print $checked ?>>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div class="filterContent">
                        <div>
                            <i class="fas fa-star"></i>Solo favoritos
                        </div>
                        <label class="switch">
                            <?php $checked = (isset($arrConfig["only_favorite"]) && $arrConfig["only_favorite"] == "true") ? "checked='checked'" : ""; ?>
                            <input id="onlyFavoriteFilter" class="updatePreference" type="checkbox" value="1" data-preference="only_favorite" <?php print $checked ?>>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div class="filterContent">
                        <div>
                            <i class="fas fa-eye-slash"></i>Mostrar ocultos
                        </div>
                        <label class="switch">
                            <?php $checked = (isset($arrConfig["show_hidden"]) && $arrConfig["show_hidden"] == "true") ? "checked='checked'" : ""; ?>
                            <input id="showHiddenFilter" class="updatePreference" type="checkbox" value="1" data-preference="show_hidden" <?php print $checked ?>>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div class="filterContent">
                        <div id="openFile" class="openFile">
                            <i class="fas fa-external-link-square-alt"></i>Url de archivo
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="input-group mb-3" style="margin: 10px 0 0 0">
            <div class="input-group-prepend">
                <button id="filterClear" class="btn btn-danger" type="button">Limpiar <i class="fas fa-filter"></i>
                </button>
            </div>
            <input id="filterInput" type="text" class="form-control filterInput" value="" placeholder="Escribe aquí para filtrar">
        </div>
    </div>
</header>
<section class="container">
    <table class="table hostTable">
        <tbody id="bodyTable" class="bodyTable">
        <?php
        foreach ($arrHost as $direction => $hosts) {
            ?>
            <tr class="rowHostDirectionTitle" data-group="<?php print $direction ?>">
                <td colspan="2">
                    <i class="fas fa-layer-group"></i>
                    <?php print $direction ?>
                </td>
                <td colspan="3" class="tagsContainer">
                    <?php
                    foreach ($hosts["_group_tags"] as $tag) {
                        ?>
                        <div class='tagItem' data-text='<?php print $tag["text"] ?>' data-color='<?php print $tag["color"] ?>' style='background: <?php print $tag["color"] ?>'><?php print $tag["text"] ?></div><?php
                    }
                    ?>
                </td>
                <td class="text-center">
                    <i class="fas fa-tags tagsHost" data-tagtype="group"></i>
                </td>
            </tr>
            <tr>
                <td scope="col" class="text-center col-min">Activo</td>
                <td scope="col" class="text-center col-min">Atributos</td>
                <td scope="col" class="text-center">Tags</td>
                <td scope="col">Direccion</td>
                <td scope="col">Dominio</td>
                <td scope="col" class="text-center col-min">Acciones</td>
            </tr>
            <?php
            foreach ($hosts as $key => $valueHost) {
                if ($key === "_group_tags") continue;
                $checked = ($valueHost["active"] == 1) ? "checked='checked'" : "";
                $favorite = ($valueHost["favorite"]) ? "favoriteActive" : "";
                $setHidden = ($valueHost["hidden"]) ? "hiddenActive" : "";
                ?>
                <tr class="rowHost <?php print ($checked != "") ? "active" : "" ?>" id="<?php print $valueHost["id"] ?>" data-domain="<?php print $valueHost["domain"] ?>" data-direction="<?php print $valueHost["direction"] ?>">
                    <td class="text-center">
                        <label class="switch">
                            <input class="enableHost" type="checkbox" value="1" <?php print $checked ?>>
                            <span class="slider round"></span>
                        </label>
                    </td>
                    <td class="text-center">
                        <span class="favorito">
                            <i class="fas fa-star updatePreference favorite <?php print $favorite ?>" data-preference="favorite" data-domain="<?php print $valueHost["domain"] ?>" data-direction="<?php print $valueHost["direction"] ?>"></i>
                        </span>
                        &nbsp;
                        <span class="favorito">
                            <i class="fas fa-eye-slash updatePreference setHidden <?php print $setHidden ?>" data-preference="set_hidden" data-domain="<?php print $valueHost["domain"] ?>" data-direction="<?php print $valueHost["direction"] ?>"></i>
                        </span>
                    </td>
                    <td class="text-center tagsContainer">
                        <?php
                        foreach ($valueHost["tags"] as $tag) {
                            ?>
                            <div class='tagItem' data-text='<?php print $tag["text"] ?>' data-color='<?php print $tag["color"] ?>' style='background: <?php print $tag["color"] ?>'><?php print $tag["text"] ?></div><?php
                        }
                        ?>
                    </td>
                    <td class="tdDirectionContent"><?php print $valueHost["direction"] ?></td>
                    <td class="tdDomainContent"><?php print $valueHost["domain"] ?></td>
                    <td class="text-center">
                        <i class="fas fa-tags tagsHost"></i>
                        <i class="fas fa-trash-alt deleteHost"></i>
                    </td>
                </tr>
                <?php
            }
        }
        ?>
        </tbody>
        <tbody class="addNewRowContent">
        <tr id="RowAddNew">
            <td class="text-center">
                <input id="addNewRow" type="button" class="btn btn-success" value="Agregar nuevo" style="width: 100%">
            </td>
            <td colspan="2">
                <input id="addNewRowDirection" type="text" class="form-control" value="" placeholder="Escríbe aquí la dirección">
            </td>
            <td colspan="3">
                <input id="addNewRowDomain" type="text" class="form-control" value="" placeholder="Escríbe aquí el dominio">
            </td>
        </tr>
        </tbody>
    </table>
</section>
<footer>
    2020 - Eddy Pérez
</footer>
<script src="assets/js/jquery-3.3.1.min.js"></script>
<script src="assets/js/toastr.min.js"></script>
<script src="assets/js/jquery-confirm.min.js"></script>
<script src="assets/js/scripts.js"></script>
</body>
</html>