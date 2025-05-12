// plots/sequel-perf.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Define sequel data with their positions in each franchise
const sequelData = {
  "Toy Story": { original: "Toy Story", sequels: ["Toy Story 2", "Toy Story 3", "Toy Story 4"] },
  "Cars": { original: "Cars", sequels: ["Cars 2", "Cars 3"] },
  "Incredibles": { original: "The Incredibles", sequels: ["Incredibles 2"] },
  "Monsters": { original: "Monsters, Inc.", sequels: ["Monsters University"] },
  "Finding Nemo": { original: "Finding Nemo", sequels: ["Finding Dory"] }
};

// Function to determine franchise and position
function getFilmPosition(movieName) {
  for (const [franchise, films] of Object.entries(sequelData)) {
    if (films.original === movieName) {
      return { franchise, position: 1 };
    }
    const sequelIndex = films.sequels.indexOf(movieName);
    if (sequelIndex !== -1) {
      return { franchise, position: sequelIndex + 2 };
    }
  }
  return null;
}

// Load and process data
d3.csv("datasets/pixar_movies.csv", (d) => ({
  movie: d.movie,
  year: +d.year_released,
  rt: +d.rotten_tomatoes_rating.replace("%", ""), // 0–100
  imdb: +d.imdb_rating * 10, // convert 0–10 → 0–100
  meta: +d.metacritic_rating, // 0–100
})).then((data) => {
  // Process data to identify franchises and positions
  const processedData = data.map(d => {
    const position = getFilmPosition(d.movie);
    return {
      ...d,
      franchise: position?.franchise || null,
      position: position?.position || null,
      critical: d.meta, // Metacritic for critical
      audience: d.rt,   // Rotten Tomatoes for audience
      boxOffice: d.imdb // IMDB for box office proxy
    };
  }).filter(d => d.franchise !== null); // Only keep films that are part of franchises

  // Create the visualization
  createPerformanceDegradationChart(processedData);
});

function createPerformanceDegradationChart(data) {
  // Set up dimensions
  const margin = { top: 50, right: 100, bottom: 100, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3.select("#return-on-magic-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up scales
  const xScale = d3.scaleLinear()
    .domain([1, 4])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([-50, 5])
    .range([height, 0]);

  // Color and style configuration for each metric
  const metrics = {
    critical: { 
      color: '#FF6B6B', 
      label: 'Critical Score (Metacritic)',
      strokeDasharray: 'none'
    },
    audience: { 
      color: '#4ECDC4', 
      label: 'Audience Score (Rotten Tomatoes)',
      strokeDasharray: 'none'
    },
    boxOffice: { 
      color: '#FFD93D', 
      label: 'IMDB Score',
      strokeDasharray: 'none'
    }
  };

  // State
  let currentFranchise = 'all';

  // Calculate performance changes relative to original
  function calculateChanges(metric, franchise) {
    const franchises = franchise === 'all' ? 
      Object.keys(sequelData) : 
      [franchise];

    const changes = { 1: [], 2: [], 3: [], 4: [] };

    franchises.forEach(f => {
      const films = data.filter(d => d.franchise === f);
      const original = films.find(d => d.position === 1);
      
      if (original) {
        films.forEach(film => {
          if (film.position <= 4) {
            const change = ((film[metric] - original[metric]) / original[metric]) * 100;
            changes[film.position].push(change);
          }
        });
      }
    });

    // Calculate averages
    const averages = {};
    for (let pos = 1; pos <= 4; pos++) {
      if (changes[pos].length > 0) {
        averages[pos] = changes[pos].reduce((a, b) => a + b, 0) / changes[pos].length;
      } else {
        averages[pos] = null;
      }
    }

    return averages;
  }

  // Create axes
  const xAxis = d3.axisBottom(xScale)
    .tickValues([1, 2, 3, 4])
    .tickFormat(d => ['Original', '2nd Film', '3rd Film', '4th Film'][d-1]);

  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => d + '%');

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  g.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  // Add axis labels
  g.append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .text("Film Position in Franchise")
    .style("font-size", "14px");

  g.append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .text("Performance Change from Original (%)")
    .style("font-size", "14px");

  // Create line generator
  const line = d3.line()
    .x(d => xScale(d.position))
    .y(d => yScale(d.change))
    .curve(d3.curveMonotoneX);

  // Create legend
  const legend = g.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 20}, 50)`);

  Object.entries(metrics).forEach((d, i) => {
    const [key, value] = d;
    const legendItem = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    legendItem.append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", value.color)
      .attr("stroke-width", 3);

    legendItem.append("circle")
      .attr("cx", 10)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", value.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    legendItem.append("text")
      .attr("x", 25)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "white")
      .text(value.label);
  });

  // Function to update chart
  function updateChart() {
    // Calculate changes for all metrics
    const allChanges = {};
    Object.keys(metrics).forEach(metric => {
      allChanges[metric] = calculateChanges(metric, currentFranchise);
    });

    // Create line data for each metric
    Object.entries(metrics).forEach(([metricKey, metricConfig]) => {
      const changes = allChanges[metricKey];
      const lineData = [];
      
      for (let pos = 1; pos <= 4; pos++) {
        if (changes[pos] !== null) {
          lineData.push({ position: pos, change: changes[pos] });
        }
      }

      // Update line
      const paths = g.selectAll(`.performance-line-${metricKey}`)
        .data([lineData]);

      paths.enter()
        .append("path")
        .attr("class", `performance-line-${metricKey}`)
        .merge(paths)
        .transition()
        .duration(500)
        .attr("d", line)
        .attr("stroke", metricConfig.color)
        .attr("stroke-width", 3)
        .attr("fill", "none")
        .attr("stroke-dasharray", metricConfig.strokeDasharray);

      // Update points
      const circles = g.selectAll(`.performance-point-${metricKey}`)
        .data(lineData);

      circles.enter()
        .append("circle")
        .attr("class", `performance-point-${metricKey}`)
        .merge(circles)
        .transition()
        .duration(500)
        .attr("cx", d => xScale(d.position))
        .attr("cy", d => yScale(d.change))
        .attr("r", 6)
        .attr("fill", metricConfig.color)
        .attr("stroke", "white")
        .attr("stroke-width", 2);

      circles.exit().remove();
      paths.exit().remove();
    });
  }

  // Create controls
  const controlsContainer = d3.select("#return-on-magic-controls");

  // Franchise selector
  const franchiseSelector = controlsContainer.append("div")
    .attr("class", "control-group");

  franchiseSelector.append("label").text("Franchise: ");
  
  const franchiseSelect = franchiseSelector.append("select")
    .attr("id", "franchise-select")
    .style("padding", "5px")
    .style("margin", "5px")
    .on("change", function() {
      currentFranchise = this.value;
      updateChart();
      updateInsight();
    });

  franchiseSelect.selectAll("option")
    .data([
      { value: "all", text: "All Franchises" },
      ...Object.keys(sequelData).map(f => ({ value: f, text: f }))
    ])
    .enter()
    .append("option")
    .attr("value", d => d.value)
    .text(d => d.text);

  // Add horizontal line at 0
  g.append("line")
    .attr("class", "zero-line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", yScale(0))
    .attr("y2", yScale(0))
    .attr("stroke", "#666")
    .attr("stroke-dasharray", "3,3");

  // Function to update insight text
  function updateInsight() {
    const allChanges = {};
    Object.keys(metrics).forEach(metric => {
      allChanges[metric] = calculateChanges(metric, currentFranchise);
    });

    const insightContainer = d3.select("#insight-text");
    
    let insight = "";
    
    if (currentFranchise === "all") {
      // Compare final changes across metrics
      const finalChanges = {};
      Object.keys(metrics).forEach(metric => {
        const changes = allChanges[metric];
        finalChanges[metric] = changes[4] || changes[3] || changes[2];
      });

      const worstMetric = Object.entries(finalChanges)
        .reduce((a, b) => finalChanges[a[0]] < finalChanges[b[0]] ? a : b)[0];
      
      const bestMetric = Object.entries(finalChanges)
        .reduce((a, b) => finalChanges[a[0]] > finalChanges[b[0]] ? a : b)[0];

      insight = `Critical scores tend to decline most with sequels (${Math.abs(finalChanges[worstMetric]).toFixed(1)}% drop), while ${bestMetric === worstMetric ? 'all metrics' : bestMetric} scores are more resilient. `;
      
      if (finalChanges.audience > finalChanges.critical) {
        insight += "Audiences are more forgiving than critics when it comes to sequels.";
      }
    } else {
      const films = data.filter(d => d.franchise === currentFranchise);
      const maxPosition = Math.max(...films.map(d => d.position));
      
      if (maxPosition >= 3) {
        const secondFilmChanges = {};
        Object.keys(metrics).forEach(metric => {
          secondFilmChanges[metric] = allChanges[metric][2];
        });
        
        const bestSecondFilmMetric = Object.entries(secondFilmChanges)
          .reduce((a, b) => secondFilmChanges[a[0]] > secondFilmChanges[b[0]] ? a : b)[0];
        
        insight = `${currentFranchise} shows varied sequel performance: ${bestSecondFilmMetric} scores ${secondFilmChanges[bestSecondFilmMetric] > 0 ? 'improved' : 'declined'} by ${Math.abs(secondFilmChanges[bestSecondFilmMetric]).toFixed(1)}% in the second film.`;
      } else {
        insight = `${currentFranchise} has only one sequel so far, showing different performance across metrics.`;
      }
    }
    
    insightContainer.text(insight);
  }

  // Initial render
  updateChart();
  updateInsight();

  // Add styling
  const style = document.createElement('style');
  style.textContent = `
    .control-group {
      margin: 20px 0;
      text-align: center;
    }
    
    .control-group label {
      display: inline-block;
      font-weight: bold;
      margin-right: 10px;
      font-size: 16px;
    }
    
    #insight-text {
      font-style: italic;
      color: #666;
      margin-top: 20px;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #4ECDC4;
      line-height: 1.6;
    }
    
    .legend text {
      fill: #333;
    }
  `;
  document.head.appendChild(style);
}