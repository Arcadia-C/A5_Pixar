import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

d3.csv("datasets/box_office_clean.csv").then((data) => {
  data.forEach((d) => {
    d.box_office_worldwide = +d.box_office_worldwide;
  });

  renderRandomCircles(data);
});

function renderRandomCircles(data) {
  const circleChartWidth = 900;
  const circleChartHeight = 400;

  const circleSvg = d3
    .select("#you-decide-viz")
    .append("svg")
    .attr("width", circleChartWidth)
    .attr("height", circleChartHeight)
    .style("margin-top", "100px");

  // Tooltip div (create only if missing)
  let tooltip = d3.select("#tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("color", "black")
      .style("border", "1px solid #ccc")
      .style("padding", "5px 10px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("border-radius", "4px")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.15)");
  }

  // Title
  circleSvg
    .append("text")
    .attr("x", circleChartWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .text("Random Circles: One Per Pixar Movie");

  circleSvg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", () => Math.random() * circleChartWidth)
    .attr("cy", () => Math.random() * circleChartHeight)
    .attr("r", 10)
    .attr("fill", () => {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r},${g},${b})`;
    })
    .attr("opacity", 0.7)
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .on("mouseover", function (event, d) {
      const earnings = d.box_office_worldwide >= 1e9
        ? `$${(d.box_office_worldwide / 1e9).toFixed(2)}B`
        : `$${(d.box_office_worldwide / 1e6).toFixed(1)}M`;

      tooltip
        .style("opacity", 1)
        .html(`
          <div style="color:black; font-weight:bold;">${d.film}</div>
          <div style="color:black;">Box Office: ${earnings}</div>
        `);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });
}
