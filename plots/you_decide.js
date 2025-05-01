// Full you_decide.js (merged version with sliders, color blending, expanded tooltips)

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

(function () {
  // Color assignment for each metric
  const colors = {
    boxOffice: d3.color("green"),
    openingWeekend: d3.color("green"),
    rottenTomatoes: d3.color("red"),
    imdb: d3.color("yellow"),
    metacritic: d3.color("orange"),
    originality: d3.color("purple"),
    awards: d3.color("blue"),
  };

  let weightBoxOffice = 50;
  let weightOpening = 50;
  let weightRotten = 50;
  let weightIMDB = 50;
  let weightMetacritic = 50;
  let weightOriginality = 50;
  let weightAwards = 50;
  let svg, x, y, bars;

  // Load data
  Promise.all([
    d3.csv("datasets/pixar_movies.csv"),
    d3.csv("datasets/academy.csv"),
  ]).then(([moviesData, awardsData]) => {
    preprocessData(moviesData, awardsData); // clean the data
    setupSliders(moviesData); // build the sliders
    renderBarChart(moviesData); // draw the chart
  });
  const CPI = {
    startYear: 1995,
    endYear: 2025,
    startVal: 150, // 1995 CPI
    endVal: 320, // March-2025 CPI  ➜  “today’s dollars”
    todayVal: 320,
  };
  function estCPI(year) {
    if (year <= CPI.startYear) return CPI.startVal;
    if (year >= CPI.endYear) return CPI.endVal;
    const slope = (CPI.endVal - CPI.startVal) / (CPI.endYear - CPI.startYear);
    return CPI.startVal + slope * (year - CPI.startYear);
  }
  // Compute Originality and Awards Scores
  function preprocessData(moviesData, awardsData) {
    const knownSequels = [
      "Finding Dory",
      "Lightyear",
      "Cars 2",
      "Cars 3",
      "Toy Story 2",
      "Toy Story 3",
      "Toy Story 4",
      "Monsters University",
      "Incredibles 2",
      "Inside Out 2",
    ];

    const maxGross = d3.max(moviesData, (d) =>
      parseSales(d.total_worldwide_gross_sales)
    );
    const maxOpening = d3.max(moviesData, (d) =>
      parseSales(d.opening_weekend_box_office_sales)
    );

    // Precompute award scores
    const awardPoints = {};
    awardsData.forEach((d) => {
      const film = d.film.trim();
      if (!awardPoints[film]) awardPoints[film] = 0;
      if (d.status.trim() === "Won") awardPoints[film] += 1;
      else if (d.status.trim() === "Nominated") awardPoints[film] += 0.5;
      // Else no change
    });

    const maxAwardScore = d3.max(Object.values(awardPoints));

    moviesData.forEach((d) => {
      d.total_worldwide_gross_sales = parseSales(d.total_worldwide_gross_sales);
      d.opening_weekend_box_office_sales = parseSales(
        d.opening_weekend_box_office_sales
      );

      // 2️⃣  🔸 adjust BOTH numbers to 2025 dollars
      const movieCPI = estCPI(+d.year_released);
      d.total_worldwide_gross_sales *= CPI.todayVal / movieCPI;
      d.opening_weekend_box_office_sales *= CPI.todayVal / movieCPI;

      // Normalize sales
      // d.total_worldwide_gross_sales = parseSales(d.total_worldwide_gross_sales);
      // d.opening_weekend_box_office_sales = parseSales(
      //   d.opening_weekend_box_office_sales
      // );

      d.normalized_gross = (d.total_worldwide_gross_sales / maxGross) * 100;
      d.normalized_opening =
        (d.opening_weekend_box_office_sales / maxOpening) * 100;

      d.year_released = +d.year_released;
      d.rotten_tomatoes_rating = +d.rotten_tomatoes_rating?.replace("%", "");
      d.imdb_rating = +d.imdb_rating * 10;
      d.metacritic_rating = +d.metacritic_rating;
      d.youtube_trailer_url = d.youtube_trailer_url?.trim();

      // Assign originality
      d.originality_score = knownSequels.includes(d.movie.trim()) ? 25 : 75;

      // Assign awards score
      const rawAwardPoints = awardPoints[d.movie.trim()] || 0;
      d.awards_score = (rawAwardPoints / maxAwardScore) * 100;
    });
  }

  function parseSales(salesString) {
    if (!salesString) return 0;
    const match = salesString
      .replace(/\$/g, "")
      .trim()
      .match(/^([\d.]+)\s*(million|billion)$/i);
    if (match) {
      const [_, value, unit] = match;
      const multiplier = unit.toLowerCase() === "billion" ? 1e9 : 1e6;
      return +value * multiplier;
    }
    return 0;
  }

  // Compute Magic Score
  function computeMagicScore(d) {
    let scoreSum = 0;
    let weightSum = 0;

    if (!isNaN(d.normalized_gross)) {
      scoreSum += weightBoxOffice * d.normalized_gross;
      weightSum += weightBoxOffice;
    }
    if (
      !isNaN(d.normalized_opening) &&
      d.opening_weekend_box_office_sales > 0
    ) {
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
    if (!isNaN(d.originality_score)) {
      scoreSum += weightOriginality * d.originality_score;
      weightSum += weightOriginality;
    }
    if (!isNaN(d.awards_score)) {
      scoreSum += weightAwards * d.awards_score;
      weightSum += weightAwards;
    }

    if (weightSum === 0) return 0;
    return scoreSum / weightSum;
  }

  // Compute blended color
  function computeBarColor() {
    const totalWeight =
      weightBoxOffice +
      weightOpening +
      weightRotten +
      weightIMDB +
      weightMetacritic +
      weightOriginality +
      weightAwards;
    if (totalWeight === 0) return "#ccc";

    const w = {
      box: weightBoxOffice / totalWeight,
      opening: weightOpening / totalWeight,
      rotten: weightRotten / totalWeight,
      imdb: weightIMDB / totalWeight,
      meta: weightMetacritic / totalWeight,
      orig: weightOriginality / totalWeight,
      awards: weightAwards / totalWeight,
    };

    // Compute blended color
    const blended = {
      r: Math.round(
        w.box * colors.boxOffice.r +
          w.opening * colors.openingWeekend.r +
          w.rotten * colors.rottenTomatoes.r +
          w.imdb * colors.imdb.r +
          w.meta * colors.metacritic.r +
          w.orig * colors.originality.r +
          w.awards * colors.awards.r
      ),
      g: Math.round(
        w.box * colors.boxOffice.g +
          w.opening * colors.openingWeekend.g +
          w.rotten * colors.rottenTomatoes.g +
          w.imdb * colors.imdb.g +
          w.meta * colors.metacritic.g +
          w.orig * colors.originality.g +
          w.awards * colors.awards.g
      ),
      b: Math.round(
        w.box * colors.boxOffice.b +
          w.opening * colors.openingWeekend.b +
          w.rotten * colors.rottenTomatoes.b +
          w.imdb * colors.imdb.b +
          w.meta * colors.metacritic.b +
          w.orig * colors.originality.b +
          w.awards * colors.awards.b
      ),
    };

    // Brightening (toward white)
    const brightenFactor = 1.2; // tune this
    const brightened = {
      r: Math.round(blended.r * brightenFactor),
      g: Math.round(blended.g * brightenFactor),
      b: Math.round(blended.b * brightenFactor),
    };

    return `rgb(${brightened.r},${brightened.g},${brightened.b})`;
  }

  // Draw the bar chart
  function renderBarChart(data) {
    d3.select("#you-decide-viz").selectAll("*").remove(); // Clear old SVG

    const chartContainer = document.getElementById("you-decide-viz");
    const width = Math.min(chartContainer.clientWidth, 700);

    const height = 600;
    const margin = { top: 60, right: 50, bottom: 120, left: 80 };

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
    let activePanel = null;
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
        d3.select(this).attr("fill", "#423663");
        svg
          .selectAll(".x-axis text")
          .filter(function () {
            return d3.select(this).text() === d.movie;
          })
          .style("font-weight", "bold")
          .style("fill", "#ffef00");
      })
      .on("mouseout", function (event, d) {
        if (activeBar === this) return;
        d3.select(this).attr("fill", (d) => computeBarColor());
        svg
          .selectAll(".x-axis text")
          .filter(function () {
            return d3.select(this).text() === d.movie;
          })
          .style("font-weight", null)
          .style("fill", null);
      })
      .on("click", function (event, d) {
        if (activePanel) {
          activePanel.remove(); // remove previous overlay div
          activePanel = null;
        }
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
        const expandedY =
          y(computeMagicScore(d)) -
          expandedHeight +
          (y(0) - y(computeMagicScore(d)));

        bar
          .transition()
          .duration(300)
          .attr("x", expandedX)
          .attr("width", expandedWidth)
          .attr("y", expandedY)
          .attr("height", expandedHeight)
          .attr("fill", "#423663")
          .attr("opacity", 1)
          .on("end", () => {
            // svg
            //   .append("foreignObject")
            //   .attr("class", "expanded-panel")
            //   .attr("x", expandedX + 5)
            //   .attr("y", expandedY + 5)
            //   .attr("width", expandedWidth - 10)
            //   .attr("height", expandedHeight - 10).html(`
            activePanel = d3
              .select("body")
              .append("div")
              .attr("class", "info-panel")
              .style("position", "fixed")
              .style("left", expandedX + margin.left + "px") // you already have expandedX/Y
              .style("top", expandedY + margin.top + "px")
              .style("width", expandedWidth + 20 + "px")
              .style("height", expandedHeight - "px")
              .style("border-radius", "8px")
              .style("background", "#423663")
              .style("box-shadow", "0 4px 16px rgba(0,0,0,0.4)")
              .style("z-index", 10000) // always on top
              .html(`
                <div xmlns="http://www.w3.org/1999/xhtml" style="
                  font-size: 12px;
                  padding: 8px;
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

                  <div style="font-weight: bold; font-size: 18px; margin-bottom: 4px;">${
                    d.movie
                  }</div>

                  ${
                    d.youtube_trailer_url
                      ? `
                    <div style="margin-top: 10px;">
                      <iframe width="100%" height="150" src="${d.youtube_trailer_url}" frameborder="0" allowfullscreen></iframe>
                    </div>`
                      : ""
                  }

                  <div style="
                    font-size: 16px;
                    font-weight: 900;
                    color: #ffef00;
                    background: rgba(0, 0, 0, 0.6);
                    padding: 6px 12px;
                    border-radius: 8px;
                    display: inline-block;
                    box-shadow: 0 0 8px rgba(255, 239, 0, 0.8);
                    margin: 10px 0;
                  ">
                    ⭐ Magic Score: ${computeMagicScore(d).toFixed(1)} ⭐
                  </div>
                  <div style="margin-bottom: 4px;">Released: ${
                    d.year_released
                  }</div>
                  <div style="
                    margin-top: 10px;
                    background: rgba(0,0,0,0.5);
                    padding: 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    color: white;
                    line-height: 1.4;
                  ">
                    <div><strong>Raw Metrics:</strong></div>
                    <div>Box Office: $${(
                      d.total_worldwide_gross_sales / 1e6
                    ).toFixed(1)}M</div>
                    <div>Opening Weekend: $${(
                      d.opening_weekend_box_office_sales / 1e6
                    ).toFixed(1)}M</div>
                    <div>Rotten Tomatoes: ${d.rotten_tomatoes_rating}%</div>
                    <div>IMDb: ${(d.imdb_rating / 10).toFixed(1)}/10</div>
                    <div>Metacritic: ${d.metacritic_rating}</div>
                    <div>Awards Score: ${d.awards_score.toFixed(1)}</div>
                  </div>
                  <div style="margin-top: 8px; font-style: italic;">${
                    d.plot_summary
                  }</div>
                  <div style="height: 30px;"></div>
                </div>
              `);
            bar.attr("fill", "transparent");
          });
      });

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .attr("class", "x-axis")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("transform", `rotate(-90)`)
      .attr("y", margin.left / 4)
      .attr("x", -(margin.top + (height - margin.bottom)) / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "white")
      .text("Calculated Magic Score");

    document.addEventListener("click", (event) => {
      const panel = document.querySelector(".expanded-panel");
      if (panel && !panel.contains(event.target)) {
        closeExpandedBar();
      }
    });

    function closeExpandedBar() {
      if (activePanel) {
        activePanel.remove();
        activePanel = null;
      }
      svg.selectAll(".expanded-panel").remove();
      svg
        .selectAll("rect")
        .transition()
        .duration(500)
        .attr("x", (d) => x(d.movie))
        .attr("width", x.bandwidth())
        .attr("y", (d) => y(computeMagicScore(d)))
        .attr("height", (d) => y(0) - y(computeMagicScore(d)))
        .attr("fill", computeBarColor())
        .attr("opacity", 1);
      svg
        .selectAll(".x-axis text")
        .style("font-weight", null)
        .style("fill", null);
      activeBar = null;
      tooltipLocked = false;
    }

    window.closeExpandedBar = closeExpandedBar;
  }

  function setupSliders(data) {
    const controls = d3.select("#you-decide-controls");

    controls.html(`
      <div class="slider-group">
        <label>Box Office: <span id="boxWeightLabel">--</span>%</label><br>
        <input type="range" id="boxWeight" min="0" max="100" value="50">
      </div>

      <div class="slider-group">
        <label>Opening Weekend: <span id="openingWeightLabel">--</span>%</label><br>
        <input type="range" id="openingWeight" min="0" max="100" value="50">
      </div>

      <div class="slider-group">
        <label>Rotten Tomatoes: <span id="rottenWeightLabel">--</span>%</label><br>
        <input type="range" id="rottenWeight" min="0" max="100" value="50">
      </div>

      <div class="slider-group">
        <label>IMDB: <span id="imdbWeightLabel">--</span>%</label><br>
        <input type="range" id="imdbWeight" min="0" max="100" value="50">
      </div>

      <div class="slider-group">
        <label>Metacritic: <span id="metacriticWeightLabel">--</span>%</label><br>
        <input type="range" id="metacriticWeight" min="0" max="100" value="50">
      </div>

      <div class="slider-group">
        <label>Originality: <span id="originalityWeightLabel">--</span>%</label><br>
        <input type="range" id="originalityWeight" min="0" max="100" value="50">
      </div>

      <div class="slider-group">
        <label>Awards: <span id="awardsWeightLabel">--</span>%</label><br>
        <input type="range" id="awardsWeight" min="0" max="100" value="50">
      </div>
    `);

    d3.select("#boxWeight").on("input", function () {
      weightBoxOffice = +this.value;
      updateSliderLabels();
      updateChart();
    });

    d3.select("#openingWeight").on("input", function () {
      weightOpening = +this.value;
      updateSliderLabels();
      updateChart();
    });

    d3.select("#rottenWeight").on("input", function () {
      weightRotten = +this.value;
      updateSliderLabels();
      updateChart();
    });

    d3.select("#imdbWeight").on("input", function () {
      weightIMDB = +this.value;
      updateSliderLabels();
      updateChart();
    });

    d3.select("#metacriticWeight").on("input", function () {
      weightMetacritic = +this.value;
      updateSliderLabels();
      updateChart();
    });

    d3.select("#originalityWeight").on("input", function () {
      weightOriginality = +this.value;
      updateSliderLabels();
      updateChart();
    });

    d3.select("#awardsWeight").on("input", function () {
      weightAwards = +this.value;
      updateSliderLabels();
      updateChart();
    });

    updateSliderLabels();
  }

  function updateSliderLabels() {
    const totalWeight =
      weightBoxOffice +
      weightOpening +
      weightRotten +
      weightIMDB +
      weightMetacritic +
      weightOriginality +
      weightAwards;
    d3.select("#boxWeightLabel").text(
      totalWeight === 0 ? 0 : Math.round((weightBoxOffice / totalWeight) * 100)
    );
    d3.select("#openingWeightLabel").text(
      totalWeight === 0 ? 0 : Math.round((weightOpening / totalWeight) * 100)
    );
    d3.select("#rottenWeightLabel").text(
      totalWeight === 0 ? 0 : Math.round((weightRotten / totalWeight) * 100)
    );
    d3.select("#imdbWeightLabel").text(
      totalWeight === 0 ? 0 : Math.round((weightIMDB / totalWeight) * 100)
    );
    d3.select("#metacriticWeightLabel").text(
      totalWeight === 0 ? 0 : Math.round((weightMetacritic / totalWeight) * 100)
    );
    d3.select("#originalityWeightLabel").text(
      totalWeight === 0
        ? 0
        : Math.round((weightOriginality / totalWeight) * 100)
    );
    d3.select("#awardsWeightLabel").text(
      totalWeight === 0 ? 0 : Math.round((weightAwards / totalWeight) * 100)
    );
  }

  function updateChart() {
    bars
      .transition()
      .duration(500)
      .attr("y", (d) => y(computeMagicScore(d)))
      .attr("height", (d) => y(0) - y(computeMagicScore(d)))
      .attr("fill", (d) => computeBarColor());
  }
})();
