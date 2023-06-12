var chart;
var jsonData = [];

function sendStockDetails(tickerSymbol, jsonData) {
  $.ajax({
    url: "final.php",
    method: "POST",
    data: {
      method: "setStock",
      stockTicker: tickerSymbol,
      queryType: "details",
      jsonData: jsonData
    }
  }).done(function (data) {
    console.log("Data:", data);
  }).fail(function (error) {
    console.log("Error:", error);
  });
}

function sendStockNews(tickerSymbol, jsonData) {
  $.ajax({
    url: "final.php?",
    method: "POST",
    data: {
      method: "setStock",
      stockTicker: tickerSymbol,
      queryType: "news",
      jsonData: jsonData
    }
  }).done(function (data) {
    console.log("Data:", data);
  }).fail(function (error) {
    console.log("Error:", error);
  });
}

function populateExchangesDropdown() {
  $.ajax({
    url: 'https://api.polygon.io/v3/reference/exchanges?asset_class=stocks&apiKey=IQVMy0LR2mRIVPQVvaQa67GfvQEV32Iv',
    method: "GET"
  }).done(function (data) {
    const exchanges = data.results;
    const $dropdown = $('#exchangesDropdown');
    $dropdown.empty();

    // Add the 'selected' attribute to the '--Select--' option.
    $dropdown.append($('<option></option>').attr('value', '').text('--Select--').prop('selected', true));
    $.each(exchanges, function (i, exchange) {
      $dropdown.append($('<option></option>').attr('value', exchange.mic).text(exchange.name));
    });
  }).fail(function (error) {
    if (error.status === 429) {
      alert('API call limit reached. Please wait for one minute.');
    } else {
      console.log("error", error.statusText);
    }
  });
}


function populateStocksDropdown() {
  const exchangeValue = $('#exchangesDropdown').val();
  const $dropdown = $('#stocksDropdown');

  // Add condition to check if exchangeValue is '--Select--'.
  if (exchangeValue === '' || exchangeValue === '--Select--') {
    $dropdown.empty();
    $dropdown.append($('<option></option>').attr('value', '').text('--Select an exchange first--'));
    return;
  }

  $dropdown.empty();
  $dropdown.append($('<option></option>').attr('value', '').text('--Select--').prop('selected', true));

  $.ajax({
    url: 'https://api.polygon.io/v3/reference/tickers?exchange=' + exchangeValue
      + '&active=true&limit=1000&apiKey=IQVMy0LR2mRIVPQVvaQa67GfvQEV32Iv',
    method: "GET"
  }).done(function (data) {
    const stocks = data.results;
    $.each(stocks, function (i, stock) {
      $dropdown.append($('<option></option>').attr('value', stock.ticker).text(stock.ticker));
    });
  }).fail(function (error) {
    if (error.status === 429) {
      alert('API call limit reached. Please wait for one minute.');
    } else {
      console.log("error", error.statusText);
    }
  });
}

function displayTable() {
  var ticker = $("#stocksDropdown").val();

  // Add condition to check if ticker is '--Select--' or '--Select an exchange first--'.
  if (ticker === '' || ticker === '--Select--' || ticker === '--Select an exchange first--') {
    return;
  }
  var apiKey = "IQVMy0LR2mRIVPQVvaQa67GfvQEV32Iv";
  $.ajax({
    url: "https://api.polygon.io/v3/reference/tickers/" + ticker + "?apiKey=" + apiKey,
    method: "GET"

  }).done(function (data) {
    // Display ticker details.
    if (data.results.type === 'CS') {
      $("#tickerDetailsOther").hide();
      $("#tickerName").text(data.results.name);
      $("#tickerDescription").text(data.results.description);
      $("#tickerAddress").text(data.results.address.address1 + ", " + data.results.address.city 
        + ", " + data.results.address.state + " " + data.results.address.postal_code);
      $("#tickerPhone").text(data.results.phone_number);
      $("#tickerMarketCap").text(data.results.market_cap.toLocaleString()); // Format market cap to have commas.
      $("#tickerHomepage").html("<a href='" + data.results.homepage_url + "' target='_blank'>" 
        + data.results.homepage_url + "</a>");
      $("#tickerDetailsCS").show();
    } else {
      $("#tickerDetailsCS").hide();
      $("#tickerName").text(data.results.name);
      $("#tickerType").text(data.results.type);
      $("#tickerMarket").text(data.results.market);
      $("#tickerExchange").text(data.results.primary_exchange);
      $("#tickerListDate").text(data.results.list_date);
      $("#tickerSharesOutstanding").text(data.results.share_class_shares_outstanding);
      $("#tickerDetailsOther").show();
    }

    jsonData.push(data.results);
    jsonDataString = JSON.stringify(jsonData);

    // Send data to server after a 1-second delay.
    setTimeout(function () {
      // Clear jsonData array if it has data.
      if (jsonData.length > 0) {
        jsonData.splice(0, jsonData.length);
      }
      sendStockDetails(ticker, jsonDataString);
    }, 1000);
  }).fail(function (error) {
    if (error.status === 429) {
      alert('API call limit reached. Please wait for one minute.');
    } else {
      console.log("error", error.statusText);
    }
  });
}

function displayGraph() {
  // Get the stock ticker.
  var ticker = $("#stocksDropdown").val();

  // Add condition to check if ticker is '--Select--' or '--Select an exchange first--'.
  if (ticker === '' || ticker === '--Select--' || ticker === '--Select an exchange first--') {
    return;
  }

  // Get the closing prices for the last 7 days.
  var today = new Date();
  var dayOfTheWeek = today.getDay();
  var daysToSubtract;   // Account for weekends.
  if (dayOfTheWeek === 0 || dayOfTheWeek === 6) { // Saturday or Sunday.
    daysToSubtract = 10;
  } else if (dayOfTheWeek === 1 || dayOfTheWeek === 2) { // Monday or Tuesday.
    daysToSubtract = 11;
  } else { // Other days.
    daysToSubtract = 9;
  }

  today.setDate(today.getDate() - daysToSubtract);
  var startDate = today.toISOString().substring(0, 10);

  var endDate = new Date().toISOString().substring(0, 10);
  $.ajax({
    url: "https://api.polygon.io/v2/aggs/ticker/" + ticker + "/range/1/day/" + startDate + "/"
      + endDate + "?unadjusted=true&sort=asc&limit=7&apiKey=IQVMy0LR2mRIVPQVvaQa67GfvQEV32Iv",
    method: "GET"
  }).done(function (data) {
    // Extract the closing prices from the API response.
    var prices = data.results.map(function (result) {
      return result.c;
    });

    // Extract the date labels from the API response.
    var labels = data.results.map(function (result) {
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
    $("#closingPriceChart").show();

    // Convert the stockData object to JSON.
    jsonData.push(data.results);
  }).fail(function (error) {
    if (error.status === 429) {
      alert('API call limit reached. Please wait for one minute.');
    } else {
      console.log("error", error.statusText);
    }
  });
}

function getNews() {
  var ticker = $("#stocksDropdown").val();

  // Add condition to check if ticker is '--Select--' or '--Select an exchange first--'.
  if (ticker === '' || ticker === '--Select--' || ticker === '--Select an exchange first--') {
    return;
  }

  $.ajax({
    url: 'https://api.polygon.io/v2/reference/news?ticker=' + ticker
      + '&apiKey=IQVMy0LR2mRIVPQVvaQa67GfvQEV32Iv',
    method: "GET"
  }).done(function (data) {
    // Extract the news data from the API response.
    const newsData = data.results;

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

    // Clear jsonData array if it has data.
    if (jsonData.length > 0) {
      jsonData.splice(0, jsonData.length);
    }
    jsonData.push(data.results);
    jsonDataString = JSON.stringify(jsonData);

    // Send data to server after a 1-second delay.
    setTimeout(function () {
      sendStockNews(ticker, jsonDataString);
    }, 1000);

    // Clear jsonData array.
    jsonData.splice(0, jsonData.length);

    // Display the news data in the table.
    $("#news-table tbody").html(newsHtml);
    $("#news-articles").show();
  }).fail(function (error) {
    if (error.status === 429) {
      alert('API call limit reached. Please wait for one minute.');
    } else {
      console.log("error", error.statusText);
    }
  });
}

// Call function to populate exchanges dropdown on page load.
$(document).ready(function () {
  populateExchangesDropdown();
  $('#exchangesDropdown').on('change', function () {
    populateStocksDropdown();
  });

  // Event listener for stock details.
  $("#details-btn").click(function () {
    $("#news-articles").hide();

    // Wait before calling table so the database stores details properly.
    setTimeout(function () {
      displayTable();
    }, 500);
    displayGraph();

    // Disable the details button to prevent spamming.
    $(this).prop('disabled', true);

    // Enable the button again after 2 seconds
    setTimeout(function () {
      $("#details-btn").prop('disabled', false);
    }, 2000);
  })

  // Event listener for stock news.
  $("#news-btn").click(function () {
    $("#tickerDetailsCS").hide();
    $("#tickerDetailsOther").hide();
    $("#closingPriceChart").hide();
    getNews();
  })
});
