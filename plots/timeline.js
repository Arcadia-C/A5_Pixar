const pixarFilms = [
    { 
        title: "Toy Story", 
        year: 1995, 
        rating: 100, 
        boxOffice: 373, 
        isOriginalConcept: true, 
        character: "images/woody.webp" 
    },
    { 
        title: "A Bug's Life", 
        year: 1998, 
        rating: 92, 
        boxOffice: 363, 
        isOriginalConcept: true, 
        character: "images/bugs-life.webp" 
    },
    { 
        title: "Toy Story 2", 
        year: 1999, 
        rating: 100, 
        boxOffice: 497, 
        isOriginalConcept: true, 
        character: "images/woody.webp" 
    },
    { 
        title: "Monsters, Inc.", 
        year: 2001, 
        rating: 96, 
        boxOffice: 577, 
        isOriginalConcept: true, 
        character: "images/sulley.webp" 
    },
    { 
        title: "Finding Nemo", 
        year: 2003, 
        rating: 99, 
        boxOffice: 871, 
        isOriginalConcept: true, 
        character: "images/nemo.webp" 
    },
    { 
        title: "The Incredibles", 
        year: 2004, 
        rating: 97, 
        boxOffice: 631, 
        isOriginalConcept: true, 
        character: "images/incredibles.webp" 
    },
    { 
      title: "Cars", 
      year: 2006, 
      rating: 74, 
      boxOffice: 461, 
      isOriginalConcept: true, 
      character: "images/cars.webp" 
    },
    { 
      title: "Ratatouille", 
      year: 2007, 
      rating: 96, 
      boxOffice: 623, 
      isOriginalConcept: true, 
      character: "images/rat.webp" 
    },
    { 
      title: "WALL·E", 
      year: 2008, 
      rating: 95, 
      boxOffice: 521, 
      isOriginalConcept: true, 
      character: "images/walle.webp" 
    },
    { 
      title: "Up", 
      year: 2009, 
      rating: 98, 
      boxOffice: 735, 
      isOriginalConcept: false, 
      character: "images/up-man.webp" 
    },
    { 
      title: "Toy Story 3", 
      year: 2010, 
      rating: 98, 
      boxOffice: 1066, 
      isOriginalConcept: false, 
      character: "images/woody.webp" 
    },
    { 
      title: "Cars 2", 
      year: 2011, 
      rating: 39, 
      boxOffice: 559, 
      isOriginalConcept: false, 
      character: "images/cars.webp" 
    },
    { 
      title: "Brave", 
      year: 2012, 
      rating: 78, 
      boxOffice: 538, 
      isOriginalConcept: false, 
      character: "images/brave.webp" 
    },
    { 
      title: "Monsters University", 
      year: 2013, 
      rating: 80, 
      boxOffice: 743, 
      isOriginalConcept: false, 
      character: "images/monsters-u.webp" 
    },
    { 
      title: "Inside Out", 
      year: 2015, 
      rating: 98, 
      boxOffice: 857, 
      isOriginalConcept: false, 
      character: "images/inside-out.jpg" 
    },
    { 
      title: "The Good Dinosaur", 
      year: 2015, 
      rating: 76, 
      boxOffice: 332, 
      isOriginalConcept: false, 
      character: "images/good-dino.webp" 
    },
    { 
      title: "Finding Dory", 
      year: 2016, 
      rating: 94, 
      boxOffice: 1028, 
      isOriginalConcept: false, 
      character: "images/dory.webp" 
    },
    { 
      title: "Cars 3", 
      year: 2017, 
      rating: 69, 
      boxOffice: 383, 
      isOriginalConcept: false, 
      character: "images/cars.webp" 
    },
    { 
      title: "Coco", 
      year: 2017, 
      rating: 97, 
      boxOffice: 807, 
      isOriginalConcept: false, 
      character: "images/coco.webp" 
    },
    { 
      title: "Incredibles 2", 
      year: 2018, 
      rating: 93, 
      boxOffice: 1242, 
      isOriginalConcept: false, 
      character: "images/incredibles.webp" 
    },
    { 
      title: "Toy Story 4", 
      year: 2019, 
      rating: 97, 
      boxOffice: 1073, 
      isOriginalConcept: false, 
      character: "images/woody.webp" 
    },
    { 
      title: "Onward", 
      year: 2020, 
      rating: 88, 
      boxOffice: 133, 
      isOriginalConcept: false, 
      character: "images/onward.webp" 
    },
    { 
      title: "Soul", 
      year: 2020, 
      rating: 95, 
      boxOffice: 117, 
      isOriginalConcept: false, 
      character: "images/soul.webp" 
    },
    { 
      title: "Luca", 
      year: 2021, 
      rating: 91, 
      boxOffice: 49, 
      isOriginalConcept: false, 
      character: "images/luca.webp" 
    },
    { 
      title: "Turning Red", 
      year: 2022, 
      rating: 95, 
      boxOffice: 17, 
      isOriginalConcept: false, 
      character: "images/red.jpg" 
    },
    { 
      title: "Lightyear", 
      year: 2022, 
      rating: 74, 
      boxOffice: 226, 
      isOriginalConcept: false, 
      character: "images/lightyear.jpg" 
    },
    { 
      title: "Elemental", 
      year: 2023, 
      rating: 74, 
      boxOffice: 496, 
      isOriginalConcept: false, 
      character: "images/elemental.jpg" 
    },
    { 
      title: "Inside Out 2", 
      year: 2024, 
      rating: 90, 
      boxOffice: 1359, 
      isOriginalConcept: false, 
      character: "images/inside-out.jpg" 
    }
];
  
// Backup placeholder in case an image fails to load
const placeholderIcon = "https://cdn-icons-png.flaticon.com/512/3659/3659784.png";

// Important milestones
const milestones = [
{
    year: 1994,
    title: "Original Brain Trust Meeting",
    description: "Pixar directors meeting where concepts for many early films through WALL-E were developed"
},
{
    year: 2006,
    title: "Disney Acquisition",
    description: "The Walt Disney Company acquires Pixar Animation Studios"
},
{
    year: 2008,
    title: "WALL-E Release",
    description: "Final film conceived during the original 1994 Brain Trust meeting"
}
];

// Timeline configuration
const timelineConfig = {
startYear: 1994,
endYear: 2025,
normalSpeed: 500,
slowSpeed: 1500,
milestoneDisplayTime: 2500
};
  
// Initialize the visualization
document.addEventListener('DOMContentLoaded', function() {
    initializeTimeline();

    // Add event listeners for controls
    const startButton = document.getElementById('start-animation');
    const resetButton = document.getElementById('reset-animation');
    
    // Style buttons with white outline, hollow style
    [startButton, resetButton].forEach(button => {
        button.style.background = 'transparent';
        button.style.color = 'white';
        button.style.border = '2px solid white';
        button.style.padding = '8px 16px';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.3s ease';
        button.style.margin = '0 5px';
        button.style.fontFamily = '"Futura", sans-serif';
        
        // Add hover effect
        button.addEventListener('mouseenter', function() {
            this.style.background = 'white';
            this.style.color = 'black';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
            this.style.color = 'white';
        });
    });
    
    startButton.addEventListener('click', startAnimation);
    resetButton.addEventListener('click', resetAnimation);

    // Preload images and set fallbacks
    preloadImages();
});

function preloadImages() {
    pixarFilms.forEach(film => {
        const img = new Image();
        img.onerror = function() {
          console.log(film);
          console.log("ERROR LOADING IMAGE");
          console.log(img);
          film.character = placeholderIcon;
        };
        img.src = film.character;
    });
}

// Timeline elements
let timeScale, tooltip, cursor;
let currentYear = timelineConfig.startYear;
let animationInProgress = false;
let visibleCards = [];
let timelineMarkers = []; // Store references to timeline markers

function initializeTimeline() {
    const timelineWrapper = d3.select('.timeline-wrapper');
    const containerWidth = timelineWrapper.node().getBoundingClientRect().width;

    // Use full container width with proper margins
    timeScale = d3.scaleLinear()
        .domain([timelineConfig.startYear - 0.5, timelineConfig.endYear + 0.5])
        .range([30, containerWidth - 30]);

    // Add year markers with proper spacing
    const yearStep = 1;
    const years = [];
    for (let year = timelineConfig.startYear; year <= timelineConfig.endYear; year += yearStep) {
        years.push(year);
    }

    // Style the timeline
    d3.select('.timeline')
        .style('background-color', '#ffffff')
        .style('height', '2px'); // Thinner line for more elegant look

    // Create and position year markers and labels
    years.forEach(year => {
        // Only add a visual marker for every year - make them hollow with white outline
        const marker = timelineWrapper.append('div')
            .attr('class', 'timeline-marker')
            .attr('id', `marker-${year}`)
            .style('left', `${timeScale(year)}px`)
            .style('background-color', 'transparent') // Hollow
            .style('border', '2px solid white') // White outline
            .style('width', '10px') // Slightly smaller
            .style('height', '10px')
            .style('transform', 'translate(-50%, -50%)');
        
        // Store reference to marker
        timelineMarkers.push({year: year, element: marker});
        
        // To prevent overcrowding, only add a label for every 3rd year
        if (year % 3 === 0 || year === timelineConfig.startYear || year === timelineConfig.endYear) {
            timelineWrapper.append('div')
                .attr('class', 'timeline-label')
                .style('left', `${timeScale(year)}px`)
                .style('color', 'white') // Ensure white text
                .text(year);
        }
    });

    // Add milestone labels (initially hidden)
    milestones.forEach(milestone => {
        timelineWrapper.append('div')
            .attr('class', 'milestone-label')
            .attr('id', `milestone-${milestone.year}`)
            .style('left', `${timeScale(milestone.year)}px`)
            .style('color', 'white') // Ensure text is white
            .style('background-color', 'rgba(0, 0, 0, 0.8)') // Dark background with slight transparency
            .style('border-left', '5px solid white') // White accent instead of colored
            .html(`
                <div class="milestone-title" style="color: white;">${milestone.title} (${milestone.year})</div>
                <div>${milestone.description}</div>
            `);
    });

    // Initialize cursor
    cursor = d3.select('.cursor')
        .style('left', `${timeScale(timelineConfig.startYear)}px`);

    // No cursor initialization needed as we're using the animation line instead

    // Create tooltip
    tooltip = d3.select('.tooltip');
}

function startAnimation() {
    if (animationInProgress) return;
    animationInProgress = true;

    // Reset to start position if already complete
    if (currentYear >= timelineConfig.endYear) {
        resetAnimation();
    }

    // Start the animation sequence
    animateToNextYear();
}
  
function resetAnimation() {
    // Stop any ongoing animation
    animationInProgress = false;

    // Reset cursor and year
    currentYear = timelineConfig.startYear;
    cursor.style('left', `${timeScale(currentYear)}px`);
    
    // Reset all markers to hollow
    timelineMarkers.forEach(marker => {
        marker.element
            .style('background-color', 'transparent')
            .style('border', '2px solid white');
    });

    // Update year display
    document.getElementById('current-year').textContent = currentYear;

    // Hide all milestone labels
    d3.selectAll('.milestone-label').classed('visible', false);

    // Remove all film cards
    d3.selectAll('.film-card').remove();
    visibleCards = [];
}

function animateToNextYear() {
    if (!animationInProgress || currentYear >= timelineConfig.endYear) {
        animationInProgress = false;
        return;
    }

    // Instead of stepping through years one by one, animate smoothly to the end
    if (currentYear === timelineConfig.startYear) {
        animateCursorSmoothly();
        return;
    }
}

function animateCursorSmoothly() {
    // Get all the years we need to pass through
    const yearsToAnimate = [];
    for (let year = timelineConfig.startYear + 1; year <= timelineConfig.endYear; year++) {
        yearsToAnimate.push(year);
    }

    // Set up the total animation duration - faster overall with slowdowns at milestones
    const totalDuration = yearsToAnimate.length * timelineConfig.normalSpeed * 0.7;
    const startPosition = timeScale(timelineConfig.startYear);
    const endPosition = timeScale(timelineConfig.endYear);
    const startTime = Date.now();

    // Function to update the cursor position
    function updateCursorPosition() {
        if (!animationInProgress) return;
        
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / totalDuration, 1);
        
        // Smooth out the progress with an easing function
        let easedProgress = progress;
        
        // Apply slowdown effect near milestone years
        const milestoneYears = milestones.map(m => m.year);
        milestoneYears.forEach(milestoneYear => {
            const milestonePosition = (milestoneYear - timelineConfig.startYear) / 
                                    (timelineConfig.endYear - timelineConfig.startYear);
            
            // If we're approaching a milestone (within 10% of timeline), slow down
            const distance = Math.abs(progress - milestonePosition);
            if (distance < 0.1) {
                // Apply slowdown factor - more slowdown closer to the milestone
                const slowdownFactor = 1 - (0.1 - distance) * 5;
                easedProgress = easedProgress * slowdownFactor + milestonePosition * (1 - slowdownFactor);
            }
        });
        
        // Calculate new cursor position
        const newPosition = startPosition + (endPosition - startPosition) * easedProgress;
        cursor.style('transition', 'none')
            .style('left', `${newPosition}px`);
        
        // Find the current year based on position
        const currentPos = newPosition;
        let newYear = timelineConfig.startYear;
        
        // Fill markers as the cursor passes them
        for (let y = timelineConfig.startYear; y <= timelineConfig.endYear; y++) {
            const markerPosition = timeScale(y);
            
            // If the cursor has passed this marker
            if (newPosition >= markerPosition) {
                newYear = y;
                
                // Fill the marker with white
                const marker = d3.select(`#marker-${y}`);
                marker
                    .style('background-color', 'white')
                    .style('transition', 'background-color 0.3s ease');
            } else {
                break;
            }
        }
        
        // If we moved to a new year, update year display and show films
        if (newYear > currentYear) {
            // Find films for each year we passed
            for (let y = currentYear + 1; y <= newYear; y++) {
                document.getElementById('current-year').textContent = y;
                const filmsThisYear = pixarFilms.filter(film => film.year === y);
                addFilmCards(filmsThisYear, y);
                
                // Check for milestone
                if (milestones.some(m => m.year === y)) {
                    const milestoneLabel = d3.select(`#milestone-${y}`);
                    milestoneLabel.classed('visible', true);
                    
                    // Hide the milestone label after a delay
                    setTimeout(() => {
                        milestoneLabel.classed('visible', false);
                    }, timelineConfig.milestoneDisplayTime);
                }
            }
            
            // Update existing cards
            updateExistingCards();
            
            // Update current year
            currentYear = newYear;
        }
        
        // Continue animation if not complete
        if (progress < 1) {
            requestAnimationFrame(updateCursorPosition);
        } else {
            animationInProgress = false;
        }
    }

    // Start the animation loop
    requestAnimationFrame(updateCursorPosition);
}

function addFilmCards(films, year) {
const timelineWrapper = d3.select('.timeline-wrapper');

function getFilmYAlignment(film){
  if (film.title == 'Lightyear' || film.title == 'The Good Dinosaur'){
    return '0px';
  }
  else{
    return '100px';
  }
}

films.forEach((film, index) => {
    // Create the card with full movie information

    // If there is another film in the same year (Turning Red vs Lightyear) then put it a "step" above


    const card = timelineWrapper.append('div')
    .attr('class', `film-card current ${film.isOriginalConcept ? 'original-concept' : ''}`)
    .attr('data-year', film.year)
    .style('left', `${timeScale(year)}px`)
    .style('top', `${getFilmYAlignment(film)}`);
    
    // Add character icon and film info
    card.html(`
    <div class="character-icon" style="background-image: url('${film.character}')"></div>
    <div class="film-rating">${film.rating}</div>
    <div class="film-info">
        <p class="film-year">${film.year}</p>
    </div>
    `);
    
    // Add tooltip behavior
    card
    .on('mouseover', function(event) {
        tooltip
        .style('opacity', 1)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 10}px`)
        .html(`
            '<span style="color:#29b0ea"><strong>${film.title} (${film.year})</strong><br></span>
            '<span style="color:#fc3d22">Rotten Tomatoes: ${film.rating}%<br></span>
            '<span style="color:#c58609">Box Office: $${film.boxOffice}M<br></span>
            ${film.isOriginalConcept ? '<span style="color:#68d65d">Original Brain Trust Concept</span>' : ''}
        `);
    })
    .on('mouseout', function() {
        tooltip.style('opacity', 0);
    });
    
    // Make card visible
    setTimeout(() => {
    card.classed('visible', true);
    }, 100);
    
    // Add to visible cards array
    visibleCards.push({
    element: card,
    year: film.year
    });
});
}

function updateExistingCards() {
// Update all visible cards
visibleCards.forEach((cardInfo) => {
    const card = cardInfo.element;
    
    // Position the card at its year on the timeline
    card.style('left', `${timeScale(cardInfo.year)}px`);
    
    // If the card is from the current or a previous year, mark it as past
    if (cardInfo.year <= currentYear) {
    card.classed('current', false)
        .classed('past', true);
    }
});
}