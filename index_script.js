d3.csv("datasets/box_office_clean.csv").then((data) => {
  // Parse numeric and date values
  data.forEach((d) => {
    d.box_office_worldwide = +d.box_office_worldwide;
    d.release_date = new Date(d.release_date);
  });

  // Sort by release date
  data.sort((a, b) => a.release_date - b.release_date);

  // ==== First Chart: Bar Graph ====
  const width = 900;
  const height = 500;
  const margin = { top: 60, right: 30, bottom: 120, left: 80 };

  const svg = d3
    .select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.film))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.box_office_worldwide)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.film))
    .attr("y", (d) => y(d.box_office_worldwide))
    .attr("height", (d) => y(0) - y(d.box_office_worldwide))
    .attr("width", x.bandwidth())
    .attr("fill", "steelblue");

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickFormat((d) => (d >= 1e9 ? `$${d / 1e9}B` : `$${d / 1e6}M`))
    );

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("Worldwide Box Office of Pixar Movies");

  // ==== Second Chart: Random Circles with Tooltip ====
  const circleChartWidth = 900;
  const circleChartHeight = 400;

  const circleSvg = d3
    .select("#visualization")
    .append("svg")
    .attr("width", circleChartWidth)
    .attr("height", circleChartHeight)
    .style("margin-top", "100px")

  const tooltip = d3.select("#tooltip");

  circleSvg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", () => Math.random() * circleChartWidth)
    .attr("cy", () => Math.random() * circleChartHeight)
    .attr("r", 10)
    .attr("fill", () => {
      // Generate random RGB color
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgb(${r},${g},${b})`;
    })
    .attr("opacity", 0.7)
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.film}</strong>`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Title
  circleSvg
    .append("text")
    .attr("x", circleChartWidth / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .attr("fill", "white") // ⬅️ Make the title white
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
    // Generate random RGB color
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  })
  .attr("opacity", 0.7)
  .attr("stroke", "white")
  .attr("stroke-width", 1)
  .on("mouseover", function(event, d) {
    tooltip
      .style("opacity", 1)
      .html(`<strong>${d.film}</strong>`);
  })
  .on("mousemove", function(event) {
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 20) + "px");
  })
  .on("mouseout", function() {
    tooltip.style("opacity", 0);
  });

});
