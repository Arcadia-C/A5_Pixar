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
    const width = 1250;
    const height = 600;
    const margin = { top: 60, right: 350, bottom: 120, left: 80 };
  
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
      .attr("data-orig-x", (d) => x(d.movie))
      .attr("data-orig-width", x.bandwidth())
      .on("mouseover", function (event, d) {
        if (activeBar === this) return;
      
        d3.select(this).attr("fill", "tomato");
      
        // Bold the x-axis label
        svg.selectAll(".x-axis text")
          .filter(function () {
            return d3.select(this).text() === d.movie;
          })
          .style("font-weight", "bold")
          .style("fill", "#d33");
      })
      .on("mouseout", function (event, d) {
        if (activeBar === this) return;
      
        d3.select(this).attr("fill", "steelblue");
      
        svg.selectAll(".x-axis text")
          .filter(function () {
            return d3.select(this).text() === d.movie;
          })
          .style("font-weight", null)
          .style("fill", null);
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        d3.select(this).raise();
        // Skip if same bar is already active
        if (activeBar === this) return;
  
        // Collapse previous bar
        if (activeBar && activeBar !== this) {
          const prevBar = d3.select(activeBar);
          const prevData = prevBar.data()[0];
          const prevX = +prevBar.attr("data-orig-x");
          const prevWidth = +prevBar.attr("data-orig-width");
  
          d3.selectAll(".expanded-panel").remove();
  
          prevBar.transition().duration(300)
            .attr("x", prevX)
            .attr("width", prevWidth)
            .attr("y", y(prevData.total_worldwide_gross_sales))
            .attr("height", y(0) - y(prevData.total_worldwide_gross_sales))
            .attr("fill", "steelblue");
  
          activeBar = null;
          tooltipLocked = false;
        }
  
        activeBar = this;
        tooltipLocked = true;
  
        const bar = d3.select(this);
        const originalX = +bar.attr("data-orig-x");
        const originalY = y(d.total_worldwide_gross_sales);
        const expandedX = originalX;              
        const expandedWidth = x.bandwidth() + 300; 
        const expandedHeight = 400;                
        const expandedY = originalY - expandedHeight + (y(0) - originalY);
  
        bar.transition()
          .duration(300)
          .attr("x", expandedX)
          .attr("width", expandedWidth)
          .attr("y", expandedY)
          .attr("height", expandedHeight)
          .attr("fill", "tomato")
          .attr("opacity", 0.8)
          .on("end", () => {
            svg.append("foreignObject")
              .attr("class", "expanded-panel")
              .attr("x", expandedX + 5)
              .attr("y", expandedY + 5)
              .attr("width", expandedWidth - 10)
              .attr("height", expandedHeight - 10)
              .style("z-index", 9000)
              .raise()
              .html(`
                <div xmlns="http://www.w3.org/1999/xhtml" style="
                  font-size: 12px;
                  padding: 8px;
                  background: url('${d.image}') center center / cover no-repeat;
                  border-radius: 8px;
                  overflow: auto;
                  height: 100%;
                ">
                  <div style="display: flex; justify-content: flex-end;">
                    <button
                        onclick="closeExpandedBar()"
                        style="
                        background: none;
                        border: none;
                        color: #666;
                        font-size: 20px;
                        cursor: pointer;
                        padding: 0;
                        "
                        aria-label="Close tooltip"
                        title="Close"
                    >
                        ✕
                    </button>
                  </div>
                  <div style="font-weight: bold; font-size: 14px;">${d.movie}</div>
                  ${d.youtube_trailer_url ? `
                    <div style="margin-top: 10px;">
                      <iframe width="100%" height="150" src="${d.youtube_trailer_url}" frameborder="0" allowfullscreen></iframe>
                    </div>
                  ` : ''}
                  <div style="margin-bottom: 4px;">Released: ${d.year_released}</div>
                  <div><strong>Director:</strong> ${d.director}</div>
                  <div><strong>Genre:</strong> ${d.movie_genre}</div>
                  <div><strong>Rating:</strong> ${d.movie_rating}</div>
                  <div><strong>Rotten Tomatoes:</strong> ${d.rotten_tomatoes_rating}</div>
                  <div style="margin-top: 8px; font-style: italic;">${d.plot_summary}</div>
                </div>
              `);
              
          });
      });
  
    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .attr("class", "x-axis")
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
  
    // Click outside = collapse
    document.addEventListener("click", (event) => {
      const panel = document.querySelector(".expanded-panel");
      if (panel && !panel.contains(event.target)) {
        closeExpandedBar();
      }
    });
  
    // Helper: Close & restore
    window.closeExpandedBar = function () {
        d3.selectAll(".expanded-panel").remove();
      
        // Reset all bars to their original position, size, and color
        d3.selectAll("rect")
          .transition()
          .duration(500)
          .attr("x", d => x(d.movie))
          .attr("width", x.bandwidth())
          .attr("y", d => y(d.total_worldwide_gross_sales))
          .attr("height", d => y(0) - y(d.total_worldwide_gross_sales))
          .attr("fill", "steelblue")
          .attr("opacity", 1);
      
        // Reset all axis label styles
        d3.selectAll(".x-axis text")
          .style("font-weight", null)
          .style("fill", null);
      
        activeBar = null;
        tooltipLocked = false;
      };
  }
  
