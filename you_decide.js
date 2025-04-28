// Full you_decide.js (merged version with sliders, color blending, expanded tooltips)

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

(function() {

  // Color assignment for each metric
  const colors = {
    boxOffice: d3.color("#1f77b4"),
    openingWeekend: d3.color("#ff7f0e"),
    rottenTomatoes: d3.color("#2ca02c"),
    imdb: d3.color("#d62728"),
    metacritic: d3.color("#9467bd"),
  };

  let weightBoxOffice = 50;
  let weightOpening = 50;
  let weightRotten = 50;
  let weightIMDB = 50;
  let weightMetacritic = 50;
  let svg, x, y, bars;

  // Load data
  d3.csv("datasets/pixar_movies.csv").then((data) => {
    data.forEach((d) => {
      // Normalize total gross
      const match = d.total_worldwide_gross_sales
        ?.replace(/\$/g, "")
        .trim()
        .match(/^([\d.]+)\s*(million|billion)$/i);
      if (match) {
        const [_, value, unit] = match;
        const multiplier = unit.toLowerCase() === "billion" ? 1e9 : 1e6;
        d.total_worldwide_gross_sales = +value * multiplier;
      } else {
        d.total_worldwide_gross_sales = 0;
      }

      // Normalize opening weekend
      const openMatch = d.opening_weekend_box_office_sales
        ?.replace(/\$/g, "")
        .trim()
        .match(/^([\d.]+)\s*(million|billion)$/i);
      if (openMatch) {
        const [_, value, unit] = openMatch;
        const multiplier = unit.toLowerCase() === "billion" ? 1e9 : 1e6;
        d.opening_weekend_box_office_sales = +value * multiplier;
      } else {
        d.opening_weekend_box_office_sales = 0;
      }

      d.year_released = +d.year_released;
      d.rotten_tomatoes_rating = +d.rotten_tomatoes_rating?.replace("%", "");
      d.imdb_rating = +d.imdb_rating * 10; // Rescale to 0–100
      d.metacritic_rating = +d.metacritic_rating;
      d.youtube_trailer_url = d.youtube_trailer_url?.trim();
    });

    const maxGross = d3.max(data, (d) => d.total_worldwide_gross_sales);
    const maxOpening = d3.max(data, (d) => d.opening_weekend_box_office_sales);

    data.forEach((d) => {
      d.normalized_gross = (d.total_worldwide_gross_sales / maxGross) * 100;
      d.normalized_opening = (d.opening_weekend_box_office_sales / maxOpening) * 100;
    });

    setupSliders(data);
    renderBarChart(data);
  });

  // Compute Magic Score
  function computeMagicScore(d) {
    let scoreSum = 0;
    let weightSum = 0;

    if (!isNaN(d.normalized_gross)) {
      scoreSum += weightBoxOffice * d.normalized_gross;
      weightSum += weightBoxOffice;
    }
    if (!isNaN(d.normalized_opening) && d.opening_weekend_box_office_sales > 0) {
      scoreSum += weightOpening * d.normalized_opening;
      weightSum += weightOpening;
    }
    if (!isNaN(d.rotten_tomatoes_rating)) {
      scoreSum += weightRotten * d.rotten_tomatoes_rating;
      weightSum += weightRotten;
    }
    if (!isNaN(d.imdb_rating)) {
      scoreSum += weightIMDB * d.imdb_rating;
      weightSum += weightIMDB;
    }
    if (!isNaN(d.metacritic_rating)) {
      scoreSum += weightMetacritic * d.metacritic_rating;
      weightSum += weightMetacritic;
    }

    if (weightSum === 0) return 0;
    return scoreSum / weightSum;
  }

  // Compute blended color
  function computeBarColor() {
    const totalWeight = weightBoxOffice + weightOpening + weightRotten + weightIMDB + weightMetacritic;
    if (totalWeight === 0) return "#ccc";

    const wBox = weightBoxOffice / totalWeight;
    const wOpening = weightOpening / totalWeight;
    const wRotten = weightRotten / totalWeight;
    const wIMDB = weightIMDB / totalWeight;
    const wMetacritic = weightMetacritic / totalWeight;

    const r = Math.round(
      wBox * colors.boxOffice.r +
      wOpening * colors.openingWeekend.r +
      wRotten * colors.rottenTomatoes.r +
      wIMDB * colors.imdb.r +
      wMetacritic * colors.metacritic.r
    );
    const g = Math.round(
      wBox * colors.boxOffice.g +
      wOpening * colors.openingWeekend.g +
      wRotten * colors.rottenTomatoes.g +
      wIMDB * colors.imdb.g +
      wMetacritic * colors.metacritic.g
    );
    const b = Math.round(
      wBox * colors.boxOffice.b +
      wOpening * colors.openingWeekend.b +
      wRotten * colors.rottenTomatoes.b +
      wIMDB * colors.imdb.b +
      wMetacritic * colors.metacritic.b
    );

    return `rgb(${r},${g},${b})`;
  }

  // Draw the bar chart
  function renderBarChart(data) {
    d3.select("#you-decide-viz").selectAll("*").remove(); // Clear old SVG

    const width = 1250;
    const height = 600;
    const margin = { top: 60, right: 350, bottom: 120, left: 80 };

    svg = d3
      .select("#you-decide-viz")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    x = d3
      .scaleBand()
      .domain(data.map((d) => d.movie))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    y = d3
      .scaleLinear()
      .domain([0, 100])
      .nice()
      .range([height - margin.bottom, margin.top]);

    let activeBar = null;
    let tooltipLocked = false;

    bars = svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.movie))
      .attr("y", (d) => y(computeMagicScore(d)))
      .attr("height", (d) => y(0) - y(computeMagicScore(d)))
      .attr("width", x.bandwidth())
      .attr("fill", (d) => computeBarColor())
      .attr("data-orig-x", (d) => x(d.movie))
      .attr("data-orig-width", x.bandwidth())
      .on("mouseover", function (event, d) {
        if (activeBar === this) return;
        d3.select(this).attr("fill", "tomato");
        svg.selectAll(".x-axis text")
          .filter(function () {
            return d3.select(this).text() === d.movie;
          })
          .style("font-weight", "bold")
          .style("fill", "#d33");
      })
      .on("mouseout", function (event, d) {
        if (activeBar === this) return;
        d3.select(this).attr("fill", (d) => computeBarColor());
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

        if (activeBar && activeBar !== this) {
          const prevBar = d3.select(activeBar);
          const prevData = prevBar.data()[0];
          prevBar
            .transition()
            .duration(300)
            .attr("x", prevBar.attr("data-orig-x"))
            .attr("width", prevBar.attr("data-orig-width"))
            .attr("y", y(computeMagicScore(prevData)))
            .attr("height", y(0) - y(computeMagicScore(prevData)))
            .attr("fill", computeBarColor());
          d3.selectAll(".expanded-panel").remove();
        }

        activeBar = this;
        tooltipLocked = true;

        const bar = d3.select(this);
        const expandedX = +bar.attr("data-orig-x");
        const expandedWidth = x.bandwidth() + 300;
        const expandedHeight = 400;
        const expandedY = y(computeMagicScore(d)) - expandedHeight + (y(0) - y(computeMagicScore(d)));

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
                    <button onclick="closeExpandedBar()" style="
                      background: none;
                      border: none;
                      color: #666;
                      font-size: 20px;
                      cursor: pointer;
                      padding: 0;
                    ">✕</button>
                  </div>
                  <div style="font-weight: bold; font-size: 14px;">${d.movie}</div>
                  ${d.youtube_trailer_url ? `
                    <div style="margin-top: 10px;">
                      <iframe width="100%" height="150" src="${d.youtube_trailer_url}" frameborder="0" allowfullscreen></iframe>
                    </div>` : ''}
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

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .attr("class", "x-axis")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    document.addEventListener("click", (event) => {
      const panel = document.querySelector(".expanded-panel");
      if (panel && !panel.contains(event.target)) {
        closeExpandedBar();
      }
    });

    window.closeExpandedBar = function () {
      d3.selectAll(".expanded-panel").remove();
      d3.selectAll("rect")
        .transition()
        .duration(500)
        .attr("x", d => x(d.movie))
        .attr("width", x.bandwidth())
        .attr("y", d => y(computeMagicScore(d)))
        .attr("height", d => y(0) - y(computeMagicScore(d)))
        .attr("fill", computeBarColor())
        .attr("opacity", 1);
      d3.selectAll(".x-axis text")
        .style("font-weight", null)
        .style("fill", null);
      activeBar = null;
      tooltipLocked = false;
    };
  }

  function setupSliders(data) {
    const controls = d3.select("#you-decide-controls");

    controls.html(`
      <div class="slider-group">
        <label>Box Office: <span id="boxWeightLabel">--</span>%</label>
        <input type="range" id="boxWeight" min="0" max="100" value="50">
      </div>

      <div class="slider-group">
        <label>Opening Weekend: <span id="openingWeightLabel">--</span>%</label>
        <input type="range" id="openingWeight" min="0" max="100" value="50">
      </div>

      <div class="slider-group">
        <label>Rotten Tomatoes: <span id="rottenWeightLabel">--</span>%</label>
        <input type="range" id="rottenWeight" min="0" max="100" value="50">
      </div>

      <div class="slider-group">
        <label>IMDB: <span id="imdbWeightLabel">--</span>%</label>
        <input type="range" id="imdbWeight" min="0" max="100" value="50">
      </div>

      <div class="slider-group">
        <label>Metacritic: <span id="metacriticWeightLabel">--</span>%</label>
        <input type="range" id="metacriticWeight" min="0" max="100" value="50">
      </div>
    `);

    d3.select("#boxWeight").on("input", function() {
      weightBoxOffice = +this.value;
      updateSliderLabels();
      updateChart();
    });

    d3.select("#openingWeight").on("input", function() {
      weightOpening = +this.value;
      updateSliderLabels();
      updateChart();
    });

    d3.select("#rottenWeight").on("input", function() {
      weightRotten = +this.value;
      updateSliderLabels();
      updateChart();
    });

    d3.select("#imdbWeight").on("input", function() {
      weightIMDB = +this.value;
      updateSliderLabels();
      updateChart();
    });

    d3.select("#metacriticWeight").on("input", function() {
      weightMetacritic = +this.value;
      updateSliderLabels();
      updateChart();
    });

    updateSliderLabels();
  }

  function updateSliderLabels() {
    const totalWeight = weightBoxOffice + weightOpening + weightRotten + weightIMDB + weightMetacritic;
    d3.select("#boxWeightLabel").text(totalWeight === 0 ? 0 : Math.round((weightBoxOffice / totalWeight) * 100));
    d3.select("#openingWeightLabel").text(totalWeight === 0 ? 0 : Math.round((weightOpening / totalWeight) * 100));
    d3.select("#rottenWeightLabel").text(totalWeight === 0 ? 0 : Math.round((weightRotten / totalWeight) * 100));
    d3.select("#imdbWeightLabel").text(totalWeight === 0 ? 0 : Math.round((weightIMDB / totalWeight) * 100));
    d3.select("#metacriticWeightLabel").text(totalWeight === 0 ? 0 : Math.round((weightMetacritic / totalWeight) * 100));
  }

  function updateChart() {
    bars.transition().duration(500)
      .attr("y", d => y(computeMagicScore(d)))
      .attr("height", d => y(0) - y(computeMagicScore(d)))
      .attr("fill", d => computeBarColor());

  }
})();
