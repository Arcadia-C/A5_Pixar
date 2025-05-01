import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

d3.csv("datasets/academy_filtered.csv").then((data) => {
  data.forEach((d) => {
    // Simplify if it has an X we won't visualize it in the visualization
    if (d.status == "Award not yet introduced" || d.status == "Ineligible") {
      d.status = "X";
    }

    // Instead, will have a line to show when the "best animated feature"
    // Was introduced
  });

  var yAxis_Domain = [
    "Original Screenplay",
    "Animated Feature",
    "Original Score",
    "Original Song",
    "Sound Editing",
    "Sound Mixing",
    "Best Picture",
    "Adapted Screenplay",
  ];

  // Detecting changes in buttons means we change the domain values
  document.querySelectorAll(".awardCategory").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const checkbox_name =
        event.currentTarget.nextElementSibling.textContent.trim();

      if (event.currentTarget.checked) {
        if (!yAxis_Domain.includes(checkbox_name)) {
          yAxis_Domain.push(checkbox_name);
        }
      } else {
        const index = yAxis_Domain.indexOf(checkbox_name);
        if (index > -1) {
          yAxis_Domain.splice(index, 1);
        }
      }
      updateChart();
    });
  });

  data.sort((a, b) => a.release_date - b.release_date);

  const width = 900;
  const height = 400;
  const margin = { top: 50, right: 30, bottom: 120, left: 80 };

  const svg = d3
    .select("#critical")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  function get_dimension(status) {
    if (status == "Nominated") {
      return 16;
    } else if (status == "Won") {
      return 30;
    } else {
      return 0;
    }
  }

  function get_icon(status) {
    if (status == "Nominated") {
      return "images/oscar_alt_icon.png";
    } else {
      return "images/oscar_icon.png";
    }
  }

  function get_hover_text_color(status) {
    if (status == "Nominated") {
      return "Tomato";
    } else {
      return "MediumSeaGreen";
    }
  }

  function updateChart() {
    const selectedCategories = Array.from(
      document.querySelectorAll(".awardCategory:checked")
    ).map((cb) => {
      return cb.nextElementSibling.textContent.trim();
    });

    const filteredData = data.filter((d) =>
      selectedCategories.includes(d.award_type)
    );

    const x = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.film))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3
      .scalePoint()
      .domain(yAxis_Domain)
      .range([height - margin.bottom, margin.top]);

    svg.selectAll("*").remove();

    // Dots with images
    svg
      .selectAll("image")
      .data(filteredData)
      .enter()
      .append("image")
      .attr("xlink:href", (d) => get_icon(d.status))
      .attr("x", (d) => x(d.film))
      .attr("y", (d) => {
        return y(d.award_type);
      })
      .attr("width", (d) => get_dimension(d.status))
      .attr("height", (d) => get_dimension(d.status));

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
              Award Type: ${d.award_type}<br>
              <h4 style="color:${get_hover_text_color(d.status)};">${
              d.status
            }</h4>
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
      .attr("transform", `translate(0,${height - margin.bottom + 25})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y Axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .style("font-size", "8px")
      .style("text-anchor", "end");
  }

  updateChart();

  //const color = (d) => (d.originality === 1 ? "#00c853" : "#e53935");

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
