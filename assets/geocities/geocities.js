// Set global state.
let isGeocities = false;

/**
 * Geocities theme!
 */
function geocities() {
  // Toggle the state.
  if (isGeocities) {
    isGeocities = false;
    return window.location.reload(true);
  }

  const assets = `
    <link rel="stylesheet" href="geocities/styles.css" />
  `;

  const newHeader = `
  <img src="geocities/welcome.gif" alt="Welcome to my homepage!" loading="eager" />
  <div>

    <marquee width="350px" behavior="scroll" direction="right" scrollamount="12">
      <img src="geocities/enterprise.webp" alt="Enterprise" loading="eager" />
    </marquee>
    <div></div>
    <img src="geocities/earth.gif" alt="" loading="eager" />
    <marquee width="350px" behavior="scroll">
      <span role="image" aria-label="spock">🖖🏻</span> To boldy go where no one has gone before <span role="image" aria-label="spock">🖖🏻</span>
    </marquee>
    <img src="geocities/earth.gif" alt="" loading="eager" />
  </div>
  `;

  // David, you beatiful SOB.
  const flamingHoffTrek = `
  <img src="geocities/bridge-crew.webp" alt="" loading="lazy" />
  <img src="geocities/hasselhoff.webp" alt="" loading="lazy" />
  <img src="geocities/flames.gif" alt="" loading="lazy" />
  `;

  const newFooter = `
  <p>
    <img src="geocities/counter.gif" alt="" loading="lazy" />
    <img src="geocities/netscape.gif" alt="" loading="lazy" />
    <img src="geocities/ie.gif" alt="" loading="lazy" />
    <img src="geocities/notepad.gif" alt="" loading="lazy" />
    <audio src="geocities/star-trek-modem.mp3" autoplay loop />
  </p>
  `;

  // Add or append HTML.
  document.querySelector('head').innerHTML += assets;
  document.querySelector('header').innerHTML = newHeader;
  document.querySelector('main').innerHTML += flamingHoffTrek;
  document.querySelector('footer').innerHTML += newFooter;

  // Update state.
  isGeocities = true;
}
