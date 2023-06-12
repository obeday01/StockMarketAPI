var chart;

function displayTable(data) {
  const tableData = data[1];
  // Display ticker details.
  if (tableData.type === 'CS') {
    $("#tickerDetailsOther").hide();
    $("#tickerName").text(tableData.name);
    $("#tickerDescription").text(tableData.description);
    $("#tickerAddress").text(tableData.address.address1 + ", " + tableData.address.city
      + ", " + tableData.address.state + " " + tableData.address.postal_code);
    $("#tickerPhone").text(tableData.phone_number);
    $("#tickerMarketCap").text(tableData.market_cap.toLocaleString());
    $("#tickerHomepage").html("<a href='" + tableData.homepage_url + "' target='_blank'>"
      + tableData.homepage_url + "</a>");
    $("#tickerDetailsCS").show();
  } else {
    $("#tickerDetailsCS").hide();
    $("#tickerName").text(tableData.name);
    $("#tickerType").text(tableData.type);
    $("#tickerMarket").text(tableData.market);
    $("#tickerExchange").text(tableData.primary_exchange);
    $("#tickerListDate").text(tableData.list_date);
    $("#tickerSharesOutstanding").text(tableData.share_class_shares_outstanding);
    $("#tickerDetailsOther").show();
  }
  $("#news-articles").hide();
}

function displayGraph(data) {
  // Extract the closing prices from the API response.
  const graphData = data[0];
  var prices = graphData.map(function (result) {
    return result.c;
  });

  // Extract the date labels from the API response.
  var labels = graphData.map(function (result) {
    var date = new Date(result.t);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // If a Chart instance exists, destroy it.
  if (chart) {
    chart.destroy();
  }

  // Create a new chart.
  var ctx = document.querySelector("#closing-prices").getContext("2d");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Closing Prices",
        data: prices,
        borderColor: "rgba(141, 139, 139, 1)",
        backgroundColor: "rgba(141, 139, 139, 0.450)"
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: false
        }
      }
    },
    responsive: true
  });

  // Show the chart and hide other sections.
  $("#closingPriceChart").show();
  $("#news-articles").hide();
}

function getNews(data) {
  // Assume jsonData variable contains news data in JSON format.
  const newsData = data[0];

  // Build the HTML for the news data.
  let newsHtml = "";
  for (let i = 0; i < newsData.length; i++) {
    const newsItem = newsData[i];
    newsHtml += `<tr>
      <td>${newsItem.publisher.name}</td>
      <td>${newsItem.title}</td>
      <td>${newsItem.author}</td>
      <td>${new Date(newsItem.published_utc).toLocaleString()}</td>
      <td><a href="${newsItem.article_url}" target="_blank">Link</a></td>
    </tr>`;
  }

  // Display the news data in the table.
  $("#news-table tbody").html(newsHtml);
  $("#news-articles").show();
}


function displayPolygonRequests() {
  const maxLines = $('#max-lines').val();

  // Get the date from the input field.
  const date = moment($('#date').val()).format('YYYY-MM-DD');
  $.ajax({
    url: 'final.php',
    method: "GET",
    data: {
      method: "getStock",
      date: date
    },
    dataType: 'json'
  }).done(function (data) {
    if (data.status === 0) {
      const requests = data.result;

      // Clear the table body.
      $('#table-body').empty();

      // Iterate over the requests and populate the table.
      let lineCount = 0;
      requests.reverse().forEach(function (request) { // Show items in the order of most recent.
        if (lineCount >= maxLines) {
          return false;
        }

        // Format the date and time.
        const dateTime = moment(request.dateTime).subtract(4, 'hours');
        const formattedTime = moment(dateTime, 'YYYY-MM-DD HH:mm:ss').format('MM/DD/YYYY, h:mm:ss A');

        // Create the hyperlink for the request type.
        const requestType = request.queryType;
        const requestLink = $('<a></a>')
          .text(requestType)
          .attr('href', 'javascript:void(0);')
          .attr('data-json', request.jsonData)
          .click(function () {
            if (requestType === 'details') {
              $("#news-articles").hide();
              const jsonData = JSON.parse($(this).attr('data-json'));
              displayTable(jsonData);
              displayGraph(jsonData);
            } else if (requestType === 'news') {
              $("#tickerDetailsCS").hide();
              $("#tickerDetailsOther").hide();
              $("#closingPriceChart").hide();
              const jsonData = JSON.parse($(this).attr('data-json'));
              getNews(jsonData);
            }
          });

        // Create a new table row and append it to the table body.
        const row = $('<tr></tr>');
        row.append($('<td></td>').text(formattedTime));
        row.append($('<td></td>').text(request.stockTicker));
        row.append($('<td></td>').append(requestLink));

        $('#table-body').append(row);

        lineCount++;
      });

      // Show the table.
      $('#polygonRequestsTable').show();
    } else {
      alert('Error retrieving data: ' + data.message);
    }
  }).fail(function (error) {
    console.log("Error:", error);
  });
}

$(document).ready(function () {
  // Event listener for Search button.
  $("#search-btn").click(function () {
    displayPolygonRequests();
  })
});
