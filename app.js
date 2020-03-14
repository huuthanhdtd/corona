/*
covid19.ga
copyright 2020 huuthanhdtd.com
*/

/* Get data from google spreadsheet */
var dt;
var cols = [];
//delete tabletop.js
// function getData() {
//   var URL = "1apbJy54knVUXcKpuerSrgkADdZaGJ05Xh3pqkhHZZsI";
//   Tabletop.init({ key: URL, callback: showInfo, simpleSheet: true });
// }
let sheeturl = 'https://spreadsheets.google.com/feeds/list/1apbJy54knVUXcKpuerSrgkADdZaGJ05Xh3pqkhHZZsI/omakdo1/public/values?alt=json';
function getSheet() {
  fetch(sheeturl)
  .then(res => res.json())
  .then(json => getData(json))
  .then(data => showInfo(data))
  .catch(err => { throw err });
}


function getData(json) {
  var data = [];
  json.feed.entry.forEach(entry => {
    var row = {};
      for (const [key, value] of Object.entries(entry)) {
        if (key.indexOf('gsx') == 0)
        row[key] = value.$t;
      }
      data.push(row);
    });
    //console.log(data);
    return data;
    //showInfo(data);
    // console.log(data);
}

var hasComfirmed = {};
document.addEventListener('DOMContentLoaded', getSheet());
google.charts.load('current', { packages: ['corechart', 'line'] });

// google.charts.load('current', { packages: ['corechart', 'line', 'geochart'], 'mapsApiKey': 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY', 'language':'vi' });
// google.charts.setOnLoadCallback(drawRegionsMap);
// function drawRegionsMap() {
//   var data = google.visualization.arrayToDataTable([
//     ['Country', 'Popularity'],
//     ['Germany', 200],
//     ['United States', 300],
//     ['Brazil', 400],
//     ['Canada', 500],
//     ['France', 600],
//     ['RU', 700]
//   ]);

//   var options = {};

//   var chart = new google.visualization.GeoChart(document.getElementById('geochart'));

//   chart.draw(data, options);
// }

function showInfo(data) {
  var d = (lang.Code == 'vi')?data[0]['gsx$cậpnhật']:getJaDate(data[0]['gsx$cậpnhật'].substring(0,10))+data[0]['gsx$cậpnhật'].substring(10);
  if (document.getElementById('updatetime').innerText != d) {
    dt = data;
    document.getElementById('updatetime').innerText = d;
    drawTable();

    document.getElementById('map').innerHTML = '';
    setMap();
    google.charts.setOnLoadCallback(drawGraph);
    //getFeed();
  }
}

function drawGraph() {
  var data = new google.visualization.DataTable();
  data.addColumn('string', lang['Ngày']);
  data.addColumn('number', lang['Nhiễm']);
  data.addColumn({ type: 'number', role: 'annotation' });
  data.addColumn('number', lang['Chết']);
  data.addColumn({ type: 'number', role: 'annotation' });
  data.addColumn('number', lang['Khỏi']);
  data.addColumn('number', lang['Mới']);
  //data.addColumn({type: 'number', role: 'annotation'});
  for (i = 0; i < dt.length; i++) {
    var nn = parseInt(dt[i]['gsx$confirmed']);
    var tv = parseInt(dt[i]['gsx$deaths']);
    var kb = parseInt(dt[i]['gsx$recovered']);
    var d = (lang.Code == 'vi')?dt[i]['gsx$date']:getJaDate(dt[i]['gsx$date']);
    if (d != '')
      data.addRows([[d, nn, nn, tv, tv, kb, parseInt(dt[i]['gsx$newcases'])]]);
  }


  var options = {
    hAxis: {
      title: null,
      textStyle: {
        color: '#01579b',
        fontSize: 11,
        fontName: 'Arial'
      },
      titleTextStyle: {
        color: '#01579b',
        fontSize: 11,
        fontName: 'Arial',
        bold: false,
        italic: true
      },
      slantedTextAngle: 90
    },
    vAxis: {
      title: lang['Người'],
      textStyle: {
        color: '#1a237e',
        fontSize: 12,
        bold: false
      },
      titleTextStyle: {
        color: '#1a237e',
        fontSize: 11,
        bold: false,
        italic: false
      },
      format: 'short'
    },
    height: 600,
    annotations: {
      0: { style: 'point' }
    },
    chartArea: { left: 40, top: 10, width: '100%', height: '85%' },
    colors: ['#4285f4', '#ea4335', '#38761d', '#4374e0'],
    legend: { position: 'bottom' },
    series: {
      0: { pointSize: 6, pointShape: 'square', },
      1: { pointSize: 6, pointShape: 'diamond' },
      2: { pointSize: 4, pointShape: 'circle' },
      3: { lineDashStyle: [1, 1] }
    },
    focusTarget: 'category'
  };
  var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
  google.visualization.events.addListener(chart, 'ready', function () {
    document.getElementById('imageChart').setAttribute("href", chart.getImageURI()); //.setAttribute("download", "ncov" + document.getElementById('updatetime').innerText +".png");
    document.getElementById('imageChart').setAttribute("download", `ncov${document.getElementById('updatetime').innerText}.png`);
  });
  chart.draw(data, options);

  var t = document.getElementsByClassName("toggle");
  for (var i = 0; i < t.length; i++) {
    t[i].onclick = function (e) { toggle(this); }
    if (cols.length < 4) {
      cols[t[i].getAttribute('col')] = true;
    }
    else {
      if (cols[t[i].getAttribute('col')] == false || cols[t[i].getAttribute('col') + 1] == false) refreshChart();
    }
  };
  function toggle(el) {
    var col = parseInt(el.getAttribute('col'));
    view = new google.visualization.DataView(data);
    if (cols[col] == true) {
      el.innerText = el.innerText.replace(lang['Ẩn'], lang['Hiện']);
      cols[col] = false;
    } else {
      el.innerText = el.innerText.replace(lang['Hiện'], lang['Ẩn']);
      cols[col] = true;
    }
    refreshChart();
  }
  function refreshChart() {
    var setCols = [0, 1, 3, 5, 6];
    cols.forEach(function (c, i) { if (c == true) setCols.push(i); });
    view = new google.visualization.DataView(data);
    view.setColumns(setCols.sort());
    chart.draw(view, options);
  }
}

async function drawTable() {
  var html = '';
  var htmlCountries = '';
  var htmlProvinces = '';
  var news = '';
  hasComfirmed = {};
  var lastData; //= dt[dt.length - 1];
  var ri = 0;
  for (var i = dt.length - 1; i >= 0; i--) {
    var d = (lang.Code == 'vi')?dt[i]['gsx$date']:getJaDate(dt[i]['gsx$date']);
    //add by date
    if (d != ''){
      if (!lastData) lastData = dt[i];
      html += '<tr><td>' + d + '</td><td>' + dt[i]['gsx$confirmed'] + ' (' + dt[i]['gsx$vnconfirmed'] + ')</td><td>' + dt[i]['gsx$deaths'] + ' (' + dt[i]['gsx$vndeaths'] + ')</td><td>' + dt[i]['gsx$recovered'] + ' (' + dt[i]['gsx$vnrecovered'] + ')</td><td>' + dt[i]['gsx$newcases'] + '</td>' + '</tr>';
    }
     
    //countries
    htmlCountries += '<tr><td>' + dt[ri]['gsx$country'] + '</td><td>' + dt[ri]['gsx$totalcases'] + '</td><td>';
    //if (dt[ri]['gsx$totalnewcases'] != '') htmlCountries +=  '+';
    htmlCountries +=  dt[ri]['gsx$totalnewcases'] + '</td><td>'  + dt[ri]['gsx$totaldeaths'] + '</td><td>';
    //if (dt[ri]['gsx$totalnewdeaths'] != '') htmlCountries +=  '+';
    htmlCountries +=  dt[ri]['gsx$totalnewdeaths'] + '</td><td>' + dt[ri]['gsx$totalrecovered'] + '</td><td>' + dt[ri]['gsx$totalcritical'] + '</td>' + '</tr>';
    ri++;

    //add Tỉnh thành
    if (dt[i]['gsx$tỉnhthành'] != '') {
      var obj = { n: dt[i]['gsx$canhiễm'], c: dt[i]['gsx$cachết'], k: dt[i]['gsx$cakhỏi'], opacity: parseInt(dt[i]['gsx$canhiễm']) / parseInt(lastData['gsx$vnconfirmed']) * 255 }
      hasComfirmed[dt[i]['gsx$tỉnhthành']] = obj;
      htmlProvinces = '<tr><td>' + dt[i]['gsx$tỉnhthành'] + '</td><td>' + dt[i]['gsx$canhiễm'] + '</td><td>' + dt[i]['gsx$cachết'] + '</td><td>' + dt[i]['gsx$cakhỏi'] +'</td><td>' + '</tr>' + htmlProvinces
    }
    //add news
    if (i > 1 && dt[i][lang['gsx$cậpnhật']] != '') {
      news += '<li class="tl-item"><div class="timestamp">' + d + '</div><div class="item-title">' + dt[i][lang['gsx$cậpnhật']].replace(/\[(.*)\]\((https?:\/\/(?:(?!\().)*?)\)/g, '<a href="$2" target="_blank">$1</a>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\~(.*?)\~/g, '<span style="font-weight:bold;color:#ea4335;">$1</span>').replace(/\n/g, '<br>') + '</div></li>';
    }

  }
  document.getElementById('world').innerHTML = html;
  document.getElementById('totalcountries').innerHTML = htmlCountries;
  document.getElementById('totalprovinces').innerHTML = htmlProvinces;
  document.getElementById('timeline').innerHTML = news;
  document.getElementById('countries').innerText = dt[0]['gsx$update'];
  //Active cases
  var activecases = lastData['gsx$confirmed'] - lastData['gsx$deaths'] - lastData['gsx$recovered'];
  document.getElementById('activecases').innerHTML = '<div class="row"><h3><strong>' + activecases + '</strong><small> '+lang['người']+'</small></h3></div><div class="row"><div class="one-half column">'+lang['Nhẹ']+'<h4 style="color:#8080FF;margin-top:0">' + (activecases - lastData['gsx$critical']) + '</h4></div> <div class="one-half column">'+lang['Nghiêm trọng']+'<h4 style="color:#ea4335;margin-top:0">' + lastData['gsx$critical'] + '</h4></div></div>';
  //Vietnam
  document.getElementById('vn-stats').innerHTML = '<div class="one-third column">'+lang['Nhiễm']+'<h4>' + lastData['gsx$vnconfirmed'] + '</h4></div><div class="one-third column vn-tv">'+lang['Tử vong']+'<h4>' + lastData['gsx$vndeaths'] + '</h4></div> <div class="one-third column vn-bp">'+lang['Bình phục']+'<h4>' + lastData['gsx$vnrecovered'] + '</h4></div>'
}
setInterval(getSheet, 60000);

/* Atom news */
const url = 'https://news.google.com/atom/search?q=corona%20' + lang['feed'];
const textarea = document.getElementById('feed');
function getFeed() {
  feednami.load(url)
    .then(feed => {
      html = '';
      var entries = feed.entries.sort(function (a, b) { return new Date(b.date) - new Date(a.date) });
      var cnt = 0;
      for (var i = 0; i < entries.length; i++) {
        if (cnt > 10) break;
        cnt++;
        var entry = entries[i];
        if (!entry.date || entry.description.indexOf('<li>') >= 0) {
          continue;
        }
        
        var day = timeago(new Date(entry.date));
        html += `<li>${entry.description} <time class="timeago" data="${entry.date}">${day}</time></li>`
      }
      document.getElementById('feed').innerHTML = html;
      setInterval(updateFeedTime, 60000);
    });
}
getFeed();
function updateFeedTime() {
  var x = document.getElementsByClassName("timeago");
  for (var i = 0; i < x.length; i++) {
    x[i].innerText = timeago(new Date(x[i].getAttribute("data")));
  }
}
//social share
function fbShare() {
  var winTop = (screen.height / 2) - (520 / 2);
  var winLeft = (screen.width / 2) - (350 / 2);
  window.open('https://www.facebook.com/sharer/sharer.php?u=https://covid19.ga/', 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=520,height=350');
  return false;
}


//extra function from here
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

var _0xa2d2=["\x64\x69\x76","\x63\x72\x65\x61\x74\x65\x45\x6C\x65\x6D\x65\x6E\x74","\x74\x65\x78\x74\x41\x6C\x69\x67\x6E","\x73\x74\x79\x6C\x65","\x63\x65\x6E\x74\x65\x72","\x52\x47\x56\x7A\x61\x57\x64\x75\x5A\x57\x51\x67\x59\x6E\x6B\x67\x62\x6D\x68\x30\x51\x47\x68\x31\x64\x58\x52\x6F\x59\x57\x35\x6F\x5A\x48\x52\x6B\x4C\x6D\x4E\x76\x62\x53\x34\x67\x52\x47\x46\x30\x59\x54\x6F\x67\x51\x75\x47\x37\x6D\x53\x42\x5A\x49\x46\x54\x68\x75\x72\x38\x73\x49\x46\x64\x76\x63\x6D\x78\x6B\x54\x30\x31\x6C\x64\x47\x56\x79\x63\x77\x3D\x3D","\x61\x74\x6F\x62","\x63\x72\x65\x61\x74\x65\x54\x65\x78\x74\x4E\x6F\x64\x65","\x61\x70\x70\x65\x6E\x64\x43\x68\x69\x6C\x64","\x62\x6F\x64\x79"];var x=document[_0xa2d2[1]](_0xa2d2[0]);x[_0xa2d2[3]][_0xa2d2[2]]= _0xa2d2[4];x[_0xa2d2[8]](document[_0xa2d2[7]](decodeURIComponent(escape(window[_0xa2d2[6]](_0xa2d2[5])))));document[_0xa2d2[9]][_0xa2d2[8]](x)

function getJaDate(date) {
  return date.split("/").reverse().join("/");
}

function timeago(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + lang['năm'];
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + lang['tháng'];
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + lang['ngày'];
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + lang['giờ'];
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + lang['phút'];
  }
  return lang['giây'];;
}