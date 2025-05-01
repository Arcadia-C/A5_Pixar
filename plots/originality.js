import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


d3.csv("../datasets/box_office_clean.csv").then((data) => {
  const knownSequels = [
    "Finding Dory",
    "Lightyear",
    "Cars 2",
    "Cars 3",
    "Toy Story 2",
    "Toy Story 3",
    "Toy Story 4",
    "Monsters University",
    "Incredibles 2",
  ];

  data.forEach((d) => {
    d.release_date = new Date(d.release_date);

    const isInSequelList = knownSequels.some((title) =>
      d.film.toLowerCase().includes(title.toLowerCase())
    );
    const hasNumber = /\d/.test(d.film);
    d.originality = hasNumber || isInSequelList ? -1 : 1;
  });

  data.sort((a, b) => a.release_date - b.release_date);

  const width = 900;
  const height = 250;
  const margin = { top: 50, right: 30, bottom: 120, left: 80 };

  const svg = d3
    .select("#originality")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.film))
    .range([margin.left, width - margin.right])
    .padding(0.5);

  const baselineY = height - margin.bottom - 40;
  const offset = 25;

  const color = (d) => (d.originality === 1 ? "#00c853" : "#e53935");

  // Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(255, 255, 255, 0.95)")
    .style("color", "#222")
    .style("border", "1px solid #ccc")
    .style("border-radius", "8px")
    .style("padding", "12px")
    .style("font-family", "Futura, sans-serif")
    .style("font-size", "14px")
    .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.15)")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 10000);

  // Circles
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.film) + x.bandwidth() / 2)
    .attr("cy", (d) => (d.originality === 1 ? baselineY - offset : baselineY))
    .attr("r", 10)
    .attr("fill", (d) => color(d))
    .attr("opacity", 0.9)
    .on("mouseover", function (event, d) {
      tooltip
        .html(
          `<strong>${d.film}</strong><br>
           Released: ${d.release_date.getFullYear()}<br>
           ${d.originality === 1 ? "Original" : "Sequel/Franchise"}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 40 + "px")
        .style("opacity", 1);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 40 + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // X Axis
  svg
    .append("g")
    .attr("transform", `translate(0,${baselineY + 20})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .text("Pixar's Original vs. Franchise Movies");
});
