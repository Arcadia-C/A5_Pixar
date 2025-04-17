// import * as d3 from "d3";

// Sample data
const data = [4, 8, 15, 16, 23, 42];

// Set up the SVG dimensions
const width = 600;
const height = 400;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

// Create the SVG container
const svg = d3
  .select("#visualization")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Create scales
const x = d3
  .scaleBand()
  .range([margin.left, width - margin.right])
  .padding(0.1);

const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// Set the domains
x.domain(d3.range(data.length));
y.domain([0, d3.max(data)]);

// Add the bars
svg
  .selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", (d, i) => x(i))
  .attr("y", (d) => y(d))
  .attr("width", x.bandwidth())
  .attr("height", (d) => height - margin.bottom - y(d))
  .attr("fill", "steelblue");

// Add x-axis
svg
  .append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(x));

// Add y-axis
svg
  .append("g")
  .attr("transform", `translate(${margin.left},0)`)
  .call(d3.axisLeft(y));
