// // import * as d3 from "d3";

// // Sample data
// const data = [4, 8, 15, 16, 23, 42];

// // Set up the SVG dimensions
// const width = 600;
// const height = 400;
// const margin = { top: 20, right: 20, bottom: 30, left: 40 };

// // Create the SVG container
// const svg = d3
//   .select("#visualization")
//   .append("svg")
//   .attr("width", width)
//   .attr("height", height);

// // Create scales
// const x = d3
//   .scaleBand()
//   .range([margin.left, width - margin.right])
//   .padding(0.1);

// const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// // Set the domains
// x.domain(d3.range(data.length));
// y.domain([0, d3.max(data)]);

// // Add the bars
// svg
//   .selectAll("rect")
//   .data(data)
//   .enter()
//   .append("rect")
//   .attr("x", (d, i) => x(i))
//   .attr("y", (d) => y(d))
//   .attr("width", x.bandwidth())
//   .attr("height", (d) => height - margin.bottom - y(d))
//   .attr("fill", "steelblue");

// // Add x-axis
// svg
//   .append("g")
//   .attr("transform", `translate(0,${height - margin.bottom})`)
//   .call(d3.axisBottom(x));

// // Add y-axis
// svg
//   .append("g")
//   .attr("transform", `translate(${margin.left},0)`)
//   .call(d3.axisLeft(y));
// Load the CSV file and create the visualization
d3.csv("datasets/box_office_clean.csv").then((data) => {
  // Parse numeric and date values
  data.forEach((d) => {
    d.box_office_worldwide = +d.box_office_worldwide;
    d.release_date = new Date(d.release_date);
  });

  // Sort by release date
  data.sort((a, b) => a.release_date - b.release_date);

  // SVG setup
  const width = 900;
  const height = 500;
  const margin = { top: 40, right: 30, bottom: 120, left: 80 };

  const svg = d3
    .select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // X scale: movie names
  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.film))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  // Y scale: box office revenue
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.box_office_worldwide)])
    .nice()
    .range([height - margin.bottom, margin.top]);

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
    .attr("fill", "steelblue");

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

  // Title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("Worldwide Box Office of Pixar Movies");
});
