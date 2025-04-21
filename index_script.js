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
    .style("z-index", 10000); // Bring tooltip on top

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
    .on("mouseenter", function (event, d) {
      d3.select(this).attr("fill", "#ff6f61");

      tooltip.style("opacity", 1).html(`
          <table>
            <tr><th style="text-align:left;" colspan="2">${d.film}</th></tr>
            <tr><td><strong>Released:</strong></td><td>${d.release_date.getFullYear()}</td></tr>
            <tr><td><strong>Revenue:</strong></td><td>$${d.box_office_worldwide.toLocaleString()}</td></tr>
          </table>
        `);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 50 + "px");
    })
    .on("mouseleave", function () {
      d3.select(this).attr("fill", "steelblue");
      tooltip.style("opacity", 0);
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
    .attr("fill", "white") // ← makes the title white
    .text("Worldwide Box Office of Pixar Movies (By Release Date)");
});
