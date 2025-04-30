// plots/audience_reception.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

(function () {
  // margins & dimensions
  const margin = { top: 40, right: 20, bottom: 120, left: 60 };
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // create SVG
  const svg = d3
    .select("#audience-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // shared tooltip DIV (invisible at start)
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "aud-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "#ffffff") // solid white
    .style("color", "#000000") // black text
    .style("padding", "8px 12px")
    .style("border-radius", "6px")
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
    .style("font-family", "Futura, sans-serif")
    .style("font-size", "13px")
    .style("font-weight", "600")
    .style("opacity", 0) // hidden initially
    .style("z-index", 10000) // on top of everything
    .style("transition", "opacity 0.2s");

  // load the Pixar movies CSV
  d3.csv("datasets/pixar_movies.csv", (d) => ({
    movie: d.movie,
    year: +d.year_released,
    imdb_rating: +d.imdb_rating, // already 0–10
  })).then((data) => {
    // filter & sort by release date
    data = data
      .filter((d) => !isNaN(d.imdb_rating))
      .sort((a, b) => d3.ascending(a.year, b.year));

    // scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.movie))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear().domain([0, 10]).nice().range([height, 0]);

    // axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    // Y-axis label
    svg
      .append("text")
      .attr("x", -margin.left + 10)
      .attr("y", -20)
      .attr("fill", "white")
      .attr("font-size", "14px")
      .text("IMDb Score (/10)");

    // bars with table‐style tooltip
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.movie))
      .attr("y", (d) => y(d.imdb_rating))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.imdb_rating))
      .attr("fill", "#D4A017")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("fill", "#ff6f61");
        tooltip
          .html(
            `
            <table>
              <tr><th colspan="2" style="text-align:left">${d.movie}</th></tr>
              <tr><td><strong>Released:</strong></td><td>${d.year}</td></tr>
              <tr><td><strong>IMDb Score:</strong></td>
                  <td>${d.imdb_rating.toFixed(1)}/10</td></tr>
            </table>
          `
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 50 + "px")
          .style("opacity", 1);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 50 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", "#D4A017");
        tooltip.style("opacity", 0);
      });
  });
})();
