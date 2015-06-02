// ==UserScript==
// @name		GeoMaps
// @namespace	http://www.c-dev.ch/
// @version 	2.0.0
// @date	 	17.05.2015
// @author		neisgei
// @description	GeoMaps - Karten und Koordinaten umrechnen
// @run-at      document-end
// @include		http://localhost*
// @include		http://www.geocaching.com/*
// @include     https://www.geocaching.com/*
// @exclude     http://www.geocaching.com/map/*
// @exclude     http://www.geocaching.com/seek/sendtogps.aspx*
// @exclude     http://localhost/GeoMapsWeb/GeoMapsPlanner.php
// @require		http://gcxxxxx.appspot.com/static/jquery-gm-1.4.2.min.js
// @require		http://cloud.github.com/downloads/enriquez/ezpz-tooltip/jquery.ezpz_tooltip.js
// @require		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/jquery-ui-1.8.5.custom.min.js
// @require		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/geo.js
// @require		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/latlon.js
// @require		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/wgs84_ch1903.js
// @require		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/core.js
// @require		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/language.js
// @grant       GM_getValue
// @grant       GM_setValue
// @grant				GM_deleteValue
// @grant				GM_xmlhttpRequest
// @grant				GM_openInTab
// @grant				GM_registerMenuCommand
// @grant				GM_listValues
// @grant 			GM_getResourceURL
// @resource home 		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/images/home.png
// @resource float 		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/images/float.png
// @resource pinned 	http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/images/pinned.png
// @resource dist 		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/images/dist.png
// @resource proj 		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/images/proj.png
// @resource close 		http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/images/close.png
// @resource setting 	http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/images/setting.png
// @resource outdooractivemap 	http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/images/outdooractivemap.png

// ==/UserScript==


/*****************************************************************************
 * Copyright (C) 2015 neisgei / c-dev.ch
 *
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 3 of the License, or (at your option) any later
 * version.
 *
 * This is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Public License for more details
 *
 * To obtain a copy of the GNU General Public License, please see
 * <http://www.gnu.org.licenses/>
 *****************************************************************************/

if (window.top != window.self) { return; } //don't run on frames or iframes

$ = jQuery.noConflict(true);

var appName = "GeoMaps";

var versionsNummer = '2.0.0 BETA';
GM_setValue('SUC_current_version', 20000);

var projektHomepage = 'http://www.c-dev.ch/geomaps';
var donationLink = 'http://www.c-dev.ch/geomaps';
var languageString = new de();
var url_TopoDe = 'http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/GeoMapsOutdoorActiveMaps.php';
var url_Google = 'http://www.c-dev.ch/geocaching/greasemonkey/geomaps/2.0/GeoMapsGoogleMaps.php';

Core.UpdateScript();

function UserSettings() {
    this.OptionList = new Options();
    function Options() {
        this.HighlightCoordinate = true;
        this.HighlightCoordinateMaster = true;
        this.SendTo = true;
        this.CacheInfoHideUMT = true;
        this.CacheInfoHideOther = true;
        this.MapGoogle = true;
        this.MapTopoDe = true;
        this.MapMapGeoAdmin = true;
        this.MapMapPlus = true;
        this.MapMapSearch = true;
        this.MapGeocaching = true;
        this.Format1 = '[deg.lat.p] [deg.lat.d]° [deg.lat.mv].[deg.lat.mn:3]\u2032 [deg.lon.p] [deg.lon.d]° [deg.lon.mv].[deg.lon.mn:3]\u2032';
        this.Format2 = '[swi.x:0-3] [swi.x:3-6] / [swi.y:0-3] [swi.y:3-6]';
        this.Format3 = '[dec.lat.p] [dec.lat.v].[dec.lat.n:6]° [dec.lon.p] [dec.lon.v].[dec.lon.n:6]°';
        this.Format4 = '[dms.lat.p] [dms.lat.d]° [dms.lat.m]\u2032[dms.lat.s].[dms.lat.z:2]\u2033 [dms.lon.p] [dms.lon.d]° [dms.lon.m]\u2032[dms.lon.s].[dms.lon.z:2]\u2033';
        this.Format1Show = false;
        this.Format2Show = true;
        this.Format3Show = true;
        this.Format4Show = true;
        this.CalculatorAsSidePop = true; // true = default, false = sidebox
        this.SelectClickMap = 0;
        this.Position=10;
        this.Language=0;
    };
};
UserSettings.prototype.Save = function () {
    GM_setValue('UserSettings', JSON.stringify(this.OptionList));
};
UserSettings.Load = function() {
    tmpUserSettings = new UserSettings();
    if (GM_getValue('UserSettings') != undefined) {
        tmpUserSettings.OptionList = JSON.parse(GM_getValue('UserSettings'));
    }
    return tmpUserSettings;
};
UserSettings.Delete = function() {
    GM_deleteValue("UserSettings");
    GM_setValue('SUC_last_update', -86400000);
};

// language settings
currentUserSettings = UserSettings.Load();
if(currentUserSettings.OptionList.Language == 0)
{
    languageString = new de();
}
else
{
    languageString = new en();
}


// ### Seitenelemente, evtl. GC.com Änderungen unterworfen ###
var el_cacheInfoArea = $('#ctl00_ContentBody_LocationSubPanel'); // Cache-Info Bereich -> span mit UTM Kooridnate
var el_widgetBox = $('#lnkSmallMap').parent().closest(':not(.WidgetBody)'); // Widget Bereich oberhalt kleiner googlemap
var el_cacheCoordinate = $('#uxLatLon'); // span-tag mit der Cache-Koodinate (original, oder umgerechnet, je nachdem was aktiv ist!)
var el_cacheCoordinateCorrectionLink = $('#uxLatLonLink'); // Link der den span tag mit den Koordinaten umschliesst (ist parent) (ist nur vorhanden wenn korrigieren der Koordinate existiert)

var elc_coordinate = 'geoMapsCoord';
var elc_coordPopUp = 'geoMapsPopUp';
var elc_widgetBox = 'geoMapsWidget';
var elc_widgetBody = 'geoMapsWidgetBody';
var elc_sidePop = 'geoMapsSidePop';
var elc_sidePopContentBox = 'geoMapsSidePopContentBox';
var elc_sidePopContentBody = 'geoMapsSidePopContentBody';
var elc_sidePopBody = 'geoMapsSidePopBody';
var elc_sidePopTitle = 'geoMapsSidePopTitle';
var elc_calculatorInnerBody = 'calculatorInnerBody';
var elc_calcMapsBody = 'calcMapsBody';
var elc_calcCoordInput = 'calcCoord';
var elc_calcClearInput = 'calcClearInput';
var elc_calcDistBody = 'calcDistBody';
var elc_calcDistInnerBody = 'calcDistInnerBody';
var elc_calcClearDist = 'calcClearDist';
var elc_calcDistCoordInput = 'calcDistCoord';
var elc_calcProjBody = 'calcProjBody';
var elc_calcProjInnerBody = 'calcProjInnerBody';
var elc_calcClearProj = 'calcClearProj';
var elc_calcProjDistInput = 'calcProjDist';
var elc_calcProjDegInput = 'calcProjDeg';
var elc_distClass = 'dist';
var elc_projClass = 'proj';
var elc_selectableCoord = 'selectableCoordinate';
var elc_coordBox = 'coordinateBox';
var elc_sendToCalculator = 'sendToCalculator';
var elc_userSettingsBox = 'userSettingsBox';
var elc_openSettings = 'openSettings';
var elc_mapsTable = 'mapsTable';
var elc_float = 'icoFloat';
var elc_pinned = 'icoPinned';
var elc_pinnedIco = 'pinnedIco';

var pageParserRegExp = /(id="geoMapsCoord\d*">)?\s*([N|S])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d\d\d)'*.*?([EOW])\s*(\d\d*)\s*[grad|°]*\s*(\d\d*)\s*[.,]\s*(\d\d\d)'*\s*/gmi;
var degRegExp = /^(([NS-]?)\s*(\d\d)\s*[°|\s]\s*(\d\d)[.,](\d\d\d))\s*['\u2032]?[\s-:/\\]*(([EOW-]?)\s*(\d{1,3})\s*[°|\s]\s*(\d\d)[.,](\d\d\d))\s*['\u2032]?$/gmi; // DD°MM.MMMM
var swissRegExp = /^(\d\d\d)[\s.]*(\d\d\d)[\s\/]*\s*(\d\d\d)[\s.]*(\d\d\d)$/gmi; // ddd ddd / ddd ddd
var decRegExp = /^(([NS-])?\s*(\d{1,2})\.(\d{1,6}))\s*°?\s*(([EOW-])?\s*(\d{1,3})\.(\d{1,6}))\s*°?$/gmi; // DD.DDDDDD°
var dmsRegExp = /^(([NS-])\s*(\d{1,2})°\s*(\d{1,2})['']\s*(\d{1,2}).?(\d)*['|"|\u2033]+)\s*(([EOW-])\s*(\d{1,3})°\s*(\d{1,2})['']\s*(\d{1,2}).?(\d)*['|"|\u2033]+)/gmi; // DD°DD'DD.DD''
var distanceRegEx = /^(\d+'?\d*[\.|,]?\d*)([m|km]*)/gmi;
var degreeRegEx = /\d*[\.|,]?\d+/gmi;

//region img
var img_coordPopUp = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAAAWdEVYdENyZWF0aW9uIFRpbWUAMTAvMjEvMTAJEOK6AAAB9UlEQVQokWWSTUjTYQCHn/fddJu6lTPUbCgxpCRwCzLq0Bde1qVDXaLIQgIxtGOHOtYp6BBEHTpFCOUhyk3JPhBkmkWkppZL2tS2uTbmNqfuw/3/b4eggx2ey4/n9ntQSrEdUIb/9vd3783faFsVfwVoPz8q3Ye0noIeOpvXo/XLqbVcaNk09rqjccxZnuicGPIeH3g7fV8opejzRnakNkOjtoZ3reaGl1htOeyxFqyTB9ivR1iZneDRcGD4zozyGAF+Rr89OXxqtFU3D9BsbMIx6cTyIw6/n0E2zsjsFlMF2wMA45Wb/muutqkzytLHvqFmnKtlkPVBKghCEds0M5avYNByzAP4jMm16O0GZ0BYdxf44nyDGJc4yi2Um40gJP6QYs/FDWr60yeEAJneWLMnkksE59JEqw1MdxuIoqOVKljJmljYpWFuKSFzOTMg5eLS1oe8bsXtkjjqJHuPCGZ6S8S0Ip8DRWou6SBNZBIyrhS6DAfpetFvzwSXS/wK6IQWFaEtxccLRb47CmxUa7x6bKcYNjwHEEopRNP17qOeqYdXu/xYqhS5dUmZDSJBnXFfNd6njjmZ1t2ami39O07UXu5pPBi+5XIt1tfWrZOMCeanrYX5T1WDZLROpb5mALYl0eGm8twIO08rKtujcLJ3eyJ/AERyEA4mIUEAAAAAAElFTkSuQmCC";
var img_sidePopOpener = 'data:image/png;base64,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';
var img_giszh = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%02%00%00%00%90%91h6%00%00%00%03sBIT%08%08%08%DB%E1O%E0%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%D2%DD~%FC%00%00%00%1CtEXtSoftware%00Adobe%20Fireworks%20CS5q%B5%E36%00%00%00%16tEXtCreation%20Time%0010%2F03%2F10%D9%D9yQ%00%00%00%9BIDAT(%91%B5%92%BB%0D%840%10Dg%ACK%5C%0Ad%A4%B4CJ%1Bt%40M%D0%81i%C5%D9%5E%B0%B0g%96%9F%08%EE%C9%92e%E9%8D%BD%23%99%22%82%02%92%B8%258%BB%AA%E4%0A%00%22%12%9C%0D%A0%AEO.%26%A9%99m%DB%EC%92%94%BC%BD%06NmcY%E8z%BE%E3EZ%07%FB%94%E7q%5C%C3%5D%97%9D%1Dc%F4%A5%CD6%2Cf6%AC%F4%D16%FA%FE%DF%A5s%DE%0D%16%00p%18%00%90%9Cg%E8ROq5~%A5%A7%C9%3F%D54%D7%A5%8F%B6%D1%B6%BB%B1%1F%3E3%00W%F2%0Bp%04%86c%E2S%FA%98%00%00%00%00IEND%AEB%60%82";
var img_swissgeo = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%02%00%00%00%90%91h6%00%00%00%03sBIT%08%08%08%DB%E1O%E0%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%D2%DD~%FC%00%00%00%1CtEXtSoftware%00Adobe%20Fireworks%20CS5q%B5%E36%00%00%00%16tEXtCreation%20Time%0010%2F03%2F10%D9%D9yQ%00%00%02)IDAT(%91M%92%3Bh%14a%14%85%CF%3F%8F%2C%BBKv%13%C7%24%22!M%12T0D%83%C1G%99FBD%5B%0BSI*%C1ho)%24%22AQ%C4%CAN%B4%B0%15L%256vA-%14%F1%01%16F1Yw%93Yvf%FE%F9_%C7b%B2nns%8B%7B%0E%F7%7C%DC%2BH%A2%5B%16%00%40%C0%01!%E0%00%07x%80%07%88%AE%26(%9A%03%98%A4%F8%BD%89%C6%B6%DA%DA%0A%B6%1B%C6%18%0C%D4%EC%E11%7F%F8%90%1D%89%C4%C1!%01x%00H%92%EC%3Cy%D4%5EXPC%91%01%14%A0%01%05(%20%03Tu0%3B%3D%1B%DF%BA%25%5B%0D%92%7B%069%3E)%01%0D8%40F%07%CC%CDey%7B5%3D5%A3%00%0BX%20%07%F4%C6%5B%92%7B%91%C4%60D%7C3%7D%C2)%AA%D11%B1v%C7%88R%D8%DE%F67%DE%09%F8%1A%D6F5%81%3E%14%A9%00%B8%D0%05%80g%3D%13%06%E5%9D%16%E3%C4%07%EC%9F%1D%E3%FB%3A%10%3E%80r%DDV%FA%7B%D0~%A9%E2%82%D0.%DF%C0%F4Q%1B%96%D0W%0E%09%B3%B8h%CF%9E%81N%B9%B2%12%F8%01%AA%15%FC%87VW.%E7%D5j%FE%F1%93%22%0D)I%A3uNJR%93%F2%DC%AC%9C%18O%9A%7F%7B%0C%9C%9A%D6%CF_%F8o%5E%FBq%EC%82%40%9C8%A9B%CF%7C%F9%5E%FE%B5Ie%C5%8F%9F%F9%CClX%AB%F76d%EF%3Fd%FD%83%AAV%CF%A3%A8s%EC%88j5r2%5B%BA%96%D6%07%D4%40%24%81%F4%FECC%92%DC%83%F6%A6%8E%DBK%F3%5E%3Bv%CDf%1F)%EAu%0F%10%95%40%C4%BB%D8mz%C3%23%C1%C2%7C%F1%11%5D%83%EF%FB%D7%97e%A9%E4%01%94%DA%3D%7D%C6W%2F%BD%AF%9F%8B%B1%5B%BA*%26%C6%BB%E9%F7U%F2%F8A%02%A4%00%8BK%01%12H%E6%CF%EBN%9C%D3%D1%B1wi%92t%CE%92%ED%BB%AB%1D%3FP%40%0E%A4%40%E7%E2%85%B4%D1%C8H%AD%F3B%D53XR%3Bj2__%8F%E7%E6%92%C9I%B3vO%25%1DE%A6Y.%B5v%24I%B1%FF%BD%E9%00%0F%02%90%AD%A6M%B3%EA%E8(%01Q%C4%16%A2%E0%F9%07e%8Bs%CF%AF%5C%9Bo%00%00%00%00IEND%AEB%60%82";
var img_swissmap = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%02%00%00%00%90%91h6%00%00%00%03sBIT%08%08%08%DB%E1O%E0%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%D2%DD~%FC%00%00%00%1CtEXtSoftware%00Adobe%20Fireworks%20CS5q%B5%E36%00%00%00%16tEXtCreation%20Time%0010%2F03%2F10%D9%D9yQ%00%00%00%A6IDAT(%91%85R%B1%0E%85%20%10%2B%C6%04%CF%E99%F0%FC%FF%BF%F3%60%F0m%84%897%9C%9E(%01%3B%40%A9%D7%B4%B9hp%22%A5%846%AC%B5BF%95r%CE%1D%83%C2%C8%15c%7C%1D%25%22%00C%EB%F3D4%11%D5%FA%D8%EFS%EB%CD%84%16%8E%04Y%D1gY%00%FC%F6%1D%80%B4%A1yV%E5%96%90R%92i%B1%3DV%5C*%CFJ%BCm%9D%E7U%C9%18%03%C03%9B%F3%2C%F5%92%DC%12%BE%EB%AAg%0B%87A%D7'%D3%FA%AC%C9%A0%89%9EY%B8g%AE%9B%5CD%AE%10B%A7%86%C09w%19%5E%3D2%8D%F2o%D5%D0%3E%FE%3D%A7D%C4%CD%BB%D9%FF%00%00%00%00IEND%AEB%60%82";
var img_mapplus = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%02%00%00%00%90%91h6%00%00%00%03sBIT%08%08%08%DB%E1O%E0%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%D2%DD~%FC%00%00%00%1CtEXtSoftware%00Adobe%20Fireworks%20CS5q%B5%E36%00%00%00%16tEXtCreation%20Time%0010%2F03%2F10%D9%D9yQ%00%00%02%82IDAT(%91%95%D0Oo%0Cq%18%07%F0%EF%F3%EC%CC%CEt%FBOK%8B%E9%D2F%B3-)%9A%AAHH%10%11%2F%C0A%2F%82H%1C%FC%8F%13%E1%A6%07%17%BC%01%0E8%8A%3A%92%20N.%84p%10%F5%B7%5B%C9v%BB%BB%DDm%B6vg%3A%BB%3B%BFy%1E%07%AF%C0%E7%25%7CHD%00R%15%02%13%2B%40%C6%08%14%CC%AAP%10'%98%01%C4%C6(%C8%B2%12%0C%00%A4%C4L%8C%95*e%E7WE%20bL%D4%22%E5%04s%A1%20ss%81HBU%00%40DTUU_%BD.NN%3E%9D%18%BF%95%CF%97%22%13E%26%0EC%BD%7F%2F%9F%19y%B4g%F7%DD%C5%BCo%E2%A6%AAZ%04j4%1A%0F%1E%BE%BFr%E5K%AB%19vufW%FD%A6%E5Y%C5R%F3%D2%C5733%3EP%1F%1A%CC%87%8D%C8D%9Cp%C0%20%BC%7C%F1%A1%B0X8yb%1C%B0%D6o%F0%FA%FA%BBs%B9%E0%D4%A9'%83C%CE%993%13%40%233%EAut8%81%EF%03%60%11%9D%DC%BD%7Dz%FA%D8%CE%B1v%A0%3A%92%D9T%A9%D8'%8E%3F%9A%DC%B5%F9%CE%ED%FD%9E%17%03%C5%A1%C1%5E%B7%8D%83%B0%01%C0R%D5%81%815%00%3E%CF%E6%01%B3%C1%1B%BD~cfxx%E0%FC%D9%89o%B3%B5O%1F%B3%00%A5%D3k%C3F%F0o%88%01Um%19%83%A52%03x%FE%EC%A7%88%7D%E1%F2%B6R%E5g%B1%2C%DF%BE%2FXV%FB%96%E1%BE%C0_q%9D%14%00V%80H%ABU%2C%16%BA%808%0C%BF%9C%3E%BD%87P5-S%AE%F0%DC%7C%A9%B7G%87%B7%AC3%AD%C0N%B6%01%60%B0%02%5C%5E%92%7C%0E%80LM%ED%CAd%E8O%AD%96%B0%9D%1F%3F%8C%18%E9%E9i%A6%D3k%9C%B6%04%B3%0D%80I%09%B0%0A%C5%E5R%B1%EC%BA%5D%07%0F%8E%C4q%5D!V%D2%F9%95%F5%01%3B%9D%DE%18E%1D%F3%D9%80%99%010%13%01%94%CB%99X%96%3CO%B6%8Fy%AB%C1%AA%CD%96k%3B%F9%85%3A%D0%3B%FB%B5p%F5%DA%E3%E2%121%13%00%260%80w%EF%BE%02ow%8C%A5%FA%D7w%0B8%99L%3AI%A7%B6R%04%16%97%97s%7B%F7e%0E%EC%1F%25%16%00%16%08%F5zh'%7FO%DF%3Cv%F4%E8D%D8%A8%BA%8E%2B%B1%25%1A%1D9%DCJ%B9z%EE%FC%D5C%87%B6FQ%D5%B6%3A%01%901q%14%A9%89%9A%1D%9D%A9%C0%F7%CB%95rd%8C%88%40%D1%9E%EANX%B6%DBF%F5zm%DD%DA%FET*%05%80T%15%FF%E3%2F%D6%A0GR%E9(.X%00%00%00%00IEND%AEB%60%82";
var img_stadtplanzh = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%02%00%00%00%90%91h6%00%00%00%03sBIT%08%08%08%DB%E1O%E0%00%00%00%09pHYs%00%00%0B%12%00%00%0B%12%01%D2%DD~%FC%00%00%00%1CtEXtSoftware%00Adobe%20Fireworks%20CS5q%B5%E36%00%00%00%16tEXtCreation%20Time%0010%2F03%2F10%D9%D9yQ%00%00%02%DCIDAT(%91%05%C1%5DoSe%1C%00%F0%E7%FF%7F%9E%E7%BC%F5%F4%F4%CC%9E%B1%AD%DD%98%AC%DB00'%98a%04%5D%08%04%BCP%C2%05p%81%F7%DE%99%C8%B5_%80%0F%40b%E2%170%A2xgXP%02!f%18H%20H%B6%B1%B1%D1%B5%AC%EBhW%D6%D3%F69%7D9%AF%8F%BF%1F%8C%5D%BCE%08H)9c%94b%22%09%01%40%00%8AH%10%18E%8A%10'%04)2J%01%80I)%3B%3D%3FIdJW%A3X%C61%E1%9CR%04I%802%1A'%89e(A%94D%09%B1MMS9%F3%BA%E1W%9F%7Fx%EAx%EE%D7%7B%1B-%CF%3Fw%EA%B0%CAY%14K%CEAJ%D8%DEm%17%AB%9D%AB%E7fF%86%CD%DF%FF%DE%0A%A2%84%15%C6%ED%93GG%BF%BBrB%D7%B8%C2%E8%B5%0BG%AB%FBB%02%98%86%12%86Q%DF%8Fo%FF%F5%FA%C6%B7%9FV%EA%E2u%A9%F9x%A5%06%97o%DC%C9%DAz%E9%AD%7B%FD%D2%F1%8F%26%B3~%18u%BA!E%24%40%0C%8DeL%E5%A0%E3%FF%F9O%B9%E5%0Df%26%EC%DF%1E%14q%AD%F8%DE%B1%0D%D1%0Fv%EB%22J%92%F5rs%A5%D8%D8w%7B%F5f%B7%B8%DBZ%2F%BB*g%2F%B7%1AGr%99%F2%9EG%24%A1S%0B%D7%CE.L%7C6%97%9F%2B8Y%5B%CF%0F%5Bw%97KK%8FK%F5f%BFR%13g%E6s9%C7%9C%181%A7'%EC%96%08%D6JM%D4U%C6%10%0F%8FY%D5%86x%5B%13%F9C%E6%D5%F3%B3%A2%17%DC%5DZ%7FSigL%F5%D9%AB%FAH%D6P%15j%E8TJ%89ov%DC%FC%A1%F4%CC%A4%FDl%BD%F6%CB%D2%DAF%B9Y%18%B7n~%BFxdvX%F4%83%A7%AB%B5%3F%1En%22%E0%C7%05%A7%BA%DFM%A4D%CE%B1%ED%0D%DA%5Epl%CA%D9%DAq%5D1x%BAZ%FBdv%F8%E6%0F%8B%F33%CE%93%95w%1Fdt%DBT%DD%8E%1F%C5%92%10B%ED%E9%AF5%85%05A%3C9%9Aiy%C1%C2%B1Q%CBP%F7%DD%DE%FC%B4%B3xr%7Cm%FB%E0%CB%13%F9%5E%3F%7CU%3A%F8o%F3%7D%DB%0B%B0%DA%10%CE%901di%AB%DB%8Do%BE%98%DA%AD%7Bf%8A%2B%8CV%EA%82R%3C%3D7%96N)%1B%3B%EE%EC%E4P%BB%EB%13%02hh%DC%D0%D8%A3%E7%95%9F%EF%BC%D4Tz%EF%DF%D2%93%D5w%DDA%D0%12%C1%8F%3F-%07q%BC%FC%A2z%FB%FEV%7F%10%0EY%1A%91%04r%17nI%20%9C%D2%96%F03%96%E6%F5%23D%2C%E42%ED%5E%B4w%D0%CD%3B)%AF%1Fi%1A%D3U%96H%A0%88%0C%00%BA~H1%C9%DA%BA%DB%09%D2%A6%12%C5d%B3%E2r%C6%C7%B2%86%E8%85%BA%CA8%C5%96%08%D2)%15%80%B0DJS%E7H%20N%A4m)%04%903H%E9%0C%11%09!%E9%14%07%02%00%C4N%2B%84%80%94%E4%7F%C0%1E%5BtQ%F2cG%00%00%00%00IEND%AEB%60%82";
var img_google = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAA3NCSVQICAjb4U%2FgAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M1cbXjNgAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMC8xNC8xMHluaFgAAAK%2FSURBVCiRBcFbaFxVFAbgf619zplLJpeZzKQT2troRBqUPLQRhSANWG0LXkEpPqgtCG3BJ%2Fva1yp9EQQRofWCL7GoICKIQQpCbb3gLbXG6BQa0iRTp9N0Jp3bOXvvtfw%2BxHFsnf5SXZ04Mh889fGbny96dXHrzsW52b8ICbMHPLhL2ATiOGbDkTE4fX5ppT8q2x488%2FWt67VuNDg48%2B65wkDWiBAZkAAQBLVMik0A79zV%2FwS5YTFmqxd%2B8tMKYNJTD8SzjzqQsHegRI2SUwGrIKBg20iaE2HETObqdQdyZOAHsxbGCAJlQz5RWDYBsQA4OF289HctSOVFYuZAYDhGfWl5fZzvDObDBGPNdmnLWvXBtdVm5Z7CsUOT8xdvLN9sDWXk6NwOAp1deP%2F0wf6N%2B%2FcYiryXTNfuudZ77vIq7X7lozeOPvL83FSzY7%2F8dX22MlzZmT%2BzcO7Uz%2B%2BY8jBEvXiAyZJySG1DpcPnbdzeO5F9bKZ86qV9IP2u%2Btv%2BDw7L5BiEQaAkBKDWkQvhiAsmyUXpy9X%2BW%2FP%2FrtQ7qua%2BwvbJyl7EfRZmHygciRJCApQTts3Gjkz8zEPFlw9NNbe8EnaOjl968eyB4j7ttkUJaoSggChgQ5r%2F9o8nZqZH8%2BxaS5u3q92tjfHJF9K5kvXu2U9PflO7oNEQvGEr4g08SL22G4vVH07kcSUIuxpz205t3%2F%2FFUKGyXF97%2BMMjd7OJcUY9iSM4cCydfy4cvzf4cVepXx7KFkdSRVqqf%2F%2B6gncXd5UHxhBbTyoeoQvJIUha9ZxbS4cjd9uOnBGPbKbg%2B%2BtkOz0e6Lc7oJBdJGS9ehXlzMhEqvR4Z9NpP6s%2BCijneyY1%2FrRGua9%2BX9ho1cgzeUGPJRFIRI1GYziN5uLbQetPtl0J06nyATP96vLGzSffe22NbzEPCAjqoGHj5Gf%2FA78Qak99%2FlKMAAAAAElFTkSuQmCC";
var img_geocaching = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAA3NCSVQICAjb4U%2FgAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M1cbXjNgAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMC8xNy8xMGvbx7YAAAKLSURBVCiRPZFNiFVlHMZ%2F%2F%2Fe859yPc8%2FxznRtZDCaUgcNMlOHrFSESaKImEW4CNq00EU7W7QWJLCPRSGURAuJoixaBK1ahhBGVEKjqQ0zOoiMc%2B3O8V7vPe95P1qMtn14Hp4vMbfHi756aKq7NN95dPrf%2FmreSguyi4vDydd%2FfivyShAggIBWWks6%2BOnHrXuK5nffT%2Bx%2BqtWou4Mv3IFAFap%2B5cYSsQ4TEAEAZcpkLGue%2BnD78nL1y6%2FZwcPXKQHFqhkc%2F718%2F29uGGIl921Qzfrwmf2XXpyd%2F%2FJbe%2FVauHy5TQsIdJL6m1tC17Bwj4YKkYAAmipqP9z%2F6tzUmY960zuGc3NbPz9z5flZi0YdGEue6xBgcSSRCh2NR5PYwa3GwmI8s6d4%2FMnis9O1tV4GigADFyKkqc3XN4J1tXe2Y9BErrhremulSJ%2BSA4dvAhB8CAM31D6i0n5vc%2FTp1XR1c5XHEsJ5rJ6%2FsuGJbXeJy%2FWgsGvka5cGywIImOAXBzKVqpqS87crwXdWF3rZpKmneA%2FsGo9TMfSWWK%2BqhEQxcnglnP0BeOzE8e7%2B2eLl1xj0ce63I6%2FsjlbMN6%2BOnDZeKeGe8bGS8TxWNR2Rpnbm2c0XLwiORBNrJSCSZOkXf%2Bh9HxQz760dO%2Be6thnVGxqgLFcOvVTs3BsQ6g2s%2B%2F%2FXdp2lbnXsUPvduTSveWNQAM6WeXttx85s6dr0xyfzPy%2BId4jgwuSG6NSRidNvtLIYU4nIugDBO0Yj28pcrb7p7CeNWzfRcXBM5OrpR2Ksr9y6JTrwYElbDdudf46%2BHd%2Fplhs3YXvOszENf62Av88OoPNYG%2F8AgOCsbY%2F5JCHgdTPP9L4tkRUnsQSCKP0fTCkdOmOVYJ8AAAAASUVORK5CYII%3D";
var img_popFancy = "data:image/png;base64,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";
var ico_sendto = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAAB50RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNS4xqx9I6wAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMS8xMS8xMZ/Ao0gAAAHESURBVCiRhZKxaxNhHEDfL/kSTC45pAoH0UqaXhRcWqyDwaFLh5pE4iARxEVwFNK61c2/IOno4iIo7aYJ3US6GAQVa8AK11i1piZq2/RKeo2J/Vwqiovz2957orUGIDs9exq4DVwAooAAbeA+cKdSLGwDiNaa7PRsRkRKCdtpjIxVk6bZiQG4rrH++kXKWa0nR7XWuUqxsCiZqdKwiFTTubm2Ze0mg34T5QsB0N/3+PHTpdUKOwuPrvS11lkFzAwNO28ta3e8Wc7zZKFMICAA9Ho9JtJ5rIvzyYTtLNYd+5YC8qNnqztBv8m72hvGJybxvA4ghMJhlmtLDF4yGRmrJuuOHVdAxDQ7UeU7ihGJYB07TmdnGxEf4ahBY+0jyhfCNL/GAE8d2ABARFBK4VcBRMDvU8gfDKAV8MV1DX1owIu1Nzb4tFqn291DEILBAO2tTfr7Hq5rrAOe/+S5yVPdPUMG4048efgG5fmHfGs1aTY+82HF4fK16/Stpzx/dv7V1ubAY8lMlSwRWU7n5r7/R6uhtT7zO1xKRO4lbKf1b7illynn/Yp9RGuuVoqFmvy1xhBw82CNE4APaAIPgLuVYmEN4BcYkMF5tZkE1wAAAABJRU5ErkJggg==";
var ico_geoMapsPlanner = "data:image/png;base64,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OlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz5A3qMcAAABiUlEQVQ4ja2TTyjDYRzGnznstNPUymn1XfFOmatSbCWX3yIpO8jFiVIUDtOcVpQU2sEcKWkHLRKFKFFcHLCtzS4/F6V+u2yH2cHjwv4ZyjzX5/0+fd/n874mkkQdaqhnuHbA6xNutubhc7fD6XDA4XCi3e3DzMY5nl6/BpgqrvB8jLnhSUT0AmC2wGa1oAFvyGVekCsAZrsPa9sL6G0qS+Cn8rdc0RRFFLXgCdNZlmQkeRjUqESotBXe5ktWMeAxPEARYVfwkiU/y4dIgIMdU4wyz8tgF0WEA+HH6oAYQ5pQ1Ch3jPJBRRGhyASjJGnscFQJRQsx9hHwUWIKyQQAextarQBwirD/AtlGM8zljVlb0WYHkEgi9S2FolwYP7jC0VIfbL9jbEaLE4B+j3jm07rDurcT3mUD/atj6AGATBz3OgBnC5qrKVSWGOVUxwgX9x9YgvFjiZUYPbO7TJZjzKa55/fUxPiPD6m4ic7rzQCHul1UIhRRdHUPcTp8Rj3/5XTVBn9Q3b/xHfmgeqmHdYSkAAAAAElFTkSuQmCC";
//endregion img

var ico_home = GM_getResourceURL("home");
var ico_float = GM_getResourceURL("float");
var ico_dist = GM_getResourceURL("dist");
var ico_proj = GM_getResourceURL("proj");
var ico_close = GM_getResourceURL("close");
var ico_setting = GM_getResourceURL("setting");
var ico_pinned = GM_getResourceURL("pinned");

var img_outdooractivemap = GM_getResourceURL("outdooractivemap");



var html_coordDec = '{0}';
var html_coordSwiss = '{0}';
var html_coordDeg = '{0}';
var html_coordDms = '{0}';

var html_coordinateWrapString = '&nbsp;<span id=\"' + elc_coordinate + '{0}\">{1}</span>&nbsp;';
var html_coordinateWrapStringMaster = '<span id=\"' + elc_coordinate + '{0}\">{1}</span>';
var html_popUpImage = '{2}<img class=\"' + elc_coordPopUp + '-target\" src=\"{0}\" id=\"' + elc_coordPopUp + '-target-{1}\" hspace="3">';
var html_popUpDiv = '<div class="' + elc_coordPopUp + '-content fancy" id="' + elc_coordPopUp + '-content-{0}"></div>';
var html_selectableCoordsBox = '<div id="{0}" class="selectableCoordsBox" style="padding-left: 0px;">{1}</div>';

var html_sidePopDiv = '<div style="z-index:9999" id="' + elc_sidePopContentBody + '" class="' + elc_sidePopContentBody + '"></div>';
var html_sidePopBodyDiv = '<div style="z-index:1" id="' + elc_sidePopBody + '" class="' + elc_sidePopBody + '"></div>';
var html_sidePopTitle = '<table border="0" cellspacing="0" cellpadding="0" id="' + elc_sidePopTitle + '" width="100%"><tr><td valign="middle" width="190">'+
    '<div class="sidePopTitle">'+languageString.CalcTitle+'<div></td><td valign="top" id="'+elc_pinnedIco+'"></td><td valign="top"><img src="'+ico_setting+'" border="0" id="' + elc_openSettings + '"></td></tr></table>';

var html_calcCoordInput = '<table width="100%" border="0" cellspacing="0" cellpadding="0">'+
    '<tr>'+
    '<td><input type="text" class="calcInput calcCoord" id="' + elc_calcCoordInput + '" /></td>'+
    '<td><img src="'+ico_close+'" border="0" id="' + elc_calcClearInput + '" style="padding-top:4px"></span></td>'+
    '</tr>'+
    '</table>';
var html_mapsInnerBody = '<div id="' + elc_calculatorInnerBody + '"></div>';
var html_distInnerBody = '<div id="' + elc_calcDistInnerBody + '"></div>';
var html_projInnerBody = '<div id="' + elc_calcProjInnerBody + '"></div>';

var html_extendetCalculation = '<table width="100%" border="0" cellpadding="0" cellspacing="0">' +
    '<tr>' +
    '<td width="16" valign="middle"><img src="'+ico_dist+'" border="0" class="' + elc_distClass + '"></td>' +
    '<td width="60" valign="middle"><span class="' + elc_distClass + '">'+languageString.CalcDistBtn+'</span></td>' +
    '<td width="16" valign="middle"><img src="'+ico_proj+'" border="0" class="' + elc_projClass + '"></td>' +
    '<td  valign="middle"><span class="' + elc_projClass + '">'+languageString.CalcProjBtn+'</span></td>' +
    '</tr>' +
    '</table><br />';

var html_sendToCalculator = '<div style="padding-top: 0px; padding-bottom: 10px;"><table width="100%" border="0" style="padding:0px;"><tr>' +
    '<td width="12px"><img src="'+ico_sendto+'" border="0" id="i' + elc_sendToCalculator + '{0}"></td>' +
    '<td><div id="' + elc_sendToCalculator + '{1}" style="padding-left:2px; padding-bottom:2px;">{2}</div></td></tr></table></div>';

var html_sidePop = '<div id="' + elc_sidePop + '" style="display:none;"><table width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td width="25" valign="top">' +
    '<img id="' + elc_sidePop + 'Opener" src="' + img_sidePopOpener + '" width="25" height="140" align="left" /></td><td valign="top">' +
    '<div style="min-height:12px; text-align: left;"></div>' +
    '<div style="background-color: #ffffff; border:1px solid #afafaf; min-height:128px; text-align: left;" id="' + elc_sidePopContentBox + '"></div></td></tr></table></div>';

var html_donation = '<div id="donation" style="padding-top:15px;"><div style="padding:5px; background-color: #DFF0AF; line-height: 1.3em; border:1px solid #9FB659; color: black; ">'+
    '<b><a href="'+donationLink+'" target="_blank" style="color: black;" class="lnkGeoMaps">'+languageString.Donation+'</a></b></div></div>';

var html_settingsBox = Core.Format('<div id="' + elc_userSettingsBox + '"><table width="100%" border="0"></table><br/></div>',languageString.SettingsTitle);
var html_settingsBoxLineTitle = '<tr><td></td><td class="fontTitle">{0}</td></tr>';
var html_settingsBoxLine = '<tr><td><input type="checkbox" id="{0}" /></td><td>{1}</td></tr>';
var html_settingsBoxSubLine = '<tr><td></td><td><input type="checkbox" id="{0}" /> {1}</td></tr>';
var html_settingsBoxInputLine = '<tr><td><input type="checkbox" id="{1}" /></td><td><input id="{0}" type="text" size="30" class="setCoordFormatInput" /></td></tr>';
var html_settingsBoxLineText = '<tr><td></td><td>{0}</td></tr>';
var html_footerLink = Core.Format('<div style="font-size:10px; padding-left:2px; padding-top:5px;"><a href="{0}" target="_blank" class="lnkGeoMaps"><img width="12" heigth="12" src="{3}" border="0" style="vertical-align:text-bottom"> {1} {2}</a></div>',projektHomepage, appName, versionsNummer, ico_home);

var html_selectableCoord = '<input id="' + elc_selectableCoord + '{0}" class="selectableCoord" type="text" value="{1}" /><br />';
var html_selectableCoordHeader = '<input id="' + elc_selectableCoord + '{0}" class="selectableCoordHeader" type="text" value="{1}" /><br />';

var html_calcDistanceResult = '{0} : <span class="fontTitle">{1}'+languageString.SymbKm+'</span><br>{2} : <span class="fontTitle">{3}</span><br><br>';
var html_calcMapsBody = '<div id="' + elc_calcMapsBody + '"></div>';

var html_calcCoordDistanceBox = '<div id="' + elc_calcDistBody + '"><table width="100%" border="0">'+
    '<tr>'+
    '<td><input type="text" class="calcInput calcCoord" id="' + elc_calcDistCoordInput + '" /></td>'+
    '<td><img src="'+ico_close+'" border="0" id="' + elc_calcClearDist + '" style="padding-top:6px"></td>'+
    '</tr>'+
    '</table></div>';

var html_calcCoordProjInput = '<div id="' + elc_calcProjBody + '"><table width="100%" border="0">' +
    '<tr>' +
    '<td valign="middle" width="70"><input type="text" class="calcDistInput calcDist" id="' + elc_calcProjDistInput + '" /></td>' +
    '<td valign="middle" width="40">'+languageString.SymbKm+'</td>' +
    '<td valign="middle" width="40"><input type="text" class="calcDegrInput calcDegr" id="' + elc_calcProjDegInput + '" /></td>' +
    '<td valign="middle" width="10">'+languageString.SymbGrad+'</td>' +
    '<td valign="middle" align="center"><img src="'+ico_close+'" border="0" id="' + elc_calcClearProj + '"  style="padding-top:6px"></td>' +
    '</tr>' +
    '</table></div>';

var html_infoCoord = '<small>{0}: {1}</small><br />';
var html_mapsLineTable = '<table width="100%" border="0" id="'+elc_mapsTable+'{0}" class="'+elc_mapsTable+'">{1}</table>{2}'
var html_mapsLine = '<tr><td width="24" class='+elc_mapsTable+'><a href="{0}" class="lnkGeoMaps" id="lnkGeoMaps{4}" target="_blank"><img src="{1}" border="0"></a></td><td class='+elc_mapsTable+'><a href="{2}" class="lnkGeoMaps" id="lnkGeoMaps{5}" target="_blank">{3}</a>{6}</td></tr>';
var html_mapsLineJson = '<tr><td width="24" class='+elc_mapsTable+'><img src="{0}" class="{1}"></td><td class='+elc_mapsTable+'><span id="{2}" class="lnkGeoMaps">{3}</span></td></tr>';
var html_mapsLineJsonBeta = '<tr><td width="24" class='+elc_mapsTable+'><img src="{0}" class="{1}"></td><td class='+elc_mapsTable+'><span id="{2}" class="lnkGeoMaps"><b>{3}</b></span></td></tr>';
var html_mapsLineJsonForm = '<form target="_blank" method="post" id="{0}" name="{1}" action="{2}"><input type="hidden" id="{3}" name="{4}" value="" /></form>';
var html_mapsLineExt = ' | <a href="{1}" class="lnkGeoMaps" id="lnkGeoMaps{0}" target="_blank">{2}</a>';
var html_mapsLineExtGoogle = ' | <span class="submitParams{0} lnkGeoMaps">'+languageString.MapsGoogleCalc+'</span>';

var html_ico_float = '<img src="'+ico_float+'" border="0" style="padding-right:5px;" id="' + elc_float + '" class="' + elc_sidePop + 'Opener">';
var html_ico_pinned = '<img src="'+ico_pinned+'" border="0" style="padding-right:5px;" id="' + elc_pinned + '" class="' + elc_sidePop + 'Opener">';

GM_registerMenuCommand("GeoMaps - Einstellungen zurücksetzen", function() {
    UserSettings.Delete();
    // GM_setValue('SUC_reminder_close', false);
    // GM_setValue('SUC_current_version', 0);
    var keysToKeep = ['a','foo','bar'];
    var keys = GM_listValues();
    for (var i=0, key=null; key=keys[i]; i++) {
        if(keysToKeep.indexOf(key) >= 0) {
            continue;
        }
        GM_deleteValue(key);
        console.log("delete:" + key);
    }
});

Core.AddCSS('.reset,.reset div,.reset dl,.reset dt,.reset dd,.reset ul,.reset ol,.reset li,.reset h1,.reset h2,.reset h3,.reset h4,.reset h5,.reset h6,.reset pre,.reset form,.reset fieldset,.reset input,.reset textarea,.reset p,.reset blockquote,.reset th,.reset td {margin:0;padding:0;}');
Core.AddCSS('.reset table {border-collapse:collapse;border-spacing:0;}');
Core.AddCSS('.reset fieldset,.reset img {border:0;}');
Core.AddCSS('.reset address,.reset caption,.reset cite,.reset code,.reset dfn,.reset em,.reset strong,.reset th,.reset var {font-style:normal;font-weight:normal;}');
Core.AddCSS('.reset ol,.reset ul {list-style:none;}');
Core.AddCSS('.reset caption,.reset th {text-align:left;}');
Core.AddCSS('.reset h1,.reset h2,.reset h3,.reset h4,.reset h5,.reset h6 {font-size:100%;font-weight:normal;}');
Core.AddCSS('.reset q:before,.reset q:after {content:"";}');
Core.AddCSS('.reset abbr,.reset acronym {border:0;}');
Core.AddCSS('.' + elc_coordPopUp + '-content {font: 10px "Verdana"; text-align:left; margin-left:10px; display: none; position: absolute; padding: 10px; border: 1px solid; border-color:#826f00; background-color: #ffffd2; z-index:999; color:black;}');
Core.AddCSS('.' + elc_coordPopUp + '-content table, .' + elc_coordPopUp + '-content td {margin-bottom: 0.0em; line-height: 1.0; padding:1px;}');
Core.AddCSS('#' + elc_widgetBox + ' { margin-top: 1.5em; }');
Core.AddCSS('#' + elc_widgetBody + ' table, #' + elc_widgetBox + ' table {margin-bottom: 0; line-height: 1.0; }');
Core.AddCSS('#' + elc_widgetBody + ' td, #' + elc_widgetBox + ' td {padding: 0px; font-size:10px;}');
Core.AddCSS('#' + elc_sidePopTitle + ' { margin: 0px }');
Core.AddCSS('.' + elc_distClass +' {} ');

Core.AddCSS('.calcInput {font: 12px "Trebuchet MS";width:180px; height:20px}');
Core.AddCSS('.calcCoord {border:1px solid #ddd; background-color: #ffffff;}');
Core.AddCSS('.calcCoordOk {border:1px solid #ddd; background-color: #d0ff8a;}');
Core.AddCSS('.calcCoordNoOk {border:1px solid #ddd; background-color: #fff0f3;}');
Core.AddCSS('.calcDistInput {font: 12px "Trebuchet MS";width:65px;}');
Core.AddCSS('.calcDist {border:1px solid #ddd; background-color: #ffffff;}');
Core.AddCSS('.calcDistOk {border:1px solid #ddd; background-color: #d0ff8a;}');
Core.AddCSS('.calcDistNoOk {border:1px solid #ddd; background-color: #fff0f3;}');
Core.AddCSS('.calcDegrInput {font: 12px "Trebuchet MS";width:32px;}');
Core.AddCSS('.calcDegr {border:1px solid #ddd; background-color: #ffffff;}');
Core.AddCSS('.calcDegrOk {border:1px solid #ddd; background-color: #d0ff8a;}');
Core.AddCSS('.calcDegrNoOk {border:1px solid #ddd; background-color: #fff0f3;}');
Core.AddCSS('.setCoordFormatInput {font: 10px "Trebuchet MS"; width:165px; border:1px solid #ddd; margin-top:3px; background-color: #ffffff;}');

Core.AddCSS('.coordWrap { background-color: #ffffa1;  border-bottom: 1px dashed #d1d200;  border-top: 1px dashed #d1d200; }');
Core.AddCSS('.coordWrapCorrected { background-color: #ffe6dd;  border-bottom: 1px dashed #D7B9BE;  border-top: 1px dashed #D7B9BE; }');
Core.AddCSS('.hoverButtons {color: orange; text-decoration: underline;}');
Core.AddCSS('a.lnkGeoMaps, .lnkGeoMaps {color: black; text-decoration: none;}');
Core.AddCSS('a.lnkGeoMaps:hover, .lnkGeoMaps:hover {color: orange; text-decoration: underline;}');

Core.AddCSS('.selectableCoordsBox {padding-left: 0px;padding-top: 10px;padding-bottom: 10px;}');
Core.AddCSS('input.selectableCoord {border: 0px dotted #4682b4; width:195px; font: 10px "Verdana";}');
Core.AddCSS('input.selectableCoordHeader {border: 0px dotted #4682b4; width:215px; font: 10px "Verdana"; background-color: #f0edeb;}');

Core.AddCSS('.fancy {background: url(' + img_popFancy + ') no-repeat;background-color: white;padding-left: 30px;padding-top: 5px;border: 1px solid black;}');
Core.AddCSS('#'+elc_userSettingsBox+' {background-color: #ffffb0; padding:0px;padding-bottom:15px; font: 10px "Verdana";}');
Core.AddCSS('#'+elc_userSettingsBox+' table td { padding:1px; }');
Core.AddCSS('.fontTitle { font-weight:bold; font-size:110% }');
Core.AddCSS('.sidePopTitle  { font-weight:bold; font-size:120%; margin-bottom:15px }');

Core.AddCSS('.edit-cache-coordinates_no { color: #000000 !important; padding: 2px 20px 2px 0; text-decoration: none;}');
Core.AddCSS('.myLatLon_no { border-bottom: 0px !important;    font-style: normal !important;}');

Core.AddCSS('div.'+elc_sidePopContentBody+' { padding: 10px; font: 10px "Verdana"; line-height: 1.0; color:black; }');

Core.AddCSS(Core.Format('.sidePop {position:fixed; right: 0px; top: {0}%;	width:25px;	height:115px;	z-index:999; vertical-align: top; font-size: 100%; line-height: 1.0;}', currentUserSettings.OptionList.Position));
Core.AddCSS('.sidePop table td {padding: 0px; vertical-align: top;}');
Core.AddCSS('.sidePopExpanded table td {padding: 0px; vertical-align: top;}');
Core.AddCSS(Core.Format('.sidePopExpanded {position:fixed; right: 0px; top: {0}%;	width:250px; height:115px;	z-index:999;}', currentUserSettings.OptionList.Position));

Core.AddCSS('div.'+elc_sidePopContentBody+' table {margin-bottom: 0px;}');

Core.AddCSS('table.'+elc_mapsTable+' {line-height: 1.0; padding:0px; vertical-align: middle; margin:0px}');
Core.AddCSS('table.'+elc_mapsTable+' td.'+elc_mapsTable+' { padding:1px; vertical-align: middle; }');

var modeDist = false;
var modeProj = false;
var widgetExpandet = false;
var distExpandet = false;
var projExpandet = false;
var currentUserSettings;
var setupExpandet = false;
var cacheCoordinate = el_cacheCoordinate.text(); // Cache-Info Bereich Startkoordinaten-String
var hasCorrectedCoordinates = false;
var pinned = false;

var mapLinks=new Array();
mapLinks[0]= 'http://maps.google.com/maps?q={0},+{1}+%28GeoMaps+:+Wegpunkt%29&iwloc=A&hl=de&ll={2},{3}&z=16';
mapLinks[1]= 'http://map.geo.admin.ch/?crosshair=circle&zoom=10&X={0}&Y={1}';
mapLinks[2]= 'http://www.mapplus.ch/frame.php?map=&x={0}&y={1}';
mapLinks[3]= 'http://map.search.ch/{0},{1}';
mapLinks[4]= 'http://www.geocaching.com/map/default.aspx?lat={0}&lng={1}';
mapLinks[5]= 'http://geomapsweb.c-dev.ch/fragments/index.php';
//mapLinks[5]= 'http://localhost/GeoMapsWeb/GeoMapsPlanner.php';

$(document).ready(
    function() {
        // unsafeWindow.console.clear (); unsafeWindow.console.log ("start");
        // InsertAlert();

        if (el_cacheCoordinateCorrectionLink.children('span:first').attr('class') == 'myLatLon' && currentUserSettings.OptionList.HighlightCoordinateMaster) {
            el_cacheCoordinateCorrectionLink.removeClass('edit-cache-coordinates').addClass('edit-cache-coordinates_no');
            el_cacheCoordinateCorrectionLink.children('span:first').addClass('myLatLon_no');
            hasCorrectedCoordinates = true;
        }
        else {
            hasCorrectedCoordinates = false;
        }

        if (currentUserSettings.OptionList.HighlightCoordinateMaster && !hasCorrectedCoordinates) {
            el_cacheCoordinateCorrectionLink.removeClass('edit-cache-coordinates').addClass('edit-cache-coordinates_no');
        }

        // ParsePageCoords();
        // InsertCalculator(el_widgetBox);
        InsertCoordsPopups();
        ExtendCacheInfo(el_cacheInfoArea);

        $('#' + elc_sidePop).mousemove(function() {
            showCalculator(true);
        });

        $('#' + elc_sidePop).mouseout(function() {
            showCalculator(false);
        });

        pinSidePopAddHandler();
        $('#' + elc_sidePop + 'Opener').click(function() {
            if (!pinned) {
                showCalculator(true);
                pinned = !pinned;
                $('#' + elc_pinnedIco).html('');$('#' + elc_pinnedIco).append(html_ico_pinned);Core.AppendLinkCursor($('#'+elc_pinned));
            }
            else {
                pinned = !pinned;
                showCalculator(false);
                $('#' + elc_pinnedIco).html('');$('#' + elc_pinnedIco).append(html_ico_float);Core.AppendLinkCursor($('#'+elc_float));
            }
            pinSidePopAddHandler();
        });

        setTimeout(function() { $('#' + elc_sidePop).show(); }, 200); // sidepop verzögert zeigen, weil sonst div im kopfbereich platzbeantsprucht, bis Seite komplett gebaut ist.
    }
);


function InsertAlert(){
    var html_test = '<div class="ui-widget"><div class="ui-state-error ui-corner-all" style=" padding: 0 .7em;"><p style="font-size: 150%;"><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>'+
        '<strong>WICHTIG!</strong> GC SwissMaps wird nicht mehr weiterentwickelt.</p><p>Bitte deinstallieren sie GC SwissMaps und verwenden sie das nachfolger Script <b>GeoMaps</b>. '+
        '<a href="http://www.c-dev.ch/blog/?p=891" target="_blank">Das neue Script GeoMaps kann hier heruntergeladen werden...</a></p>'+
        '<div  style="margin-bottom: 10px"><span id="closeAlert"><a href="#"><span class="ui-icon ui-icon-close"  style="float: left; margin-right: .3em;"></span>Schliessen</a> </span>'+
        '&nbsp;&nbsp;<input id="showAgain" type="checkbox" value="" />Nicht mehr anzeigen (sie werden nicht mehr auf die neue Version hingewiesen)</div></div></div>'

    var closed = GM_getValue('SUC_reminder_close', false);
    if(!closed) $('body').children(':first').prepend(html_test);
    $('#closeAlert').click(function(){
        if($('#showAgain').is(':checked')) {
            GM_setValue('SUC_reminder_close', true);
        }
        $('.ui-widget').hide();
    });
}

function pinSidePopAddHandler()
{
    if($('#'+elc_pinned).html() != null)
    {
        $('#' + elc_pinned).click(function() {
            if (pinned) {
                showCalculator(false);
                pinned = !pinned;
                $('#' + elc_pinnedIco).html('');$('#' + elc_pinnedIco).append(html_ico_float);Core.AppendLinkCursor($('#'+elc_float));
            }
            pinSidePopAddHandler();
        });
    }
    else if($('#'+elc_float).html() != null)
    {
        $('#' + elc_float).click(function() {
            if (!pinned) {
                showCalculator(true);
                pinned = !pinned;
                $('#' + elc_pinnedIco).html('');$('#' + elc_pinnedIco).append(html_ico_pinned);Core.AppendLinkCursor($('#'+elc_pinned));
            }
            pinSidePopAddHandler();
        });
    }
}


var timer=null;

function showCalculator(open) {
    if (pinned) return;
    if(!open)
    {
        clearTimeout(timer);
        timer=setTimeout(function() { showCalculatorBase(open); },200);
    }
    else
    {
        clearTimeout(timer);
        showCalculatorBase(open);
    }
}

function showCalculatorBase(open) {
    $('#' + elc_sidePop).toggleClass('sidePopExpanded', open);
    $('#' + elc_sidePop).toggleClass('sidePop', !open);
}

var parsePageCoords = [];

function ParsePageCoords() {
    $.fn.egrep = function(pat) {
        var out = [];
        var lastParent;
        var textNodes = function(n) {
            if (n.nodeType == 3) {
                var t = typeof pat == 'string' ? n.nodeValue.indexOf(pat) != -1 : pat.test(n.nodeValue);
                if (t) {
                    if (lastParent == undefined || lastParent != n.parentNode) {
                        lastParent = n.parentNode;
                        out.push(n.parentNode);
                    }
                }
            }
            else {
                $.each(n.childNodes, function(a, b) {
                    textNodes(b);
                });
            }
        };
        this.each(function() {
            textNodes(this);
        });
        return out;
    };

    var n = $('body').egrep(pageParserRegExp);
    var popIndex = 0;

    for (var i = 0; i < n.length; ++i) {
        try {
            var coordText = ($(n[i]).html());
            var validCoordinates = coordText.match(pageParserRegExp);
            var replaceHtml = $(n[i]).html();

            for (var ii = 0; ii < validCoordinates.length; ++ii) {
                replaceHtml = WrapCoodinate(replaceHtml, validCoordinates[ii], popIndex);
                parsePageCoords.push(validCoordinates[ii].trim());
                popIndex++;
            }
            $(n[i]).html(replaceHtml);
        } catch(err) {
            // GM_log('## ERROR ## ' + coordText);
            // GM_log(err);
        }
    }
}


function InsertCoordsPopups() {
    $.fn.egrep = function(pat) {
        var out = [];
        var lastParent;
        var textNodes = function(n) {
            if (n.nodeType == 3) {
                var t = typeof pat == 'string' ? n.nodeValue.indexOf(pat) != -1 : pat.test(n.nodeValue);
                if (t) {
                    if (lastParent == undefined || lastParent != n.parentNode) {
                        lastParent = n.parentNode;
                        out.push(n.parentNode);

                        console.log(n.parentNode);
                    }
                }
            }
            else {
                $.each(n.childNodes, function(a, b) {
                    textNodes(b);
                });
            }
        };
        this.each(function() {
            textNodes(this);
        });
        return out;
    };

    var n = $('body').egrep(pageParserRegExp);
    var popIndex = 0;
    var allCoords = [];
    for (var i = 0; i < n.length; ++i) {
        try {
            var coordText = ($(n[i]).html());

            // console.log("Text:" + coordText);

            var validCoordinates = coordText.match(pageParserRegExp);
            var replaceHtml = $(n[i]).html();
            for (var indexIi = 0; indexIi < validCoordinates.length; indexIi++) {
                // console.log("   Coord:" + validCoordinates[indexIi]);
                replaceHtml = WrapCoodinate(replaceHtml, validCoordinates[indexIi], popIndex);
                // InsertPopUp(popIndex, validCoordinates[indexIi]);
                allCoords.push(validCoordinates[indexIi]);
                popIndex++;
            }
            $(n[i]).html(replaceHtml);
        } catch(err) {
            // GM_log('## ERROR ## ' + coordText);
            // GM_log(err);
        }
    }

    console.log("Anzahl Coords" + allCoords.length);

    for (var cordsIndex = 0; cordsIndex < allCoords.length; cordsIndex++) {
        console.log(allCoords[cordsIndex]);
        InsertPopUp(cordsIndex, allCoords[cordsIndex]);
    }

    for (var iP = 0; iP < popIndex; ++iP) {
        var coord = $('#' + elc_coordinate + iP).text().trim();
        $('#' + elc_coordinate + iP).html(Core.Format(html_popUpImage, img_coordPopUp, iP, coord));
        if (currentUserSettings.OptionList.HighlightCoordinate) {
            if (el_cacheCoordinate.children('span').attr('id') == elc_coordinate + iP) {
                if (currentUserSettings.OptionList.HighlightCoordinateMaster) {
                    if (hasCorrectedCoordinates) {
                        $('#' + elc_coordinate + iP).addClass('coordWrapCorrected');
                    }
                    else {
                        $('#' + elc_coordinate + iP).addClass('coordWrap');
                    }
                }
            } else {
                $('#' + elc_coordinate + iP).addClass('coordWrap');
            }
        }
    }

    $('.' + elc_coordPopUp + '-target').ezpz_tooltip({
        stayOnContent: true,
        offset:-10
    }); // configuration of pop-up
}

function InsertPopUp(popIndex, coordinate) {
    $('body').append(Core.Format(html_popUpDiv, popIndex));
    var elem = $('#' + elc_coordPopUp + '-content-' + popIndex);
    var coords = ParseDeg(coordinate.trim());


    console.log("BP" + popIndex + " coordinate=" + coordinate + " : "+ coords + " : " + elem);

    InsertCoordinates(coords, elem, popIndex);


    InsertSendTo(coords, elem, popIndex);
    InsertMaps(coords, null, elem, popIndex);
    elem.append(html_footerLink);

}

function InsertSendTo(coords, elem, popIndex) {

    if (!currentUserSettings.OptionList.SendTo) {
        return;
    }

    elem.append(Core.Format(html_sendToCalculator, popIndex, popIndex, languageString.PopSenToCalc));

    $('#' + elc_sendToCalculator + popIndex).click(function() {
        var index = $(this).attr('id').substring(elc_sendToCalculator.length, $(this).attr('id').length);
        var coordString = $('#' + elc_selectableCoord + index + 1).val();
        $('#' + elc_calcCoordInput).val(coordString);
        showCalculator(true);
        calculatorMgr();
    });

    $('#i' + elc_sendToCalculator + popIndex).click(function() {
        var index = $(this).attr('id').substring(elc_sendToCalculator.length + 1, $(this).attr('id').length);
        var coordString = $('#' + elc_selectableCoord + index + 1).val();
        $('#' + elc_calcCoordInput).val(coordString);
        showCalculator(true);
        calculatorMgr();
    });

    Core.AppendLinkCursor($('#' + elc_sendToCalculator + popIndex));
    Core.AppendLinkCursor($('#i' + elc_sendToCalculator + popIndex));

    $('#' + elc_sendToCalculator + popIndex).hover(function() {
        $(this).toggleClass('hoverButtons');
    });
}

function InsertCoordinates(coords, elem, popIndex, header) {

    if(header)
    {
        elem.prepend(CoordinatesHTML(coords, popIndex, header));
    }
    else{
        elem.append(CoordinatesHTML(coords, popIndex, header));
    }

    for (var idx = 1; idx < 5; idx++) {
        var idxE = String(popIndex) + String(idx);
        Core.AppendLinkCursor($('#'+elc_selectableCoord + idxE));

        if(header){

            var link = '';
            var point = coords;

            if(currentUserSettings.OptionList.SelectClickMap == 0) {
                link = Core.Format(mapLinks[0], String(point.LatLon().lat()), String(point.LatLon().lon()), String(point.LatLon().lat()), String(point.LatLon().lon()));
            }
            else if(currentUserSettings.OptionList.SelectClickMap == 1) {
                link = Core.Format(mapLinks[1], String(point.SwissGrid().X()), String(point.SwissGrid().Y()));
            }
            else if(currentUserSettings.OptionList.SelectClickMap == 2)   {
                link = Core.Format(mapLinks[2], String(point.SwissGrid().Y()), String(point.SwissGrid().X()));
            }
            else if(currentUserSettings.OptionList.SelectClickMap == 3)  {
                link = Core.Format(mapLinks[3], String(point.SwissGrid().Y()), String(point.SwissGrid().X()));
            }
            else if(currentUserSettings.OptionList.SelectClickMap == 4)     {
                link = Core.Format(mapLinks[4], String(point.LatLon().lat()), String(point.LatLon().lon()));
            }
            $('#'+elc_selectableCoord + idxE).click(function() {window.open(link);});
        }


        $('#'+elc_selectableCoord + idxE).mousemove(
            function() {
                unsafeWindow.$('#' + $(this).attr('id')).select();
            }
        );

        $('#'+elc_selectableCoord + idxE).mouseout(
            function() {
                var text = unsafeWindow.$('#' + $(this).attr('id')).val();
                unsafeWindow.$('#' + $(this).attr('id')).val('');
                unsafeWindow.$('#' + $(this).attr('id')).val(text);
                unsafeWindow.$('#' + $(this).attr('id')).blur();
            }
        );


    }
}

function InsertMaps(startPoint, targetPoint, elem, index) {



    if (index == undefined) {
        index = 100;
    }
    index = parseInt(index);
    // index = index * 100;
    var html = '';

    elem.append(Core.Format(html_mapsLineTable, index, '', ''));
    var tableElement = $('#'+elc_mapsTable + index);

    InsertBetaMap(startPoint, targetPoint, tableElement, index + 9);

    InsertMapGoogle(startPoint, targetPoint, tableElement, index + 1);

    var point = startPoint;
    if (targetPoint != undefined) {
        point = targetPoint;
    }

    // Maps geo.admin, MapsPlus, MapSearch
    if (point.SwissGrid().Y() >= 485000 && point.SwissGrid().Y() <= 835000 && point.SwissGrid().X() >= 75000 && point.SwissGrid().X() <= 300000) {

        if (currentUserSettings.OptionList.MapMapGeoAdmin) {
            var link = Core.Format(mapLinks[1], String(point.SwissGrid().X()), String(point.SwissGrid().Y())); // 'http://map.geo.admin.ch/?crosshair=circle&zoom=7&X=' + point.SwissGrid().X() + '&Y=' + point.SwissGrid().Y();
            html = html + Core.Format(html_mapsLine, link, img_swissgeo, link, languageString.MapsGeoAdmin, (index + 2), (index + 2), '');
        }
        if (currentUserSettings.OptionList.MapMapPlus) {
            link = Core.Format(mapLinks[2], String(point.SwissGrid().Y()), String(point.SwissGrid().X())); // 'http://www.mapplus.ch/frame.php?map=&x=' + point.SwissGrid().Y() + '&y=' + point.SwissGrid().X();
            html = html + Core.Format(html_mapsLine, link, img_mapplus, link, languageString.MapsPlus, (index + 3), (index + 3), '');
        }
        if (currentUserSettings.OptionList.MapMapSearch) {
            link = Core.Format(mapLinks[3], String(point.SwissGrid().Y()), String(point.SwissGrid().X())); // 'http://map.search.ch/' + point.SwissGrid().Y() + ',' + point.SwissGrid().X();
            html = html + Core.Format(html_mapsLine, link, img_swissmap, link, languageString.MapsSearch, (index + 4), (index + 4), '');
        }
    }

    // Map Geocaching
    if (currentUserSettings.OptionList.MapGeocaching) {
        link = Core.Format(mapLinks[4], point.LatLon().lat(), point.LatLon().lon()); // 'http://www.geocaching.com/map/default.aspx?lat=' + point.LatLon().lat() + '&lng=' + point.LatLon().lon();
        var linkNearest = 'http://www.geocaching.com/seek/nearest.aspx?lat=' + point.LatLon().lat() + '&lng=' + point.LatLon().lon();
        var extHtml = Core.Format(html_mapsLineExt, (index + 5), linkNearest, 'Liste');
        html = html + Core.Format(html_mapsLine, link, img_geocaching, link, 'Karte', (index + 5), (index + 5), extHtml);
    }

    // Map GIS Kanton Zürich
    if (point.SwissGrid().Y() >= 668000 && point.SwissGrid().Y() <= 718000 && point.SwissGrid().X() >= 224000 && point.SwissGrid().X() <= 284000) {
        link = 'http://maps.zh.ch?topic=BASISKARTEZH&scale=10000&x=' + point.SwissGrid().Y() + '&y=' + point.SwissGrid().X()+'&markers=ring';
        html = html + Core.Format(html_mapsLine, link, img_giszh, link, languageString.MapsGisZh, (index + 6), (index + 6), '');
    }

    // Map Stadtplan Zürich
    if (point.SwissGrid().Y() >= 675000 && point.SwissGrid().Y() <= 692000 && point.SwissGrid().X() >= 241000 && point.SwissGrid().X() <= 257000) {
        link = 'http://www.stadtplan.stadt-zuerich.ch/?XKoord=' + point.SwissGrid().Y() + '&YKoord=' + point.SwissGrid().X() + '&Massstab=2000';
        html = html + Core.Format(html_mapsLine, link, img_stadtplanzh, link, languageString.MapsZueriPlan, (index + 7), (index + 7), '');
    }

    tableElement.append(html);
    InsertMapGoogleTopoDe(tableElement, startPoint, targetPoint, index + 8);
}

Array.prototype.unique = function()
{
    var n = {},r=[];
    for(var i = 0; i < this.length; i++)
    {
        if (!n[this[i]])
        {
            n[this[i]] = true;
            r.push(this[i]);
        }
    }
    return r;
}

function InsertBetaMap(startPoint, targetPoint, elem, formIndex) {

    elem.before(Core.Format(html_mapsLineJsonForm, 'geoMapsPlannerCall' + formIndex, 'frmGeoMapsPlanner'+formIndex, mapLinks[5], 'geoMapsPlannerParams' + formIndex, 'geoMapsPlannerParams'));
    elem.append(Core.Format(html_mapsLineJsonBeta, ico_geoMapsPlanner, 'submitParamsGeoMapsPlanner' + formIndex, 'geoMapsPlannerSubmitParams' + formIndex, "GeoMaps Planner"));

    var json = RequestGeoMapsPlanner(parsePageCoords.unique());
    $('#geoMapsPlannerParams' + formIndex).val(json);

    // console.log(json);

    $('#geoMapsPlannerSubmitParams' + formIndex).click(function() {
        $(document).ready(function() {
            window.setTimeout("$('#geoMapsPlannerCall" + formIndex + "').submit();", 100);
        });
    });
    $('.submitParamsGeoMapsPlanner' + formIndex).click(function() {
        $(document).ready(function() {
            window.setTimeout("$('#geoMapsPlannerCall" + formIndex + "').submit();", 100);
        });
    });
    Core.AppendLinkCursor($('#geoMapsPlannerSubmitParams' + formIndex));
    Core.AppendLinkCursor($('.submitParamsGeoMapsPlanner' + formIndex));
    $('#geoMapsPlannerSubmitParams' + formIndex).hover(function() {
        $('#geoMapsPlannerSubmitParams' + formIndex).toggleClass('hoverButtons');
    });
}

function InsertMapGoogle(startPoint, targetPoint, elem, formIndex) {

    if (!currentUserSettings.OptionList.MapGoogle) return;

    var html = '';
    var calculatedLink = '';

    var point = startPoint;
    if (targetPoint != undefined) {
        point = targetPoint;
        calculatedLink = Core.Format(html_mapsLineExtGoogle, formIndex);
        elem.before(Core.Format(html_mapsLineJsonForm, 'googleMapsCall' + formIndex, 'frmGoogle'+formIndex, url_Google, 'googleMapsParams' + formIndex, 'googleMapsParams'));
        var json = RequestGoogleMap(startPoint, targetPoint);
        $('#googleMapsParams' + formIndex).val(json);
    }

    var googlePortalLink = Core.Format(mapLinks[0], point.LatLon().lat(), point.LatLon().lon(), point.LatLon().lat(), point.LatLon().lon());
    html += Core.Format(html_mapsLine, googlePortalLink, img_google, googlePortalLink, languageString.MapsGoogle, formIndex, formIndex, calculatedLink);
    elem.append(html);

    $('.submitParams' + formIndex).click(function() {
        $(document).ready(function() {
            window.setTimeout("$('#googleMapsCall" + formIndex + "').submit();", 100);
        });
    });

    Core.AppendLinkCursor($('.submitParams' + formIndex));
    $('.submitParams' + formIndex).hover(function() {
        $('.submitParams' + formIndex).toggleClass('hoverButtons');
    });
}

function InsertMapGoogleTopoDe(elem, startPoint, targetPoint, formIndex) {

    if (!currentUserSettings.OptionList.MapTopoDe) return;
    if (targetPoint != undefined) startPoint = targetPoint; // ToPo DE kann nur einen Punkt darstellen -> Endpunkt als Referenzpunkt verwenden

    if (startPoint.LatLon().lat() >= 47 && startPoint.LatLon().lat() <= 55 && startPoint.LatLon().lon() >= 5 && startPoint.LatLon().lon() <= 16) {

        elem.before(Core.Format(html_mapsLineJsonForm, 'googleMapsTopoDeCall' + formIndex, 'frmToPoDe'+formIndex, url_TopoDe, 'googleMapsTopoDeParams' + formIndex, 'googleMapsTopoDeParams'));
        elem.append(Core.Format(html_mapsLineJson, img_outdooractivemap, 'submitParamsTopoDe' + formIndex, 'googleMapsTopoDeSubmitParams' + formIndex, languageString.MapsTopoDe));

        var json = RequestGoogleMap(startPoint, targetPoint);
        $('#googleMapsTopoDeParams' + formIndex).val(json);
        $('#googleMapsTopoDeSubmitParams' + formIndex).click(function() {
            $(document).ready(function() {
                window.setTimeout("$('#googleMapsTopoDeCall" + formIndex + "').submit();", 100);
            });
        });
        $('.submitParamsTopoDe' + formIndex).click(function() {
            $(document).ready(function() {
                window.setTimeout("$('#googleMapsTopoDeCall" + formIndex + "').submit();", 100);
            });
        });
        Core.AppendLinkCursor($('#googleMapsTopoDeSubmitParams' + formIndex));
        Core.AppendLinkCursor($('.submitParamsTopoDe' + formIndex));
        $('#googleMapsTopoDeSubmitParams' + formIndex).hover(function() {
            $('#googleMapsTopoDeSubmitParams' + formIndex).toggleClass('hoverButtons');
        });
    }
}

function InsertCalculator(widgetBoxElement) {

    if (currentUserSettings.OptionList.CalculatorAsSidePop) {
        $('body').prepend(html_sidePop);
        showCalculator(false);
        $('#' + elc_sidePopContentBox).append(html_sidePopDiv);
        $('#' + elc_sidePopContentBody).prepend(html_sidePopBodyDiv);
        $('#' + elc_sidePopContentBody).prepend(Core.Format(html_sidePopTitle));

        $('#' + elc_pinnedIco).append(html_ico_float);
        Core.AppendLinkCursor($('#'+elc_float));

        $('#' + elc_sidePopBody).append(html_calcCoordInput);
        $('#' + elc_sidePopBody).append(html_mapsInnerBody);
        $('#' + elc_sidePopBody).append(html_donation);
    }
    else {
        var smallMapLink = widgetBoxElement.before(html_widgetBoxDiv);
        $('#' + elc_widgetBox).prepend(html_widgetBoxBodyDiv);
        $('#' + elc_widgetBox).prepend(Core.Format(html_widgetBoxTitle, moreImg_20));
        $('#' + elc_widgetBody).append(html_calcCoordInput);
        $('#' + elc_widgetBody).append(html_mapsInnerBody);
    }

    InsertSettingsBox($('#'+elc_sidePopTitle));

    $('#' + elc_calcCoordInput).keyup(function(e) {
        if (e.keyCode <= 18 && e.keyCode >= 16) {
            return;
        }
        calculatorMgr();
        function callback() {
            setTimeout(function() {
                $('#' + elc_calculatorInnerBody + ':visible').removeAttr('style').hide().fadeOut();
            }, 1000);
        }
        ;
    });
}

function InsertDistanceBody(point) {

    $('#' + elc_calculatorInnerBody).append(html_calcCoordDistanceBox);
    $('#' + elc_calculatorInnerBody).append(html_distInnerBody);

    $('#' + elc_calcDistBody).hide();
    $('.' + elc_distClass).click(function () {
        if (modeProj) clearProjectionBody();
        $('#' + elc_calcDistBody).fadeIn('slow');
        $('#' + elc_calcMapsBody).hide();
        modeDist = true;
    });
    Core.AppendLinkCursor($('.' + elc_distClass));

    Core.AppendLinkCursor($('#' + elc_calcClearDist));
    $('#' + elc_calcClearDist).click(function() {
            clearDistanceBody();
        }
    );


    $('#' + elc_calcDistCoordInput).keyup(function(e) {
        if (e.keyCode <= 18 && e.keyCode >= 16) {
            return;
        }
        distanceMgr(point);
        function callback() {
            setTimeout(function() {
                $('#' + elc_calcDistInnerBody + ':visible').removeAttr('style').hide().fadeOut();
            }, 1000);
        }

        ;
    });
}

function InsertProjectionBody(point) {
    $('#' + elc_calculatorInnerBody).append(html_calcCoordProjInput);
    $('#' + elc_calculatorInnerBody).append(html_projInnerBody);

    $('#' + elc_calcProjBody).hide();
    $('.' + elc_projClass).click(function () {
        if (modeDist) clearDistanceBody();
        $('#' + elc_calcProjBody).fadeIn('slow');
        $('#' + elc_calcMapsBody).hide();
        modeProj = true;
    });
    Core.AppendLinkCursor($('.' + elc_projClass));

    Core.AppendLinkCursor($('#' + elc_calcClearProj));
    $('#' + elc_calcClearProj).click(function() {
            clearProjectionBody();
        }
    );

    $('#' + elc_calcProjDistInput).keyup(function(e) {
        if (e.keyCode <= 18 && e.keyCode >= 16) {
            return;
        }
        projectionMgr(point);
        function callback() {
            setTimeout(function() {
                $('#' + elc_calcProjInnerBody + ':visible').removeAttr('style').hide().fadeOut();
            }, 1000);
        }

        ;
    });

    $('#' + elc_calcProjDegInput).keyup(function(e) {
        if (e.keyCode <= 18 && e.keyCode >= 16) {
            return;
        }
        projectionMgr(point);
        function callback() {
            setTimeout(function() {
                $('#' + elc_calcProjInnerBody + ':visible').removeAttr('style').hide().fadeOut();
            }, 1000);
        }

        ;
    });

}

function InsertDistanceResult(distance, bearing, elem) {
    elem.append(Core.Format(html_calcDistanceResult, languageString.CalcDist, distance, languageString.CalcDirection, bearing));
}

function InsertExtendetCalculationButtons() {
    $('#' + elc_calculatorInnerBody).append(html_extendetCalculation);
    $('.' + elc_distClass).hover(function() {
        $('.' + elc_distClass).toggleClass('hoverButtons');
    });
    $('.' + elc_projClass).hover(function() {
        $('.' + elc_projClass).toggleClass('hoverButtons');
    });
}

function InsertSettingsBox(elem) {
    elem.after(html_settingsBox);
    Core.AppendLinkCursor($('#' + elc_openSettings));

    // fill table with options
    tableElem = $('#' + elc_userSettingsBox).find('table');

    // highlighter
    tableElem.append(Core.Format(html_settingsBoxLine, 'settingHighlightCoordinate', languageString.SetCoordHighlight));
    $('#settingHighlightCoordinate').attr('checked', currentUserSettings.OptionList.HighlightCoordinate);
    $('#settingHighlightCoordinate').change(function() {
        currentUserSettings.OptionList.HighlightCoordinate = $('#settingHighlightCoordinate').is(':checked');
        if (!currentUserSettings.OptionList.HighlightCoordinate) {
            $('#settingHighlightCoordinateMaster').attr('checked', false);
            $('#settingHighlightCoordinateMaster').attr('disabled', true);
            currentUserSettings.OptionList.HighlightCoordinateMaster = $('#settingHighlightCoordinateMaster').is(':checked');
        } else {
            $('#settingHighlightCoordinateMaster').attr('disabled', false);
        }
        currentUserSettings.Save();
    });

    tableElem.append(Core.Format(html_settingsBoxSubLine, 'settingHighlightCoordinateMaster', languageString.SetMasterCoordHighlight));
    $('#settingHighlightCoordinateMaster').attr('checked', currentUserSettings.OptionList.HighlightCoordinateMaster);
    if (!currentUserSettings.OptionList.HighlightCoordinate) {
        $('#settingHighlightCoordinateMaster').attr('disabled', true);
    }
    $('#settingHighlightCoordinateMaster').change(function() {
        currentUserSettings.OptionList.HighlightCoordinateMaster = $('#settingHighlightCoordinateMaster').is(':checked');
        currentUserSettings.Save();
    });

    tableElem.append(Core.Format(Core.Format(html_settingsBoxLine, 'settingSendTo', languageString.SendToCalculator)));
    OptionCheckHandler('SendTo');
    tableElem.append(Core.Format(Core.Format(html_settingsBoxLine, 'settingCacheInfoHideUMT', languageString.CacheHeaderHideUMT)));
    OptionCheckHandler('CacheInfoHideUMT');
    tableElem.append(Core.Format(Core.Format(html_settingsBoxLine, 'settingCacheInfoHideOther', languageString.CacheHeaderHideOther)));
    OptionCheckHandler('CacheInfoHideOther');

    var html_select_position =languageString.Position+'<select id=\"settingPosition\">'+
        '<option value=\"0\">'+languageString.SelectPos0+'</option>'+
        '<option value=\"10\">'+languageString.SelectPos1+'</option>'+
        '<option value=\"20\">'+languageString.SelectPos2+'</option>'+
        '<option value=\"30\">'+languageString.SelectPos3+'</option>'+
        '</select>';
    tableElem.append(Core.Format(html_settingsBoxLineText, html_select_position));
    OptionSelectHandler('Position');

    var html_select_language =languageString.Language+'<select id=\"settingLanguage\">'+
        '<option value=\"0\">'+languageString.LanDe+'</option>'+
        '<option value=\"1\">'+languageString.LanEn+'</option>'+
        '</select>';
    tableElem.append(Core.Format(html_settingsBoxLineText, html_select_language));
    OptionSelectHandler('Language');

    tableElem.append(Core.Format(html_settingsBoxLineTitle, languageString.SetTitleUserSettings));
    for (var x = 1; x <= 4; x++) {
        tableElem.append(Core.Format(Core.Format(html_settingsBoxInputLine, 'settingFormat' + x, 'settingFormat' + x + 'Show')));
        OptionChangeHandler('Format' + x);
        OptionCheckHandler('Format' + x + 'Show');
    }

    var html_select_clickmap =languageString.SelectClickMap+ '&nbsp;<select id=\"settingSelectClickMap\">'+
        '<option value=\"0\">'+languageString.MapsGoogle+'</option>'+
        '<option value=\"1\">'+languageString.MapsGeoAdmin+'</option>'+
        '<option value=\"2\">'+languageString.MapsPlus+'</option>'+
        '<option value=\"3\">'+languageString.MapsSearch+'</option>'+
        '<option value=\"4\">'+languageString.MapsGeocaching+'</option>'+
        '</select>';

    tableElem.append(Core.Format(html_settingsBoxLineText, html_select_clickmap));
    OptionSelectHandler('SelectClickMap');

    tableElem.append(Core.Format(html_settingsBoxLineTitle, languageString.SetTitleMaps));
    tableElem.append(Core.Format(html_settingsBoxLine, 'settingMapGoogle', languageString.MapsGoogle));
    OptionCheckHandler('MapGoogle');
    tableElem.append(Core.Format(html_settingsBoxLine, 'settingMapMapGeoAdmin', languageString.MapsGeoAdmin));
    OptionCheckHandler('MapMapGeoAdmin');
    tableElem.append(Core.Format(html_settingsBoxLine, 'settingMapMapPlus', languageString.MapsPlus));
    OptionCheckHandler('MapMapPlus');
    tableElem.append(Core.Format(html_settingsBoxLine, 'settingMapMapSearch', languageString.MapsSearch));
    OptionCheckHandler('MapMapSearch');
    tableElem.append(Core.Format(html_settingsBoxLine, 'settingMapGeocaching', languageString.MapsGeocaching));
    OptionCheckHandler('MapGeocaching');

    tableElem.append(Core.Format(html_settingsBoxLine, 'settingMapTopoDe', languageString.MapsTopoDe));
    OptionCheckHandler('MapTopoDe');

    $('#' + elc_userSettingsBox).append(html_footerLink);
    $('#' + elc_userSettingsBox).hide();

    $('#'+elc_openSettings).click(function() {
        if (!setupExpandet) {
            $('#' + elc_userSettingsBox).show('blind', 1000);
            setupExpandet = true;
        } else {
            $('#' + elc_userSettingsBox).hide('blind', 1000);
            setupExpandet = false;
        }
    });
}

function OptionSelectHandler(elemName){
    $('#setting' + elemName).val(currentUserSettings.OptionList[elemName]);
    $('#setting' + elemName).change(function() {
        currentUserSettings.OptionList[elemName] = $('#setting' + elemName).val();
        currentUserSettings.Save();
    });
}

function OptionCheckHandler(elemName) {
    $('#setting' + elemName).attr('checked', currentUserSettings.OptionList[elemName]);
    $('#setting' + elemName).change(function() {
        currentUserSettings.OptionList[elemName] = $('#setting' + elemName).is(':checked');
        currentUserSettings.Save();
    });
}

function OptionChangeHandler(elemName) {
    $('#setting' + elemName).val(currentUserSettings.OptionList[elemName]);
    $('#setting' + elemName).keyup(function() {
        currentUserSettings.OptionList[elemName] = $('#setting' + elemName).val();
        currentUserSettings.Save();
    });
}

function ExtendCacheInfo(insertElement) {

    if (currentUserSettings.OptionList.CacheInfoHideUMT) insertElement.empty();
    if (currentUserSettings.OptionList.CacheInfoHideOther) $('#ctl00_ContentBody_lnkConversions').remove();

    try {
        var coords = ParseDeg(cacheCoordinate);
        InsertCoordinates(coords, insertElement, 99995, true);

        /*
         var latLon = point.LatLon();
         insertElement.prepend(Core.Format(html_infoCoord, languageString.SymbDms, Core.Format(html_coordDms, latLon.toFormat('dms', 2))));
         insertElement.prepend(Core.Format(html_infoCoord, languageString.SymbDec, Core.Format(html_coordDec, latLon.toFormat('d', 6))));
         if (point.SwissGrid().Y() >= 485000 && point.SwissGrid().Y() <= 835000 && point.SwissGrid().X() >= 75000 && point.SwissGrid().X() <= 300000) {
         var swissGrid = point.SwissGrid();
         insertElement.prepend(Core.Format(html_infoCoord, languageString.SymbSwiss, Core.Format(html_coordSwiss, swissGrid.toFormat('f'))));
         }
         */
    }
    catch(err)
    {
        // ignore
    }
}

function WrapCoodinate(replaceHtml, coordString, popIndex) {
    if (cacheCoordinate && popIndex == 0) {
        return replaceHtml.replace(coordString, Core.Format(html_coordinateWrapStringMaster, popIndex, coordString));
    }
    return replaceHtml.replace(coordString, Core.Format(html_coordinateWrapString, popIndex, coordString));
}

function CoordinatesHTML(coords, popIndex, header) {

    var html = "";
    var format = "";
    for (var x = 1; x <= 4; x++) {
        format = currentUserSettings.OptionList['Format' + x];
        if (!header && format != "") {
            var formatCoord = CoordFormatParser.Parse(format, coords);
            if (formatCoord != '') html = html + Core.Format(html_selectableCoord, String(popIndex) + x, formatCoord);
        }
        else if (header && format != "" && currentUserSettings.OptionList['Format' + x + "Show"]) {
            var formatCoord = CoordFormatParser.Parse(format, coords);
            if (formatCoord != '') html = html + Core.Format(html_selectableCoordHeader, String(popIndex) + x, formatCoord);
        }
    }
    return Core.Format(html_selectableCoordsBox, elc_coordBox + popIndex, html);
}

function RequestGeoMapsPlanner(coordinates) {

    var JSONObject = new Object;
    JSONObject.waypoints = coordinates;

    return JSON.stringify(JSONObject);

}

function RequestGoogleMap(startPoint, targetPoint) {
    var inverse = false;
    var JSONObject = new Object;

    if (modeDist) {
        JSONObject.type = 1;
        if (startPoint.LatLon().rhumbBearingTo(targetPoint.LatLon()) > 180) {
            inverse = true;
        }
    } else if (modeProj) {
        JSONObject.type = 2;
        if (startPoint.LatLon().rhumbBearingTo(targetPoint.LatLon()) > 180) {
            inverse = true;
        }
    } else {
        JSONObject.type = 0;
    }

    JSONObject.waypoints = new Array;

    if (JSONObject.type > 0) {
        var point = inverse ? targetPoint : startPoint;

        var i = 0;
        JSONObject.waypoints[i] = new Object;
        JSONObject.waypoints[i].title = inverse ? languageString.GoogleMapsWaypointEnd : languageString.GoogleMapsWaypointStart;
        JSONObject.waypoints[i].description = CoordinatesHTML(point, -1);
        JSONObject.waypoints[i].lat = point.LatLon().lat();
        JSONObject.waypoints[i].lon = point.LatLon().lon();

        point = inverse ? startPoint : targetPoint;

        i = 1;
        JSONObject.waypoints[i] = new Object;
        JSONObject.waypoints[i].title = inverse ? languageString.GoogleMapsWaypointStart : languageString.GoogleMapsWaypointEnd;
        JSONObject.waypoints[i].description = CoordinatesHTML(point, -1);
        JSONObject.waypoints[i].lat = point.LatLon().lat();
        JSONObject.waypoints[i].lon = point.LatLon().lon();
    }
    else {
        point = startPoint;
        JSONObject.waypoints[0] = new Object;
        JSONObject.waypoints[0].title = languageString.GoogleMapsWaypoint
        JSONObject.waypoints[0].description = CoordinatesHTML(point, -1);
        JSONObject.waypoints[0].lat = point.LatLon().lat();
        JSONObject.waypoints[0].lon = point.LatLon().lon();
    }
    return JSON.stringify(JSONObject);
}

function ParseDeg(degString) {
    // parse coord from format = DD°MM.MMMM (Deg)
    var myPattern = new RegExp(degRegExp);
    var match = myPattern.exec(degString.toString());
    if (degString.match(degRegExp)) {
        var coords = new Coords(new LatLon(Geo.parseDMS(match[1]), Geo.parseDMS(match[6])));
        return coords;
    }
}

function ParseDec(decString) {
    // parse coord from format = DD.DDDDDD° (Dec)
    var myPattern = new RegExp(decRegExp);
    var match = myPattern.exec(decString.toString());
    if (decString.match(decRegExp)) {
        var lat = parseFloat(match[2] + '.' + match[3]);
        var lng = parseFloat(match[5] + '.' + match[6]);
        return new Coords(new LatLon(Geo.parseDMS(match[1]), Geo.parseDMS(match[5])));
    }
}

function ParseDms(dmsString) {
    // parse coord from format = DD° DD' DD.DDD'' (Dms)
    var myPattern = new RegExp(dmsRegExp);
    var match = myPattern.exec(dmsString.toString());
    if (dmsString.match(dmsRegExp)) {
        return new Coords(new LatLon(Geo.parseDMS(match[1]), Geo.parseDMS(match[7])));
    }
}

function ParseSwiss(swissString) {
    // parse coord from format = dddddd / dddddd (swiss)
    var myPattern = new RegExp(swissRegExp);
    var match = myPattern.exec(swissString.toString());
    if (swissString.match(swissRegExp)) {
        var y = parseFloat(match[1] + match[2]);
        var x = parseFloat(match[3] + match[4]);
        var swiss = new SwissGrid(y, x);
        var lat = SwissGrid.CHtoWGSlat(y, x);
        var lon = SwissGrid.CHtoWGSlng(y, x);
        return new Coords(new LatLon(lat, lon), swiss);
    }
}

function ParsPoint(pointString) {

    var coordString = pointString.trim();
    var pattdegRegExp=new RegExp(degRegExp);
    var pattdecRegExp=new RegExp(decRegExp);
    var pattswissRegExp=new RegExp(swissRegExp);
    var pattdmsRegExp=new RegExp(dmsRegExp);

    if (pattdegRegExp.test(coordString)) {
        return ParseDeg(coordString);
    } else if (pattdecRegExp.test(coordString)) {
        return ParseDec(coordString);
    } else if (pattswissRegExp.test(coordString)) {
        return ParseSwiss(coordString);
    } else if (pattdmsRegExp.test(coordString)) {
        return ParseDms(coordString);
    }
}

function clearDistanceBody() {
    $('#' + elc_calcDistCoordInput).removeClass();
    $('#' + elc_calcDistCoordInput).addClass('calcInput');
    $('#' + elc_calcDistCoordInput).addClass('calcCoord');
    $('#' + elc_calcDistCoordInput).val('');
    $('#' + elc_calcDistBody).hide();
    $('#' + elc_calcMapsBody).show();
    $('#' + elc_calcDistInnerBody).html('');
    modeDist = false;
}

function clearProjectionBody() {
    $('#' + elc_calcProjDistInput).removeClass();
    $('#' + elc_calcProjDistInput).addClass('calcDistInput');
    $('#' + elc_calcProjDistInput).addClass('calcDist');
    $('#' + elc_calcProjDegInput).removeClass();
    $('#' + elc_calcProjDegInput).addClass('calcDegrInput');
    $('#' + elc_calcProjDegInput).addClass('calcDegr');
    $('#' + elc_calcProjDistInput).val('');
    $('#' + elc_calcProjDegInput).val('');

    $('#' + elc_calcProjBody).hide();
    $('#' + elc_calcMapsBody).show();
    $('#' + elc_calcProjInnerBody).html('');
    modeProj = false;
}

function calculatorMgr() {
    var coordString = $('#' + elc_calcCoordInput).val();
    var point = ParsPoint(coordString);
    unsafeWindow.console.log (point);
    if (point) {
        //$('#donation').hide();
        $('#' + elc_calculatorInnerBody).html('');
        $('#' + elc_calcCoordInput).removeClass('calcCoordNoOk');
        $('#' + elc_calcCoordInput).addClass('calcCoordOk');
        InsertCoordinates(point, $('#' + elc_calculatorInnerBody), 99996);

        InsertExtendetCalculationButtons();
        InsertDistanceBody(point);
        InsertProjectionBody(point);

        $('#' + elc_calculatorInnerBody).append(html_calcMapsBody);
        InsertMaps(point, null, $('#' + elc_calcMapsBody), 500);
        if (!widgetExpandet)    $('#' + elc_calculatorInnerBody).show('blind', 1000);
        widgetExpandet = true;
    }
    else if (!point) {
        //$('#donation').show();
        if ($('#' + elc_calcCoordInput).val().length == 0) {
            $('#' + elc_calcCoordInput).removeClass('calcCoordOk');
            $('#' + elc_calcCoordInput).removeClass('calcCoordNoOk');
            $('#' + elc_calcCoordInput).addClass('calcCoord');
        } else {
            $('#' + elc_calcCoordInput).removeClass('calcCoordOk');
            $('#' + elc_calcCoordInput).addClass('calcCoordNoOk');
        }
        $('#' + elc_calculatorInnerBody).hide();
        $('#' + elc_calculatorInnerBody).html('');
        widgetExpandet = false;
    }

    Core.AppendLinkCursor($('#' + elc_calcClearInput));
    $('#' + elc_calcClearInput).click(function() {
            unsafeWindow.console.log ("cLEAR cLICK");
            $('#' + elc_calcCoordInput).val('');
            modeDist = false;
            modeProj = false;
            calculatorMgr();
        }
    );
}

function distanceMgr(startPoint) {
    var targetPoint = ParsPoint($('#' + elc_calcDistCoordInput).val());
    if (targetPoint) {
        $('#' + elc_calcDistInnerBody).html('');
        $('#' + elc_calcDistCoordInput).removeClass('calcCoordNoOk');
        $('#' + elc_calcDistCoordInput).addClass('calcCoordOk');
        InsertCoordinates(targetPoint, $('#' + elc_calcDistInnerBody), 99997);
        InsertDistanceResult(startPoint.LatLon().rhumbDistanceTo(targetPoint.LatLon()), Geo.toBrng(startPoint.LatLon().rhumbBearingTo(targetPoint.LatLon()), 'd', 2), $('#' + elc_calcDistInnerBody));
        InsertMaps(startPoint, targetPoint, $('#' + elc_calcDistInnerBody),510);
        if (!distExpandet) $('#' + elc_calcDistInnerBody).show('blind', 1000);
        distExpandet = true;
    } else if (!targetPoint) {
        if ($('#' + elc_calcDistCoordInput).val().length == 0) {
            $('#' + elc_calcDistCoordInput).removeClass('calcCoordOk');
            $('#' + elc_calcDistCoordInput).removeClass('calcCoordNoOk');
            $('#' + elc_calcDistCoordInput).addClass('calcCoord');
        } else {
            $('#' + elc_calcDistCoordInput).removeClass('calcCoordOk');
            $('#' + elc_calcDistCoordInput).addClass('calcCoordNoOk');
        }
        $('#' + elc_calcDistInnerBody).hide();
        $('#' + elc_calcDistInnerBody).html('');
        distExpandet = false;
    }
}

function projectionMgr(startPoint) {
    var distance = null;
    var degree = null;
    var myPatternDist = new RegExp(distanceRegEx);
    if (myPatternDist.test($('#' + elc_calcProjDistInput).val())) {
        distance = parseFloat($('#' + elc_calcProjDistInput).val());
    }
    if (distance) {
        $('#' + elc_calcProjDistInput).removeClass('calcDistNoOk');
        $('#' + elc_calcProjDistInput).addClass('calcDistOk');
    }
    else {
        if ($('#' + elc_calcProjDistInput).val().length == 0) {
            $('#' + elc_calcProjDistInput).removeClass('calcDistOk');
            $('#' + elc_calcProjDistInput).removeClass('calcDistNoOk');
            $('#' + elc_calcProjDistInput).addClass('calcDist');
        } else {
            $('#' + elc_calcProjDistInput).removeClass('calcDistOk');
            $('#' + elc_calcProjDistInput).addClass('calcDistNoOk');
        }
    }

    var myPatternDegr = new RegExp(degreeRegEx);
    if (myPatternDegr.test($('#' + elc_calcProjDegInput).val())) {
        degree = parseFloat($('#' + elc_calcProjDegInput).val());
    }
    if (degree) {
        $('#' + elc_calcProjDegInput).removeClass('calcDegrNoOk');
        $('#' + elc_calcProjDegInput).addClass('calcDegrOk');
        InsertCoordinates(startPoint, $('#' + elc_calcProjInnerBody), 99998);
    }
    else {
        if ($('#' + elc_calcProjDegInput).val().length == 0) {
            $('#' + elc_calcProjDegInput).removeClass('calcDegrOk');
            $('#' + elc_calcProjDegInput).removeClass('calcDegrNoOk');
            $('#' + elc_calcProjDegInput).addClass('calcDegr');
        } else {
            $('#' + elc_calcProjDegInput).removeClass('calcDegrOk');
            $('#' + elc_calcProjDegInput).addClass('calcDegrNoOk');
        }
    }

    $('#' + elc_calcProjInnerBody).html('');
    if (distance != null && degree != null) {
        var distanceValue = parseFloat(distance);
        var bearingValue = parseFloat(degree);
        var targetPointLatLon = startPoint.LatLon().rhumbDestinationPoint(Geo.parseDMS(bearingValue), distanceValue);

        var targetPoint = new Coords(targetPointLatLon);
        InsertCoordinates(targetPoint, $('#' + elc_calcProjInnerBody), 99999);
        InsertMaps(startPoint, targetPoint, $('#' + elc_calcProjInnerBody),510);
        if (!projExpandet) {
            $('#' + elc_calcProjInnerBody).show('blind', 1000);
            projExpandet = true;
        }
    }
    else {
        $('#' + elc_calcDistInnerBody).hide();
        projExpandet = false;
    }
}
