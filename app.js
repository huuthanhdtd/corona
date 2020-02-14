/*
covid19.ga
copyright 2020 huuthanhdtd.com
*/

/* Get data from google spreadsheet */
function getData() {
  var URL = "1apbJy54knVUXcKpuerSrgkADdZaGJ05Xh3pqkhHZZsI";
  Tabletop.init({ key: URL, callback: showInfo, simpleSheet: true });
}
var hasComfirmed = [];
document.addEventListener('DOMContentLoaded', getData());
google.charts.load('current', { packages: ['corechart', 'line'] });

var dt;
var cols = [];
function showInfo(data) {
  if (document.getElementById('updatetime').innerText != data[0]['Cập nhật']) {
    dt = data;
    document.getElementById('updatetime').innerText = dt[0]['Cập nhật'];
    drawTable();

    document.getElementById('map').innerHTML = '';
    setMap();
    google.charts.setOnLoadCallback(drawGraph);
    //getFeed();
  }
}

function drawGraph() {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Ngày');
  data.addColumn('number', 'Nhiễm');
  data.addColumn({ type: 'number', role: 'annotation' });
  data.addColumn('number', 'Chết');
  data.addColumn({ type: 'number', role: 'annotation' });
  data.addColumn('number', 'Khỏi');
  data.addColumn('number', 'Mới');
  //data.addColumn({type: 'number', role: 'annotation'});
  for (i = 0; i < dt.length; i++) {
    var nn = parseInt(dt[i]['Nghi Nhiễm'])
    var tv = parseInt(dt[i]['Tử vong'])
    var kb = parseInt(dt[i]['Khỏi bệnh'])
    data.addRows([[dt[i]['Ngày'], nn, nn, tv, tv, kb, parseInt(dt[i]['Tăng nhiễm'])]]);
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
      title: 'Người',
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
      el.innerText = el.innerText.replace('ẨN', 'HIỆN');
      cols[col] = false;
    } else {
      el.innerText = el.innerText.replace('HIỆN', 'ẨN');
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
    html += '<tr><td>' + dt[i]['Ngày'] + '</td><td>' + dt[i]['Nghi Nhiễm'] + ' (' + dt[i]['Nhiễm'] + ')</td><td>' + dt[i]['Tử vong'] + ' (' + dt[i]['Chết'] + ')</td><td>' + dt[i]['Khỏi bệnh'] + ' (' + dt[i]['Khỏi'] + ')</td><td>' + dt[i]['Tăng nhiễm'] + '</td>' + '</tr>';
    //add Tỉnh thành
    if (dt[i]['Tỉnh thành'] != '') {
      var obj = { n: dt[i]['Ca Nhiễm'], c: dt[i]['Ca Chết'], k: dt[i]['Ca Khỏi'], opacity: parseInt(dt[i]['Ca Nhiễm']) / parseInt(lastData['Nhiễm']) * 255 }
      hasComfirmed[dt[i]['Tỉnh thành']] = obj;
    }
    //show news
    if (i > 1 && dt[i]['Cập nhật'] != '') {
      news += '<li class="tl-item"><div class="timestamp">' + dt[i]['Ngày'] + '</div><div class="item-title">' + dt[i]['Cập nhật'].replace(/\[(.*)\]\((https?:\/\/.*)\)/g, '<a href="$2" target="_blank">$1</a>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\~(.*?)\~/g, '<span style="font-weight:bold;color:#ea4335;">$1</span>').replace(/\n/g, '<br>') + '</div></li>';
    }

  }
  document.getElementById('world').innerHTML = html;
  document.getElementById('timeline').innerHTML = news;
  //Active cases
  var activecases = lastData['Nghi Nhiễm'] - lastData['Tử vong'] - lastData['Khỏi bệnh'];
  document.getElementById('activecases').innerHTML = '<div class="row"><h3><strong>' + activecases + '</strong><small> người</small></h3></div><div class="row"><div class="one-half column">Nhẹ<h4 style="color:#8080FF;margin-top:0">' + (activecases - lastData['Nghiêm trọng']) + '</h4></div> <div class="one-half column">Nghiêm trọng<h4 style="color:#ea4335;margin-top:0">' + lastData['Nghiêm trọng'] + '</h4></div></div>';
  //Vietnam
  document.getElementById('vn-stats').innerHTML = '<div class="one-third column">Nhiễm<h4>' + lastData['Nhiễm'] + '</h4></div><div class="one-third column vn-tv">Tử vong<h4>' + lastData['Chết'] + '</h4></div> <div class="one-third column vn-bp">Bình phục<h4>' + lastData['Khỏi'] + '</h4></div>'
}
setInterval(getData, 60000);

/* Atom news */
const url = 'https://news.google.com/atom/search?q=corona%20when%3A1h&hl=vi&gl=VN&ceid=VN:vi';
const textarea = document.getElementById('feed');
function getFeed() {
  feednami.load(url)
    .then(feed => {
      html = '';
      var entries = feed.entries.sort(function (a, b) { return new Date(b.date) - new Date(a.date) });
      for (var i = 0; i < 10; i++) {
        var entry = entries[i];
        if (!entry.date) {
          i--;
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

function timeago(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + " năm trước";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " tháng trước";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " ngày trước";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " giờ trước";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " phút trước";
  }
  return "vài giây trước";
}