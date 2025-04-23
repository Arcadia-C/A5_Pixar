import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

d3.csv("datasets/pixar_movies.csv").then((data) => {
  data.forEach((d) => {
    const match = d.total_worldwide_gross_sales
      .replace(/\$/g, "")
      .trim()
      .match(/^([\d.]+)\s*(million|billion)$/i);

    if (match) {
      const [_, value, unit] = match;
      const multiplier = unit.toLowerCase() === "billion" ? 1e9 : 1e6;
      d.total_worldwide_gross_sales = +value * multiplier;
    } else {
      d.total_worldwide_gross_sales = 0;
    }

    d.year_released = +d.year_released;
    d.youtube_trailer_url = d.youtube_trailer_url?.trim();
  });

  data.sort((a, b) => a.year_released - b.year_released);
  renderBarChart(data);
});

function renderBarChart(data) {
  const width = 900;
  const height = 500;
  const margin = { top: 60, right: 30, bottom: 120, left: 80 };

  const svg = d3
    .select("#you-decide-viz")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.movie))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.total_worldwide_gross_sales)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Tooltip setup
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
        .style("opacity", 0)
        .style("border-radius", "4px")
        .style("max-width", "320px")
        .style("box-shadow", "0 2px 5px rgba(0,0,0,0.15)");
  }

  let activeBar = null;
  let tooltipLocked = false;

  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(d.movie))
    .attr("y", (d) => y(d.total_worldwide_gross_sales))
    .attr("height", (d) => y(0) - y(d.total_worldwide_gross_sales))
    .attr("width", x.bandwidth())
    .attr("fill", "steelblue")
    .on("mouseover", function (event, d) {
      if (activeBar) return;

      tooltip
        .style("opacity", 1)
        .html(`
          <div style="color:black; font-weight:bold;">${d.movie}</div>
          <div style="color:black;">Released: ${d.year_released}</div>
        `);
    })
    .on("mousemove", function (event) {
      if (activeBar) return;

      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    })
    .on("mouseout", function () {
      if (activeBar) return;
      tooltip
      .style("opacity", 0);
    })
    .on("click", function (event, d) {
        event.stopPropagation();
      
        // Block click if tooltip is already active on another bar
        if (tooltipLocked && this !== activeBar && activeBar !== null) return;
      
        // Reset previously active bar
        if (activeBar && activeBar !== this) {
          d3.select(activeBar).attr("fill", "steelblue");
        }
      
        activeBar = this;
        tooltipLocked = true;
        d3.select(this).attr("fill", "tomato");
      
        tooltip
          .style("opacity", 1)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`)
          .style("max-width", "320px")
          .style("pointer-events", "auto")
          .style("z-index", "9999")
          .html(`
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="color:black; font-weight:bold; font-size:16px;">${d.movie}</div>
              <button id="close-tooltip" style="margin-left:10px; padding:4px 8px; font-size:12px; cursor:pointer;">Close</button>
            </div>
            ${d.youtube_trailer_url ? `
              <div style="margin-top: 10px;">
                <iframe
                  width="300"
                  height="170"
                  src="${d.youtube_trailer_url}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>` : ''
            }
            <div style="color:black;">Released: ${d.year_released}</div>
            <div style="margin-top: 6px;"><strong>Director:</strong> ${d.director}</div>
            <div><strong>Genre:</strong> ${d.movie_genre}</div>
            <div><strong>Rating:</strong> ${d.movie_rating}</div>
            <div><strong>Rotten Tomatoes:</strong> ${d.rotten_tomatoes_rating}</div>
            <div style="margin-top: 6px;"><em>${d.plot_summary}</em></div>
          `);
      
        setTimeout(() => {
        document.getElementById("close-tooltip")?.addEventListener("click", () => {
            // Hide the tooltip completely
            tooltip
            .style("opacity", 0)
            .style("pointer-events", "none")
            .html("");

            // Reset bar appearance and lock
            d3.select(activeBar).attr("fill", "steelblue");
            activeBar = null;
            tooltipLocked = false;
        
            // 🔁 Re-enable the tooltip after a short delay to allow hover to resume
            setTimeout(() => {
            tooltip
                .style("display", "block")
                .style("pointer-events", "auto");
            }, 100);  // Slight delay to avoid interference
        });
        }, 0);
    });

  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(
      d3.axisLeft(y).tickFormat((d) =>
        d >= 1e9 ? `$${d / 1e9}B` : `$${d / 1e6}M`
      )
    );

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("Worldwide Box Office of Pixar Movies");
}
