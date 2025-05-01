// plots/audience_reception.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

(function () {
  // margins & dimensions
  const margin = { top: 40, right: 20, bottom: 120, left: 60 };
  const width = 900 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3
    .select("#audience-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Shared tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "aud-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "#ffffff")
    .style("color", "#000000")
    .style("padding", "8px 12px")
    .style("border-radius", "6px")
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
    .style("font-family", "Futura, sans-serif")
    .style("font-size", "13px")
    .style("font-weight", "600")
    .style("opacity", 0)
    .style("z-index", 10000)
    .style("transition", "opacity 0.2s");

  // Load & parse data
  d3.csv("datasets/pixar_movies.csv", (d) => ({
    movie: d.movie,
    year: +d.year_released,
    rt: +d.rotten_tomatoes_rating.replace("%", ""), // 0–100
    imdb: +d.imdb_rating * 10, // convert 0–10 → 0–100
    meta: +d.metacritic_rating, // 0–100
  })).then((data) => {
    // filter & sort by release year
    data = data
      .filter((d) => !isNaN(d.rt) && !isNaN(d.imdb) && !isNaN(d.meta))
      .sort((a, b) => d3.ascending(a.year, b.year));

    // X and Y scales
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.movie))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear().domain([0, 100]).nice().range([height, 0]);

    // X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    svg.append("g").call(d3.axisLeft(y).tickFormat((d) => d + "%"));

    // Y-axis label
    svg
      .append("text")
      .attr("x", -margin.left + 10)
      .attr("y", -20)
      .attr("fill", "white")
      .attr("font-size", "14px")
      .text("Score (%)");

    // Line generators
    const lineRT = d3
      .line()
      .x((d) => x(d.movie) + x.bandwidth() / 2)
      .y((d) => y(d.rt));

    const lineIMDB = d3
      .line()
      .x((d) => x(d.movie) + x.bandwidth() / 2)
      .y((d) => y(d.imdb));

    const lineMeta = d3
      .line()
      .x((d) => x(d.movie) + x.bandwidth() / 2)
      .y((d) => y(d.meta));

    // Draw lines
    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "crimson")
      .attr("stroke-width", 2)
      .attr("d", lineRT);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "yellow") // IMDb line is yellow
      .attr("stroke-width", 2)
      .attr("d", lineIMDB);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "darkorange")
      .attr("stroke-width", 2)
      .attr("d", lineMeta);

    // Helper to draw dots & tooltip for each series
    function drawDots(key, color, label, formatValue) {
      svg
        .selectAll(`.dot-${key}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", `dot-${key}`)
        .attr("cx", (d) => x(d.movie) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d[key]))
        .attr("r", 5)
        .attr("fill", color)
        .style("cursor", "pointer")
        .on("mouseenter", (event, d) => {
          d3.select(event.currentTarget)
            .transition()
            .attr("r", 8)
            .attr("fill", "#ff6f61");
          tooltip
            .html(
              `<table>
               <tr><th colspan="2" style="text-align:left">${d.movie}</th></tr>
               <tr><td><strong>Year:</strong></td><td>${d.year}</td></tr>
               <tr><td><strong>${label}:</strong></td><td>${formatValue(
                d[key]
              )}</td></tr>
             </table>`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 50}px`)
            .style("opacity", 1);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 50}px`);
        })
        .on("mouseleave", (event) => {
          d3.select(event.currentTarget)
            .transition()
            .attr("r", 5)
            .attr("fill", color);
          tooltip.style("opacity", 0);
        });
    }

    // Draw dots for each critic
    drawDots("rt", "crimson", "Rotten Tomatoes", (v) => v.toFixed(0) + "%");
    drawDots("imdb", "yellow", "IMDb", (v) => (v / 10).toFixed(1) + "/10");
    drawDots("meta", "darkorange", "Metacritic", (v) => v.toFixed(0) + "%");

    // Legend in top-right
    const legendData = [
      { name: "Rotten Tomatoes", color: "crimson" },
      { name: "IMDb", color: "yellow" },
      { name: "Metacritic", color: "darkorange" },
    ];

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width + 20}, 0)`);

    legendData.forEach((d, i) => {
      const row = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      row
        .append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", d.color);
      row
        .append("text")
        .attr("x", 16)
        .attr("y", 12)
        .attr("fill", "white")
        .attr("font-size", "12px")
        .text(d.name);
    });
  });
})();
