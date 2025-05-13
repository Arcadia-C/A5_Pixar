// Section animations
document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('.section');
  
  // Check if sections are in view on page load
  checkSections();
  
  // Check if sections are in view on scroll
  window.addEventListener('scroll', checkSections);
  
  function checkSections() {
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      // If section is in viewport
      if (sectionTop < windowHeight * 0.75) {
        section.classList.add('in-view');
      }
    });
  }
});
