$(document).ready(function () {

    var reloadSave = false;
    var filterInput = $("#filterInput");
    filterInput.val("");

    function filter(search) {

        if (!search) search = "";

        var onlyActive = $("#onlyActiveFilter").is(":checked");
        var onlyFavorite = $("#onlyFavoriteFilter").is(":checked");
        var showHidden = $("#showHiddenFilter").is(":checked");

        var resaltar = function (busqueda, contenido, claseCSSbusqueda) {
            var regex = new RegExp("(<[^>]*>)|(" + busqueda.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1") + ')', 'ig');

            return contenido.replace(regex, function (a, b, c) {
                return (a.charAt(0) === "<") ? a : "<span class=\"" + claseCSSbusqueda + "\">" + c + "</span>";
            });
        }

        $("#bodyTable").find(".rowHost").each(function (a, b) {

            var domainContent = $(b).find(".tdDomainContent");
            var directionContent = $(b).find(".tdDirectionContent");

            var domain = $(b).attr("data-domain");
            var direction = $(b).attr("data-direction");

            if (search !== "") {

                var findDomain = domain.includes(search);
                var findDirection = direction.includes(search);

                if (!findDomain && !findDirection) {
                    $(b).addClass("hideRowByFilter");
                    directionContent.html(direction);
                    domainContent.html(domain);
                }
                else {
                    directionContent.html(resaltar(search, direction, "hightlightSearch"));
                    domainContent.html(resaltar(search, domain, "hightlightSearch"));
                    $(b).removeClass("hideRowByFilter");
                }
            }
            else {
                directionContent.html(direction);
                domainContent.html(domain);
                $(b).removeClass("hideRowByFilter");
            }

            if (onlyActive) {
                if (!$(b).hasClass("active")) {
                    $(b).addClass("hideRowByFilter");
                }
            }
            if (onlyFavorite) {
                if (!$(b).find(".favorite").first().hasClass("favoriteActive")) {
                    $(b).addClass("hideRowByFilter");
                }
            }
            if (!showHidden) {
                if ($(b).find(".setHidden").first().hasClass("hiddenActive")) {
                    $(b).addClass("hideRowByFilter");
                }
            }
        });
    }

    function clearFilter() {
        filterInput.val("").focus();
        filter("");
    }

    function updatePreferences() {

        toastr.remove()

        var preferences = {};
        preferences["save_preferences"] = true;
        preferences["only_active"] = false;
        preferences["only_favorite"] = false;
        preferences["favorite"] = {};
        preferences["tags"] = {};
        preferences["tags_group"] = {};
        preferences["hidden"] = {};

        //Save preferences
        $(".updatePreference").each(function (a, b) {

            var type = $(b).attr("data-preference");

            if (type === "only_active" || type === "only_favorite") {
                preferences[type] = $(b).is(":checked");
            }
            else if (type === "favorite") {

                if ($(b).hasClass("favoriteActive")) {
                    const domain = $(b).attr("data-domain");
                    const direction = $(b).attr("data-direction");
                    const favoriteKey = domain + "_" + direction

                    preferences["favorite"][favoriteKey] = {};
                    preferences["favorite"][favoriteKey]["domain"] = domain;
                    preferences["favorite"][favoriteKey]["direction"] = direction;
                }
            }
            else if (type === "set_hidden") {

                if ($(b).hasClass("hiddenActive")) {
                    const domain = $(b).attr("data-domain");
                    const direction = $(b).attr("data-direction");
                    const favoriteKey = domain + "_" + direction

                    preferences["hidden"][favoriteKey] = {};
                    preferences["hidden"][favoriteKey]["domain"] = domain;
                    preferences["hidden"][favoriteKey]["direction"] = direction;
                }
            }
        })

        //Save tags
        $(".rowHost").each(function (a, b) {
            var domain = $(b).attr("data-domain");
            var direction = $(b).attr("data-direction");
            var tagKey = domain + "_" + direction

            preferences["tags"][tagKey] = {};

            $(b).find(".tagItem").each(function (c, d) {
                if (typeof preferences["tags"][tagKey][c] === "undefined") {
                    preferences["tags"][tagKey][c] = {};
                }
                preferences["tags"][tagKey][c]["text"] = $(d).attr("data-text");
                preferences["tags"][tagKey][c]["color"] = $(d).attr("data-color");
            });
        });

        //Save group tags
        $(".rowHostDirectionTitle").each(function (a, b) {
            var tagKey = $(b).attr("data-group");

            preferences["tags_group"][tagKey] = {};

            $(b).find(".tagItem").each(function (c, d) {
                if (typeof preferences["tags_group"][tagKey][c] === "undefined") {
                    preferences["tags_group"][tagKey][c] = {};
                }
                preferences["tags_group"][tagKey][c]["text"] = $(d).attr("data-text");
                preferences["tags_group"][tagKey][c]["color"] = $(d).attr("data-color");
            });
        });

        //Send to save
        $.ajax({
            url: "api.php",
            data: preferences,
            method: "post",
            success: function (data) {
                if (parseInt(data) === 1) {
                    toastr.success('Preferencias guardadas', '', {timeOut: 1000})
                }
                else {
                    toastr.error('Error al actualizar preferencias')
                }
            },
            error: function () {
                toastr.error('Error al actualizar preferencias')
            }
        })
    }

    function addNew() {

        var addNew = $("#addNewRowDirection");
        var addDomain = $("#addNewRowDomain");

        var addNewRowDirection = addNew.val().trim();
        var addNewRowDomain = addDomain.val().trim();

        //Si están vacías
        if (addNewRowDomain != "" && addNewRowDirection != "") {
            var row = '<tr class="rowHost" data-domain="' + addNewRowDomain + '" data-direction="' + addNewRowDirection + '">\
                       <td class="text-center">\
                           <label class="switch">\
                           <input class="enableHost" type="checkbox" value="1" checked="checked">\
                           <span class="slider round"></span>\
                           </label>\
                       </td>\
                       <td class="text-center">\
                           <span class="favorito">\
                                <i class="fas fa-star updatePreference favorite" data-preference="favorite" data-domain="' + addNewRowDomain + '" data-direction="' + addNewRowDirection + '"></i>\
                           </span>\
                       </td>\
                       <td class="text-center tagsContainer"></td>\
                       <td class="tdDirectionContent">' + addNewRowDirection + '</td>\
                       <td class="tdDomainContent">' + addNewRowDomain + '</td>\
                       <td class="text-center">\
                           <i class="fas fa-tags tagsHost"></i>\
                           <i class="fas fa-trash-alt deleteHost"></i>\
                       </td>\
                   </tr>';

            $("#bodyTable").append(row);

            addNew.val("127.0.0.1");
            addDomain.val("");

            //save the id
            var idRow = addNewRowDomain + "_" + addNewRowDirection;
            localStorage.setItem('host_last_saved', idRow);
            reloadSave = true;

            saveHosts();
        }
        else {
            toastr.error('Por favor, verifique los campos a llenar')
        }
    }

    function eventsEnable() {

        $(".tagsHost").unbind("click").on("click", function (e) {

            var self = this;

            var getTagEditor = function (tagText, tagColor) {

                if (!tagText) tagText = "";
                if (!tagColor) tagColor = "";

                var colors = {
                    "#F95800": "Orange",
                    "#E42364": "Pink",
                    "#363F46": "Black",
                    "#9623B6": "Purple",
                    "#6135BC": "Deep Purple",
                    "#3D4EBA": "Indigo",
                    "#2993F9": "Blue",
                    "#20A7F9": "Light Blue",
                    "#2DBAD8": "Cyan",
                    "#229584": "Teal",
                    "#56AE3E": "Green",
                    "#8DC229": "Light Green",
                    "#CEDC00": "Lime",
                    "#FDC100": "Amber",
                    "#765546": "Brown",
                    "#9D9D9D": "Grey",
                    "#617D8B": "Blue Grey",
                };

                var tagEditor = '<div class="tagRow input-group">\
                                    <div class="input-group-prepend">\
                                        <span class="input-group-text">Label</span>\
                                    </div>\
                                    <input type="text" class="textTag form-control" value="' + tagText + '">\
                                    <select type="text" class="colorTag form-control">';

                $.each(colors, function (a, b) {
                    var selected = "";
                    if (a == tagColor) selected = "selected='selected'";
                    tagEditor += '<option value="' + a + '" style="background: ' + a + '" ' + selected + '>' + b + '</option>';
                });

                tagEditor += '</select>\
                                    <span class="trashTag fa fa-trash"></span>\
                                </div>';

                return tagEditor;
            };

            var trashEvents = function (modal) {
                modal.$content.find('.trashTag').unbind("click").click(function () {
                    $(this).parent().remove();
                });
            };

            $.confirm({
                title: 'Administrar Tags',
                content: "<div class='tagContainerEditor'></div><div class='addTagRow'><span class='fa fa-plus'></span>Agregar</div>",
                buttons: {
                    formSubmit: {
                        text: 'Guardar',
                        btnClass: 'btn-blue',
                        action: function () {

                            var tags = "";

                            this.$content.find('.tagRow').each(function (a, b) {
                                var textTag = $(b).find(".textTag").val();
                                var colorTag = $(b).find(".colorTag").val();
                                tags += "<div class='tagItem' data-text='" + textTag + "' data-color='" + colorTag + "' style='background: " + colorTag + "'>" + textTag + "</div>"
                            });

                            $(self).parent().parent().find(".tagsContainer").html("").append(tags);

                            updatePreferences();
                        }
                    },
                    cancel: {
                        text: 'Cancelar'
                    }
                },
                onContentReady: function () {
                    var modal = this;

                    var contentTagRow = modal.$content.find('.tagContainerEditor');

                    $(self).parent().parent().find(".tagsContainer").find(".tagItem").each(function (a, b) {
                        var textTag = $(b).attr("data-text");
                        var colorTag = $(b).attr("data-color");
                        contentTagRow.append(getTagEditor(textTag, colorTag));
                        trashEvents(modal);
                    });

                    modal.$content.find('.addTagRow').on('click', function (e) {
                        contentTagRow.append(getTagEditor());
                        trashEvents(modal);
                    });
                }
            });
        });
        $(".deleteHost").unbind("click").on("click", function (e) {

            var self = this;

            $.confirm({
                title: '¿Está seguro de eliminar?',
                content: 'Esta accion no se puede revertir',
                buttons: {
                    confirmar: function () {
                        $(self).parent().parent().remove();
                        saveHosts();
                    },
                    cancelar: function () {
                    }
                }
            });
        });
        $(".updatePreference").unbind("click").on("click", function (e) {

            //clase para favoritos
            var type = $(this).attr("data-preference");
            if (type === "favorite") {
                $(this).toggleClass("favoriteActive");
            }
            if (type === "set_hidden") {
                $(this).toggleClass("hiddenActive");
            }
            updatePreferences();
            filter(filterInput.val());
        });
        $(".enableHost").unbind("change").change(function () {

            var rowParent = $(this).parent().parent().parent();

            //clase para favoritos
            if ($(this).is(":checked")) {
                rowParent.addClass("active");
            }
            else {
                rowParent.removeClass("active");
            }

            saveHosts();
            filter(filterInput.val());
        })

        //highlight the last saved
        var lastSaved = localStorage.getItem('host_last_saved');
        var rowAdded = document.getElementById(lastSaved);

        if (lastSaved !== null && lastSaved !== "" && $(rowAdded).length > 0) {
            //add class for last added
            $(rowAdded).addClass("rowHostSaved");

            //scroll to row
            $('html, body').animate({
                scrollTop: $(rowAdded).offset().top - 300
            }, 0);

            localStorage.setItem('host_last_saved', null);

            setTimeout(function () {
                $(rowAdded).removeClass("rowHostSaved");
            }, 5000);
        }
    }

    function saveHosts() {
        var data = {};
        data["hosts"] = {};

        toastr.remove()

        $("#bodyTable").find(".rowHost").each(function (a, b) {

            if (typeof data["hosts"][a] === "undefined") {
                data["hosts"][a] = {};
            }

            var enable = $(this).find(".enableHost").first().is(":checked");
            var domain = $(b).attr("data-domain");
            var direction = $(b).attr("data-direction");

            data["hosts"][a]["domain"] = domain;
            data["hosts"][a]["direction"] = direction;
            data["hosts"][a]["enable"] = enable;
        });

        $.ajax({
            url: "api.php",
            data: data,
            method: "post",
            success: function (data) {
                if (data == "1") {
                    if (reloadSave) {
                        window.location.href = "index.php";
                    }
                    else {
                        toastr.success('Archivo actualizado con éxito', '')
                    }
                }
                else {
                    toastr.error('Error al actualizar el archivo, verifique permisos')
                }
            },
            error: function () {
                toastr.error('Error al actualizar el archivo, verifique permisos')
            }
        })
    }

    $("#addNewRow").on("click", function (e) {
        addNew();
    });

    filterInput.on("keyup", function (e) {
        var value = $(this).val();
        filter(value);
    }).focus();

    $("#filterClear").on("click", function (e) {
        clearFilter();
    });

    $("#openFile").on("click", function (e) {
        window.open("api.php?openFile=true");
    });

    $("#addNewRowDirection").val("127.0.0.1");
    $("#addNewRowDomain").val("");

    eventsEnable();

    //filtro inicial
    filter();
})