/**
 *	Ensemble Planer JS-Funktionen
 *
 *	Funktionen zum Einlesen von Ensemblelisten und Prüfung von Eingaben in Stundenplan
 *	Hat mehrere Möglichkeiten zu Prüfen, ob Ensembles richtig zugeordnet werden
 *
 *	erstellt: 13.10.2020
 *	zuletzt angepasst: 24.03.2021
 *	von: Lando Walter
 * 	Bei Rückfragen: lando.m.walter@gmail.com	+49 151 70171559
 */

// Globale Variable
var objGlobals = {};

// Wenn Gruppe bereits eingegeben (in localStorage gespeichert), dann anzeigen
if (localStorage.getItem("gruppen") != null && localStorage.getItem("gruppen").length > 0) {
	// Variablen deklarieren und initialisieren
	var strEnsembleGruppen = '';
	var strEnsembles = '';
	
	// JSON-String aus localStorage aufbereiten zum Einfügen in textarea
    strEnsembleGruppen = localStorage.getItem("gruppen").replace(/({ )?"(\w{1,2})":"([^"]+)",?( })?/gm, "$2 $3\n");
	// Ensemblenamen (Buchstaben) auslesen und kommagetrennt auflisten
    strEnsembles = strEnsembleGruppen.replace(/^(\w{1,2})\s.+$\R?/gm, "$1,").replace(/(?:\r\n|\r|\n)/gm, "");
	// letztes Komma trennen/löschen
	strEnsembles = strEnsembles.substring(0, strEnsembles.length - 1);
	// Text einfügen in textarea
	document.querySelector("textarea").value = strEnsembleGruppen;
	// Einfügen von Ensembleliste in globals-Variable aus localStorage
    objGlobals["gruppen"] = JSON.parse(localStorage.getItem("gruppen"));
	// Einfügen von Ensemblenamen in globals-Variable 
    objGlobals["ensembles"] = strEnsembles.split(",");
	// button zum weiter gehen anzeigen
    document.querySelector("#continue").classList.remove("hidden");
}

// Bei Tastendruck in textarea, Knopf zum Weitergehen verstecken. (Bei Änderung von textarea muss einmal neu eingelesen werden zum Weitergehen)
document.querySelector("#first-field > div.responsive-table.container > textarea").onkeyup = function () {
    document.querySelector("#continue").classList.add("hidden");
};

// Ensembles einlesen und in localStorage speichern
document.getElementById("read").onclick = function () {
    // Textarea einlesen
    var strGruppe = document.querySelector("#first-field > div > textarea").value;

    // Testweise eingegeben Text mit RegEx durchgehen, um falsche Formatierung zu finden
    var strTest = strGruppe.replace(/^[A-Z]{1,2}\s+\d\d?(?:,\d\d?)*$(?:\r\n|\r|\n)*/gm, "");

    // Wenn Testtext leer ist, dann kein Formatfehler der Ensembleeingabe
    if (strTest == "") {
        // Ensembles auflisten (in Format A,B,C,...)
        var strEnsemble = strGruppe.replace(/^(\w{1,2})\s.+$(?:\r\n|\r|\n)*/gm, "$1,");
		// letztes Komma entfernen
		strEnsemble = strEnsemble.substring(0, strEnsemble.length - 1);
		
        // Eingegebener Text in JSON-String umwandeln
        strGruppe = strGruppe.replace(/([A-Z]{1,2})\s+(.+)$(?:\r\n|\r|\n)*/gm, '"$1":"$2",');
        strGruppe = strGruppe.substring(0, strGruppe.length - 1);
        strGruppe = "{ " + strGruppe + " }";

        // speichern von JSON in localStorage und Speichern&Umwandeln von JSON in Object
        localStorage.setItem("gruppen", strGruppe);
        objGlobals["gruppen"] = JSON.parse(strGruppe);
        document.querySelector("#continue").classList.remove("hidden");
        document.querySelector("#format-user-input").classList.add("hidden");
        // Ensembles in globals speichern
        objGlobals["ensembles"] = strEnsemble.split(",");
    } else {
        // Bei Fehler in Format von Eingabe der Ensembles, die betroffenen Zeilen ausgeben
        document.querySelector("#format-user-input").classList.remove("hidden");
        document.querySelector("#format-user-input > span").classList.remove("hidden");
        document.querySelector("#format-user-input > div").innerHTML = strTest.replace(/(?:\r\n|\r|\n)/gm, "<br>");
    }
};

// von Ensembleeingabe zu Zeittabelle wechseln
document.getElementById("continue").onclick = function () {
	// verstecken von erster Seite
    document.querySelector("#first-field").classList.add("hidden");
	// anzeigen von zweiter Seite
    document.querySelector("#second-field").classList.remove("hidden");
	// Anzeigen von Ensembleliste
    document.querySelector("#ensembleliste > div").innerHTML = objGlobals["ensembles"].join();
    document.querySelector("#ensembleverfuegbar > div").classList = objGlobals["ensembles"].join().replace(/,/gm, " ");

	// Variablen deklarieren und initialisieren
    var strOutput = "";
    var elemRows = document.querySelectorAll("#ensembleverfuegbar div.col-10");

    // Jede Zeile der Tabelle "Ensembles verfügbar" durchgehen (Bei 1 Beginnen, weil 0 die Überschrift ist)
    for (var i = 1; i < elemRows.length; i++) {
        strOutput = "";
		// für jedes Ensemble ein <span>-Element mit Ensemblebezeichnung als Klasse einfügen
        for (var j = 0; j < objGlobals["ensembles"].length; j++) {
			// Wenn leer, dann weiter
            if (objGlobals["ensembles"][j] == "") continue;
            strOutput += '<span class="ensemble_' + objGlobals["ensembles"][j] + '">' + objGlobals["ensembles"][j] + "</span>,";
        }

		// letztes Komma löschen
		strOutput = strOutput.substring(0, strOutput.length - 1);
		// schreibe Text in Zeile
        elemRows[i].innerHTML = strOutput;
    }

	// Speicher für Fehler initialisieren
    objGlobals["fehler"] = {};
};

// Sammeln jedes Input-Fields, um onkeyup-Event zu binden
var inputFields = document.querySelectorAll("#second-field input");

// Jedem Input-Field das gleiche onkeyup-Event zuordnen
for (var i = 0; i < inputFields.length; i++) {
    inputFields[i].onkeyup = function () {
        // aktuelle Zeile speichern
        var elemRow = this.parentElement.parentElement.childNodes;
        var intRowNumber = this.parentElement.parentElement.getAttribute("data-number");
        // Lade Gruppen aus globals, zum Zuordnen von Ensembles und Nummern
        var objGruppen = objGlobals["gruppen"];
        var arrEnsembles = [...objGlobals["ensembles"]];
        var objFehler = objGlobals["fehler"];
        // für aktuelle Zeile löschen
        objFehler[intRowNumber] = {};
        // Initialisieren von Variablen
        var arrCheck = [];
        var arrFirstCheck = [];
        var strSecondCheck = [];
        var arrColorRed = [];
        var arrColorYellow = [];
        var arrColorOrange = [];

        // Jedes Input-Field der Reihe durchgehen
        for (var i = 2; i < elemRow.length; i++) {
            if (elemRow[i].children != undefined) {
                // value von Input-Fields in arrCheck speichern
                arrCheck.push(elemRow[i].children[0].value.toUpperCase());
                // Klasse von einzelnem Element zurücksetzen
                elemRow[i].className = "col-2";
            }
        }

        // arrCheck durchgehen
        for (var i = 0; i < arrCheck.length; i++) {
            if (arrCheck[i] == "") {
                // Wenn Input-Field leer, dann nächstes
                continue;
            } else {
                if (objGruppen[arrCheck[i]] == undefined) {
                    // Wenn eingegebener Text aus Input-Field nicht in objGruppen, Zurückgeben, dass Eingabe nicht stimmt
                    arrColorOrange.push(i);
                    continue;
                } else {
                    // Speichere als ersten Wert
                    arrFirstCheck = objGruppen[arrCheck[i]].split(",");
                }
            }
            // Duchgehen des gleichen Arrays (arrCheck) zum Vergleichen und aufbereiten, der Nummern
            for (var j = i + 1; j < arrCheck.length; j++) {
                if (arrCheck[j] == "") {
					// Wenn Element leer, dann weiter
                    continue;
                } else if (objGruppen[arrCheck[i]] == objGruppen[arrCheck[j]]) {
					// Wenn Elemente gleich, dann als "gelben Fehler" markieren
                    arrColorYellow.push(i);
                    arrColorYellow.push(j);
                    continue;
                } else {
					// Speichere als zweiten Wert
                    strSecondCheck = objGruppen[arrCheck[j]];
                }

                // Prüfe die aufbereiteten Arrays
                for (var k = 0; k < arrFirstCheck.length; k++) {
					// Variablen deklarieren und initialisieren
                    var strId = "";
					// Regex mit aktueller Spielernummer (arrFirstCheck[k]) aufbereiten
                    var find = "(?<!\\d)" + arrFirstCheck[k] + "(?!\\d)";
                    var re = new RegExp(find, "g");

                    if (strSecondCheck == undefined) {
						// Wenn Text nicht gefunden, Zurückgeben, dass Eingabe nicht stimmt
                        arrColorOrange.push(j);
                    } else if (strSecondCheck.search(re) >= 0) {
						// Wenn Spielernummer aus arrFirstCheck[k] in strSecondCheck gefunden, dann ist die Spielernummer doppelt belegt. Dann als "roten Fehler" markieren
                        arrColorRed.push(i);
                        arrColorRed.push(j);
                        // Fehler für aktuelle Zeile speichern (Immer in bestimmter Reihenfolge, damit keine doppelten Werte in objFehler gespeichert werden)
                        if (arrCheck[i] > arrCheck[j]) {
                            strId = arrCheck[i] + arrCheck[j];
                        } else {
                            strId = arrCheck[j] + arrCheck[i];
                        }
						// Speichern von Fehler in objFehler (Speichere für aktuelle Zeile [intRowNumber] und Speichere mit eindeutigem Index [EnsemblebezeichnungA + EnsemblebezeichnungB + Spielernummer]) 
                        objFehler[intRowNumber][strId + arrFirstCheck[k]] = {
                            Zeit: elemRow[1].innerHTML,
                            Person: arrFirstCheck[k],
                            Gruppe1: arrCheck[i],
                            Gruppe2: arrCheck[j],
                        };
                    }
                }
            }
        }

        // Input-Fields  farbig markieren
        if (arrColorRed.length > 0) {
            for (var i = 0; i < arrColorRed.length; i++) {
                elemRow[arrColorRed[i] * 2 + 3].classList.add("bg-red");
            }
        }
        if (arrColorYellow.length > 0) {
            for (var i = 0; i < arrColorYellow.length; i++) {
                elemRow[arrColorYellow[i] * 2 + 3].classList.add("bg-yellow");
            }
        }
        if (arrColorOrange.length > 0) {
            for (var i = 0; i < arrColorOrange.length; i++) {
                elemRow[arrColorOrange[i] * 2 + 3].classList.add("bg-orange");
            }
        }

        // Speichern von Fehlern in globals
        objGlobals["fehler"] = objFehler;
        // Initialisieren von Werten zur Ausgabe
        var count = 1;
        document.getElementById("fehler").innerHTML = "";
        // Ausgabe von Fehlern zum erkennen, welche Nummern nicht passen
        for (var fehler in objFehler) {
            for (var fehlerOutput in objFehler[fehler]) {
                document.getElementById(
                    "fehler"
                ).innerHTML += `<div>${count}: Um ${objFehler[fehler][fehlerOutput]["Zeit"]} ist Nummer ${objFehler[fehler][fehlerOutput]["Person"]} in Gruppe ${objFehler[fehler][fehlerOutput]["Gruppe1"]} und ${objFehler[fehler][fehlerOutput]["Gruppe2"]} doppelt belegt</div>`;
                count++;
            }
        }

        // alle Input-Fields durchgehen, zum Abgleichen welche Ensembles noch nicht benutzt wurden
        var elemsInputFields = document.querySelectorAll("#second-field input[type=text]");
        for (var i = 0; i < elemsInputFields.length; i++) {
            // Wenn Input-Field leer ist, dann überspringen
            if (elemsInputFields[i].value == "") {
                continue;
            }

            // gehe jedes Element von Ensembles durch
            for (var j = 0; j < arrEnsembles.length; j++) {
                // Wenn Buchstabe in aktuellen Input-Field gleich dem Feld aus arrEnsembles
                if (arrEnsembles[j] == elemsInputFields[i].value.toUpperCase()) {
                    // schneide aktuelles Element aus arrEnsembles
                    arrEnsembles.splice(j, 1);
                }
            }
        }

        // aktualisiere Anzeige von noch nicht eingeplanten Ensembles
        if (arrEnsembles.length > 0) {
            document.querySelector("#ensembleliste > h3").classList.remove("hidden");
            document.querySelector("#ensembleliste > div").innerHTML = arrEnsembles.join();
            document.querySelector("#ensembleverfuegbar > div").classList = arrEnsembles.join().replace(/,/gm, " ");
        } else {
            // Bei komplett leerer Liste anderen Text anzeigen
            document.querySelector("#ensembleliste > h3").classList.add("hidden");
            document.querySelector("#ensembleliste > div").innerHTML = "<h2 class='eingeplant-gruen'>Alle Ensembles eingeplant!</h2>";
            document.querySelector("#ensembleverfuegbar > div").classList = arrEnsembles.join().replace(/,/gm, " ");
        }

        // Prüfe die aktuelle Zeile, um mögliche Ensembles pro Zeile zu erkennen
        checkRowEnsembles(arrCheck, arrEnsembles, intRowNumber);
    };
}

/**
 *	Prüfe aktuelle Zeile und schreibe in Tabelle, welche Ensembles zu bestimmter Uhrzeit noch eingeplant werden können
 *
 *	@param {array} arrCurrentRow
 *		Array mit allen Ensemble-Buchstaben, die in der aktuellen Zeile benutzt werden
 *
 *	@param {array} arrEnsemblesUsed
 *		Array mit allen Ensemble-Buchstaben, die insgesamt benutzt werden
 *
 *	@param {int} intRowNumber
 *		Nummer der aktuellen Zeile
 */
function checkRowEnsembles(arrCurrentRow, arrEnsemblesUsed, intRowNumber) {
    // Initialisieren von Variablen
    var arrEnsembles = [...objGlobals["ensembles"]];
    var strVergleich = "";
    var arrEnsemblesFrei = [];
    var boolFound = false;
    var strOutput = "";

    // String zum Vergleichen aufbereiten. Werte kommagetrennt auflisten, um nachher mit Regex zu vergleichen
    for (var i = 0; i < arrCurrentRow.length; i++) {
        // keine leeren Elemente mit aufnehmen
        if (arrCurrentRow[i] != "") strVergleich += objGlobals["gruppen"][arrCurrentRow[i]] + ",";
    }

    // Jedes Element aus arrEnsembles durchgehen
    for (var i = 0; i < arrEnsembles.length; i++) {
        // Wenn Element leer, nächstes Element prüfen
        if (arrEnsembles[i] == "") continue;

        // aktuelles Element speichern
        var arrCurrentEnsemble = objGlobals["gruppen"][arrEnsembles[i]].split(",");
        boolFound = true;

        // Abgleich mit aktuellem Ensemble
        for (var j = 0; j < arrCurrentEnsemble.length; j++) {
            // Regex für aktuelle Spielernummern aufbereiten
            var find = "(?:^|,)" + arrCurrentEnsemble[j] + ",";
            var re = new RegExp(find, "g");
            // Wenn Spielernummer aus aktuellem Ensemble in aufbereiteten String aus der aktuellen Zeile ist, dann boolFound auf false setzen
            if (strVergleich.search(re) >= 0) {
                boolFound = false;
                break;
            }
        }

        // Wenn Spielernummer nicht gefunden, dann push Element
        if (boolFound == true) arrEnsemblesFrei.push(arrEnsembles[i]);
    }

    // Kennzeichne Elemente der Zeile, um nachher CSS-Farben zu binden
    for (var i = 0; i < arrEnsemblesFrei.length; i++) {
        strOutput += '<span class="ensemble_' + arrEnsemblesFrei[i] + '">' + arrEnsemblesFrei[i] + "</span>,";
    }

    // Schreibe Zeile
    document.querySelector("#ensembleverfuegbar > div > div > div:nth-child(" + (+intRowNumber + +2) + ") > div.col-10").innerHTML = strOutput;
}

// Sammeln jedes Input-Fields, um onkeyup-Event zu binden
var toggleButtons = document.querySelectorAll("#toggle-buttons label");

// Jedem Input-Field das gleiche onchange-Event zuordnen
for (var i = 0; i < toggleButtons.length; i++) {
    // hinterlegte ID sammeln
    var strID = toggleButtons[i].getAttribute("data-target-id");
    // Wenn beim Laden der Seite checked, dann einblenden, sonst ausblenden
    if (toggleButtons[i].childNodes[1].checked) {
        document.getElementById(strID).classList.remove("hidden");
    } else {
        document.getElementById(strID).classList.add("hidden");
    }

    // Binden von change-Event
    toggleButtons[i].addEventListener("change", (event) => {
        // hinterlegte ID sammeln
        var strID = event.target.parentElement.getAttribute("data-target-id");
        // Wenn checked, dann einblenden, sonst ausblenden
        if (event.target.checked) {
            document.getElementById(strID).classList.remove("hidden");
        } else {
            document.getElementById(strID).classList.add("hidden");
        }
    });
}

// Klick auf Drucken-Knopf
document.querySelector("#drucken").onclick = function () {
    // Initialisierung von Variablen
    var elemRow = document.querySelectorAll("#second-field > div.responsive-table.container > div.row");
    var elemRowInput;
    var arrUebertrag = [];
    var arrToPush = [];
    var arrWochentage = "Sonntag Montag Dienstag Mittwoch Donnerstag Freitag Samstag".split(" ");

    for (var i = 1; i < elemRow.length; i++) {
        // Jedes Input-Field der Reihe durchgehen
        elemRowInput = elemRow[i].childNodes;
        // Array vorbereiten
        arrToPush = [];

        // Starte mit Nr. 3, da 1-2 die Zeit ist. Gehe dann jedes Input-Field der Reihe durch
        for (var j = 3; j < elemRowInput.length; j += 2) {
            // value von Input-Fields in arrCheck speichern
            arrToPush.push(elemRowInput[j].children[0].value.toUpperCase());
        }
        // In Übertrag-Array schieben
        arrUebertrag.push(arrToPush);
    }

    // Übertrag-Array in Druckvorlage übertragen
    for (var i = 0; i < arrUebertrag.length; i++) {
        for (var j = 0; j < arrUebertrag[i].length; j++) {
            document.querySelector("#third-field > div > div:nth-child(" + (+i + +2) + ") > div:nth-child(" + (+j + +2) + ")").innerHTML = arrUebertrag[i][j];
        }
    }

    // Vorbereiten von Datum
    var dateTomorrow = new Date();
    var strOutput = "";
    dateTomorrow.setDate(dateTomorrow.getDate() + 1);

	// Aufbereiten von Ausgabe
    strOutput = arrWochentage[dateTomorrow.getDay()] + " " + dateTomorrow.getDate() + "." + (+dateTomorrow.getMonth() + 1) + "." + dateTomorrow.getFullYear();

    // Schreibe Datum über Tabelle
    document.querySelector("#third-field > h3 > span.year").innerHTML = dateTomorrow.getFullYear();
    document.querySelector("#third-field > h4 > span.day").innerHTML = strOutput;

    // Druck-Tabelle zeigen
    document.querySelector("#second-field").classList.add("hidden");
    document.querySelector("#third-field").classList.remove("hidden");
    // Drucken
    window.print();
    // Wieder andere Tabelle zeigen
    document.querySelector("#second-field").classList.remove("hidden");
    document.querySelector("#third-field").classList.add("hidden");
};
