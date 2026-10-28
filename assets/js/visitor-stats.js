(function () {
  "use strict";

  var widget = document.querySelector("[data-visitor-stats]");
  if (!widget) return;

  var siteCode = widget.getAttribute("data-site-code");
  if (!/^[a-z0-9-]+$/.test(siteCode || "")) return;

  var timeZone = widget.getAttribute("data-time-zone") || "Asia/Shanghai";
  var today;
  try {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    var dateParts = {};
    parts.forEach(function (part) {
      dateParts[part.type] = part.value;
    });
    today = dateParts.year + "-" + dateParts.month + "-" + dateParts.day;
  } catch (error) {
    return;
  }

  var endpoint = "https://" + siteCode + ".goatcounter.com/counter/TOTAL.json";

  function loadCount(url, selector) {
    return fetch(url).then(function (response) {
      if (!response.ok) throw new Error("Counter unavailable");
      return response.json();
    }).then(function (data) {
      if (typeof data.count !== "string") throw new Error("Invalid counter");
      widget.querySelector(selector).textContent = data.count;
    }).catch(function () {
      // Keep the placeholder when public counts are unavailable.
    });
  }

  loadCount(endpoint + "?start=" + today + "&end=" + today, "[data-visitor-today]");
  loadCount(endpoint, "[data-visitor-total]");
}());
