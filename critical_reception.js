d3.csv("datasets/academy.csv").then((data) => {

  data.forEach((d) => {

    // Simplify if it has an X we won't visualize it in the visualization
    if (d.status == "Award not yet introduced" || d.status == "Ineligible"){
      d.status = "X"
    }

    // Instead, will have a line to show when the "best animated feature"
    // Was introduced


  });

  data.sort((a, b) => a.release_date - b.release_date);

  const width = 900;
  const height = 300;
  const margin = { top: 50, right: 30, bottom: 120, left: 80 };

  const svg = d3
    .select("#critical")
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
    .domain([-1, 1])
    .range([height - margin.bottom, margin.top]);

  const color = (d) => (d.originality === 1 ? "#00c853" : "#e53935");

  // Bars
  // svg
  //   .selectAll("rect")
  //   .data(data)
  //   .enter()
  //   .append("rect")
  //   .attr("x", (d) => x(d.film))
  //   .attr("y", (d) => (d.originality === 1 ? y(1) : y(0)))
  //   .attr("width", x.bandwidth())
  //   .attr("height", (d) => Math.abs(y(0) - y(d.originality)))
  //   .attr("fill", (d) => color(d))
  //   .attr("opacity", 0.8);


  // Dots with images
  svg
    .selectAll("image")
    .data(data)
    .enter()
    .append("image")
    .attr("xlink:href", "images/oscar_icon.png")
    .attr("x", (d) => x(d.film))
    .attr("y", (d) => y(1))
    .attr("width", 30)
    .attr("height", 30);

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

  svg
    .selectAll("image")
    .on("mouseover", function (event, d) {
      tooltip
        .html(
          `
              <strong>${d.film}</strong><br>
              Released: ${d.release_date.getFullYear()}<br>
              ${d.status}
            `
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
    .attr("transform", `translate(0,${y(0)})`)
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
    );

  // Title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .attr("font-weight", "bold")
    .attr("fill", "white")
    .text("Pixar's Academy Award Nominations and Wins");
});
