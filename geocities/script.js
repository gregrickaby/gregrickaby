/**
 * Add event listener to the toggle button.
 */
document.body.addEventListener("click", function (event) {
  if (event.target.id === "toggleGeocities") {
    toggleGeocities();
  }
});

// Set the initial state.
let isGeocities = false;
let originalHeader, originalMain, originalFooter;

/**
 * Toggle Geocities theme.
 */
function toggleGeocities() {
  // Get the loading screen and audio.
  const loadingScreen = document.getElementById("loading");
  const loadingAudio = document.getElementById("loadingAudio");

  if (isGeocities) {
    document
      .querySelector('head link[href="geocities/geocities.css"]')
      .remove();
    document.querySelector("header").innerHTML = originalHeader;
    document.querySelector("main").innerHTML = originalMain;
    document.querySelector("footer").innerHTML = originalFooter;
    loadingScreen.style.display = "none";
    loadingAudio.pause();
    isGeocities = false;
  } else {
    // Show loading screen.
    loadingScreen.style.display = "flex";

    // Play loading audio.
    loadingAudio.play();

    // Save the original state.
    originalHeader = document.querySelector("header").innerHTML;
    originalMain = document.querySelector("main").innerHTML;
    originalFooter = document.querySelector("footer").innerHTML;

    // Add Geocities styles.
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "geocities/geocities.css";
    document.head.appendChild(link);

    setTimeout(() => {
      // Header HTML content.
      const newHeader = `
            <img src="geocities/welcome.webp" alt="Welcome to my homepage!" loading="eager" />
            <div>
              <marquee width="350px" behavior="scroll" direction="right" scrollamount="12">
                <img src="geocities/enterprise.webp" alt="Enterprise" loading="eager" />
              </marquee>
              <div class="boldy-going">
              <img src="geocities/earth.webp" alt="Earth" loading="eager" />
              <marquee width="350px" behavior="scroll">
                <span role="image" aria-label="spock">🖖🏻</span> To boldly go where no one has gone before <span role="image" aria-label="spock">🖖🏻</span>
              </marquee>
              <img src="geocities/earth.webp" alt="Earth" loading="eager" />
              </div>
            </div>
          `;

      // Main content HTML.
      const flamingHoffTrek = `
            <img src="geocities/bridge-crew.webp" alt="Bridge crew" loading="lazy" />
            <img src="geocities/hasselhoff.webp" alt="David Hasselhoff" loading="lazy" />
            <img src="geocities/flames.webp" alt="Flames" loading="lazy" />
          `;

      // Footer HTML content.
      const newFooter = `
            <p>
              <img src="geocities/counter.webp" alt="Counter" loading="lazy" />
              <img src="geocities/netscape.webp" alt="Netscape" loading="lazy" />
              <img src="geocities/ie.webp" alt="Internet Explorer" loading="lazy" />
              <img src="geocities/notepad.webp" alt="Notepad" loading="lazy" />
            </p>
          `;

      // Update the DOM.
      document.querySelector("header").innerHTML = newHeader;
      document.querySelector("main").innerHTML += flamingHoffTrek;
      document.querySelector("footer").innerHTML += newFooter;

      // Hide loading screen.
      loadingScreen.style.display = "none";

      // Update state.
      isGeocities = true;
    }, 5700); // 5700ms is the duration of the dial-up sound.
  }
}
