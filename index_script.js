d3.csv("datasets/box_office_clean.csv").then((data) => {
  // Parse numeric and date values
  data.forEach((d) => {
    d.box_office_worldwide = +d.box_office_worldwide;
    d.release_date = new Date(d.release_date);
  });

  // Sort by release date
  data.sort((a, b) => a.release_date - b.release_date);

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

  // Tooltip div
  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("padding", "6px 10px")
    .style("background", "#222")
    .style("color", "#fff")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Bars
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.film))
    .attr("y", (d) => y(d.box_office_worldwide))
    .attr("height", (d) => y(0) - y(d.box_office_worldwide))
    .attr("width", x.bandwidth())
    .attr("fill", "steelblue")
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(200).attr("fill", "#ff6f61");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `<strong>${d.film}</strong><br>
            Released: ${d.release_date.getFullYear()}<br>
            Revenue: $${d.box_office_worldwide.toLocaleString()}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 40 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 40 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(200).attr("fill", "steelblue");
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // X Axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Y Axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .tickFormat((d) => (d >= 1e9 ? `$${d / 1e9}B` : `$${d / 1e6}M`))
    );

  // Chart Title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "22px")
    .attr("font-weight", "bold")
    .text("Worldwide Box Office of Pixar Movies (By Release Date)");
});
