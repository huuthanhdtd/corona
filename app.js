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
  var news = '';
  hasComfirmed = {};
  var lastData = dt[dt.length - 1];
  for (var i = dt.length - 1; i >= 0; i--) {
    var d = (lang.Code == 'vi')?dt[i]['gsx$date']:getJaDate(dt[i]['gsx$date']);
    html += '<tr><td>' + d + '</td><td>' + dt[i]['gsx$confirmed'] + ' (' + dt[i]['gsx$nhiễm'] + ')</td><td>' + dt[i]['gsx$deaths'] + ' (' + dt[i]['gsx$chết'] + ')</td><td>' + dt[i]['gsx$recovered'] + ' (' + dt[i]['gsx$khỏi'] + ')</td><td>' + dt[i]['gsx$newcases'] + '</td>' + '</tr>';
    //add Tỉnh thành
    if (dt[i]['gsx$tỉnhthành'] != '') {
      var obj = { n: dt[i]['gsx$canhiễm'], c: dt[i]['gsx$cachết'], k: dt[i]['gsx$cakhỏi'], opacity: parseInt(dt[i]['gsx$canhiễm']) / parseInt(lastData['gsx$nhiễm']) * 255 }
      hasComfirmed[dt[i]['gsx$tỉnhthành']] = obj;
    }
    //add news
    if (i > 1 && dt[i][lang['gsx$cậpnhật']] != '') {
      news += '<li class="tl-item"><div class="timestamp">' + d + '</div><div class="item-title">' + dt[i][lang['gsx$cậpnhật']].replace(/\[(.*)\]\((https?:\/\/.*)\)/g, '<a href="$2" target="_blank">$1</a>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\~(.*?)\~/g, '<span style="font-weight:bold;color:#ea4335;">$1</span>').replace(/\n/g, '<br>') + '</div></li>';
    }

  }
  document.getElementById('world').innerHTML = html;
  document.getElementById('timeline').innerHTML = news;
  document.getElementById('countries').innerText = dt[1]['gsx$cậpnhật'];
  //Active cases
  var activecases = lastData['gsx$confirmed'] - lastData['gsx$deaths'] - lastData['gsx$recovered'];
  document.getElementById('activecases').innerHTML = '<div class="row"><h3><strong>' + activecases + '</strong><small> '+lang['người']+'</small></h3></div><div class="row"><div class="one-half column">'+lang['Nhẹ']+'<h4 style="color:#8080FF;margin-top:0">' + (activecases - lastData['gsx$critical']) + '</h4></div> <div class="one-half column">'+lang['Nghiêm trọng']+'<h4 style="color:#ea4335;margin-top:0">' + lastData['gsx$critical'] + '</h4></div></div>';
  //Vietnam
  document.getElementById('vn-stats').innerHTML = '<div class="one-third column">'+lang['Nhiễm']+'<h4>' + lastData['gsx$nhiễm'] + '</h4></div><div class="one-third column vn-tv">'+lang['Tử vong']+'<h4>' + lastData['gsx$chết'] + '</h4></div> <div class="one-third column vn-bp">'+lang['Bình phục']+'<h4>' + lastData['gsx$khỏi'] + '</h4></div>'
}
setInterval(getSheet, 60000);

var x = document.createElement("div");
x.style.textAlign = "center";
x.appendChild(document.createTextNode(decodeURIComponent(escape(window.atob(lang['source'])))));
document.body.appendChild(x); 

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