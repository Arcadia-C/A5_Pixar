// IMPORTANT: Change this path to match your CSV file location in your repository
d3.csv("../datasets/merged_movie_data.csv")
  .then((data) => {
    // Process the data
    const processedData = data
      .map((movie) => {
        let rtRating = 0;
        if (
          movie["Rotten Tomatoes Rating"] &&
          movie["Rotten Tomatoes Rating"] !== "N/A"
        ) {
          rtRating = parseInt(movie["Rotten Tomatoes Rating"].replace("%", ""));
        }

        // Parse date to get year
        let releaseYear = 0;
        if (movie["Release Date"]) {
          const parts = movie["Release Date"].split(" ");
          if (parts.length === 3) {
            releaseYear = parseInt(parts[2]);
          }
        }

        return {
          title: movie["Movie Title"],
          studio: movie["Studio"],
          releaseYear: releaseYear,
          rtRating: rtRating,
        };
      })
      .filter((movie) => movie.releaseYear > 0 && movie.rtRating > 0);

    // Group by year and studio
    const yearlyData = calculateYearlyAverages(processedData);

    // Calculate moving averages
    const windowSize =
      parseInt(document.getElementById("window-size").value) || 3;
    const dataWithTrends = calculateMovingAverages(yearlyData, windowSize);

    // Chart configuration
    const width = 900;
    const height = 500;
    const margin = { top: 30, right: 30, left: 60, bottom: 60 };
    const innerWidth = width - margin.left - margin.right;
    const titleX = margin.left + innerWidth * 0.6;
    const legendX = width * 0.75; // move legend to 75% across the SVG
    const titleY = margin.top * 0.6; // keeps the same vertical lift

    // Create SVG container
    const svg = d3
      .select("#chart-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // ── Tooltip (shared for all points) ─────────────────────────
    // ── Tooltip (shared for all points) ─────────────────────────
    const tip = d3
      .select("body")
      .append("div")
      .attr("class", "rt-tooltip")
      .style("position", "absolute")
      .style("padding", "10px 14px")
      .style("background", "#ffffff")
      .style("color", "#111")
      .style("border", "1px solid #bbb")
      .style("font-family", "Futura, sans-serif")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .style("border-radius", "8px")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.25)")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("transition", "opacity 0.2s")
      .style("z-index", 1000); // ← make sure it sits above everything

    // ── Tooltip (shared) … (code from previous step) ──

    // ── Helper to add points + interactive tooltip ─────────────
    function addPoints(studio, colour, key) {
      chart
        .selectAll(`.${studio}-pt`)
        .data(dataWithTrends.filter((d) => d[key] !== null))
        .enter()
        .append("circle")
        .attr("class", `${studio}-pt`)
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScale(d[key]))
        .attr("r", 5)
        .attr("fill", colour)
        .style("cursor", "pointer")
        .on("mouseenter", function (event, d) {
          d3.select(this).transition().attr("r", 8);
          chart
            .selectAll(".trend-line")
            .transition()
            .style(
              "opacity",
              studio === "pixar"
                ? (l, i, n) => (i === 0 ? 1 : 0.15)
                : (l, i, n) => (i === 1 ? 1 : 0.15)
            );
          tip
            .html(
              `
           <div style="font-weight:bold; margin-bottom:4px;">${d.year}</div>
           <div style="color:${colour}; font-weight:600;">
             ${studio === "pixar" ? "Pixar" : "DreamWorks"}: ${d[key]}%
           </div>
           <div style="margin-top:4px; font-size:11px; color:#ccc;">
             ${studio === "pixar" ? d.pixarCount : d.dreamworksCount} film(s)
           </div>
         `
            )
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY - 28 + "px")
            .transition()
            .style("opacity", 1);
        })
        .on("mousemove", (event) =>
          tip
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY - 28 + "px")
        )
        .on("mouseleave", function () {
          d3.select(this).transition().attr("r", 5);
          chart.selectAll(".trend-line").transition().style("opacity", 1);
          tip.transition().style("opacity", 0);
        });
    }

    // Set up scales
    const xScale = d3
      .scaleLinear()
      .domain([
        d3.min(dataWithTrends, (d) => d.year),
        d3.max(dataWithTrends, (d) => d.year),
      ])
      .range([0, width - margin.left - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height - margin.top - margin.bottom, 0]);

    // Add X and Y axes
    chart
      .append("g")
      .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    chart.append("g").call(d3.axisLeft(yScale));

    // Add axis labels
    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -(height - margin.top - margin.bottom) / 2)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Rotten Tomatoes Rating (%)");

    chart
      .append("text")
      .attr("y", height - margin.top - margin.bottom + 40)
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Release Year");

    // Define line generators
    const pixarLine = d3
      .line()
      .defined((d) => d.pixarRating !== null)
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.pixarRating));

    const dreamworksLine = d3
      .line()
      .defined((d) => d.dreamworksRating !== null)
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.dreamworksRating));

    const pixarTrendLine = d3
      .line()
      .defined((d) => d.pixarTrend !== null)
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.pixarTrend));

    const dreamworksTrendLine = d3
      .line()
      .defined((d) => d.dreamworksTrend !== null)
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.dreamworksTrend));

    // Add lines for raw data
    chart
      .append("path")
      .datum(dataWithTrends.filter((d) => d.pixarRating !== null))
      .attr("class", "data-line")
      .attr("d", pixarLine)
      .attr("fill", "none")
      .attr("stroke", "#93c5fd")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");

    chart
      .append("path")
      .datum(dataWithTrends.filter((d) => d.dreamworksRating !== null))
      .attr("class", "data-line")
      .attr("d", dreamworksLine)
      .attr("fill", "none")
      .attr("stroke", "#bef264")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3");

    // Add lines for trend data
    chart
      .append("path")
      .datum(dataWithTrends.filter((d) => d.pixarTrend !== null))
      .attr("class", "trend-line")
      .attr("d", pixarTrendLine)
      .attr("fill", "none")
      .attr("stroke", "#0284c7")
      .attr("stroke-width", 4);

    chart
      .append("path")
      .datum(dataWithTrends.filter((d) => d.dreamworksTrend !== null))
      .attr("class", "trend-line")
      .attr("d", dreamworksTrendLine)
      .attr("fill", "none")
      .attr("stroke", "#65a30d")
      .attr("stroke-width", 4);

    addPoints("pixar", "#0284c7", "pixarRating"); // blue
    addPoints("dreamworks", "#65a30d", "dreamworksRating"); // green
    // Add data points for DreamWorks

    // Add chart title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "1.5rem")
      .attr("font-weight", "bold")
      .attr("fill", "white");
    // .text("Is Pixar's perceived decline unique, or part of broader industry trends?");

    // Add chart subtitle
    // Title, centered over the plot area and lifted above the top line
    svg
      .append("text")
      .attr("x", titleX)
      .attr("y", titleY)
      .attr("text-anchor", "middle")
      .attr("font-size", "1.5rem")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text(
        "Critical reception comparison between Pixar and DreamWorks Animation (1995–2025)"
      );

    // Create legend
    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${width - margin.right - 10}, ${margin.top + 10})`
      );

    // Pixar trend line
    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#0284c7")
      .attr("stroke-width", 4);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 4)
      .text("Pixar Trend")
      .attr("font-size", "0.75rem")
      .attr("fill", "white");

    // DreamWorks trend line
    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 20)
      .attr("y2", 20)
      .attr("stroke", "#65a30d")
      .attr("stroke-width", 4);

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 24)
      .text("DreamWorks Trend")
      .attr("font-size", "0.75rem")
      .attr("fill", "white");
  })
  .catch((error) => {
    console.error("Error loading or processing data:", error);
  });

// Group by year and calculate averages
function calculateYearlyAverages(movies) {
  // Get unique years
  const years = [...new Set(movies.map((movie) => movie.releaseYear))].sort();

  return years.map((year) => {
    const pixarMovies = movies.filter(
      (movie) => movie.studio === "Pixar" && movie.releaseYear === year
    );

    const dreamworksMovies = movies.filter(
      (movie) => movie.studio === "DreamWorks" && movie.releaseYear === year
    );

    // Calculate averages if movies exist
    const pixarAvg =
      pixarMovies.length > 0
        ? Math.round(
            pixarMovies.reduce((sum, movie) => sum + movie.rtRating, 0) /
              pixarMovies.length
          )
        : null;

    const dreamworksAvg =
      dreamworksMovies.length > 0
        ? Math.round(
            dreamworksMovies.reduce((sum, movie) => sum + movie.rtRating, 0) /
              dreamworksMovies.length
          )
        : null;

    return {
      year,
      pixarRating: pixarAvg,
      dreamworksRating: dreamworksAvg,
      pixarCount: pixarMovies.length,
      dreamworksCount: dreamworksMovies.length,
      pixarMovies: pixarMovies.map((m) => m.title).join(", "),
      dreamworksMovies: dreamworksMovies.map((m) => m.title).join(", "),
    };
  });
}

// Calculate moving averages
function calculateMovingAverages(yearData, window) {
  if (!yearData || yearData.length === 0) return [];

  return yearData.map((yearEntry, i) => {
    // For Pixar trend
    let pixarAvg = null;
    if (yearEntry.pixarRating !== null) {
      const startIdx = Math.max(0, i - Math.floor(window / 2));
      const endIdx = Math.min(yearData.length - 1, i + Math.floor(window / 2));
      const windowYears = yearData.slice(startIdx, endIdx + 1);

      const validValues = windowYears
        .filter((y) => y.pixarRating !== null)
        .map((y) => y.pixarRating);

      if (validValues.length > 0) {
        pixarAvg = Math.round(
          validValues.reduce((sum, val) => sum + val, 0) / validValues.length
        );
      }
    }

    // For DreamWorks trend
    let dreamworksAvg = null;
    if (yearEntry.dreamworksRating !== null) {
      const startIdx = Math.max(0, i - Math.floor(window / 2));
      const endIdx = Math.min(yearData.length - 1, i + Math.floor(window / 2));
      const windowYears = yearData.slice(startIdx, endIdx + 1);

      const validValues = windowYears
        .filter((y) => y.dreamworksRating !== null)
        .map((y) => y.dreamworksRating);

      if (validValues.length > 0) {
        dreamworksAvg = Math.round(
          validValues.reduce((sum, val) => sum + val, 0) / validValues.length
        );
      }
    }

    return {
      ...yearEntry,
      pixarTrend: pixarAvg,
      dreamworksTrend: dreamworksAvg,
    };
  });
}
