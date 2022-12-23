import { gsap } from './esm_modules/gsap/esm/index.js';

async function getPhotos() {
  try {
    // Attempt to fetch all photos from Cloudinary.
    const response = await fetch(`https://api.cloudinary.com/v1_1/gregrickaby/resources/search`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic NzY3NDQ2NjY1NjY4OTg1Onc3dlp6VFJXQ09NNXMyRDExWWl5cGFWNmJFVQ==',
      },
    });

    // If the response is not OK, throw an error.
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // Return the response as JSON.
    const data = await response.json();

    // Set an array.
    let images = [];

    // Loop through the images and add the src to the array.
    data.resources.forEach((resource) => {
      images.push(resource);
    });

    // Return our array.
    return images;
  } catch (error) {
    console.error(error);
  }
}

export default async function slideshow() {
  // Get the photos from Cloudinary.
  const imgs = await getPhotos();

  // If there are no images, return.
  if (!imgs) return;

  // Set the stage.
  const stage = document.querySelector('svg');
  const imgFg = document.querySelector('#imgFg');
  const imgBg = document.querySelector('#imgBg');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };

  // Loop over images and create elements.
  for (let i = 0; i < imgs.length; i++) {
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    imgBg.appendChild(img);
    gsap.set(img, {
      attr: {
        x: '-5%',
        y: '-5%',
        width: '110%',
        height: '110%',
        href: imgs[i],
        preserveAspectRatio: 'xMidYMid slice',
      },
    });
  }

  window.addEventListener('resize', () => {
    pos.x = innerWidth / 2;
    pos.y = innerHeight / 2;
    gsap.set('circle', { duration: 0.3, attr: { cx: pos.x, cy: pos.y } });
  });

  stage.addEventListener('mouseenter', (e) => {
    loop.pause();
    stage.addEventListener('mousemove', mouseFollow);
    mouseClickOn();
  });

  stage.addEventListener('mouseleave', (e) => {
    mouseClickOff();
    stage.removeEventListener('mousemove', mouseFollow);
    pos.x = innerWidth / 2;
    pos.y = innerHeight / 2;
    gsap.to('circle', { attr: { cx: pos.x, cy: pos.y }, ease: 'power2.inOut' });
    gsap.to(imgFg.children[0], { attr: { x: '-5%', y: '-5%' } });
    loop.play(0);
  });

  function mouseClickOn() {
    stage.addEventListener('mousedown', maskConstrict);
    stage.addEventListener('mouseup', nextImg);
  }

  function mouseClickOff() {
    stage.removeEventListener('mousedown', maskConstrict);
    stage.removeEventListener('mouseup', nextImg);
  }

  function mouseFollow(e) {
    pos.x = e.pageX;
    pos.y = e.pageY;
    gsap.to('circle', { duration: 0.3, attr: { cx: pos.x, cy: pos.y } });
    gsap.to(imgFg.children[0], {
      attr: {
        x: gsap.utils.interpolate('0%', '-10%', pos.x / innerWidth),
        y: gsap.utils.interpolate('0%', '-10%', pos.y / innerHeight),
      },
    });
  }

  function maskConstrict(e) {
    gsap.to('circle', { duration: 0.3, attr: { r: (i) => [30, 50][i] } });
  }

  function nextImg() {
    mouseClickOff();
    gsap
      .timeline()
      .to('circle', { duration: 0.4, attr: { r: innerWidth }, ease: 'power3.in', stagger: -0.1 })
      .add(() => {
        imgFg.append(imgBg.children[imgBg.children.length - 1]);
        imgBg.prepend(imgFg.children[0]);
        gsap.set('circle', { attr: { r: 0 } });
      })
      .fromTo(
        'circle',
        { attr: { r: 0, cx: pos.x, cy: pos.y } },
        { attr: { r: (i) => [35, 45][i] }, ease: 'power2.inOut', stagger: -0.1 },
        0.5
      )
      .add(mouseClickOn);
  }

  imgFg.append(imgBg.children[imgBg.children.length - 1]);
  gsap.fromTo('circle', { attr: { cx: pos.x, cy: pos.y } }, { attr: { r: (i) => [35, 45][i] }, ease: 'power2.inOut' });

  const loop = gsap.timeline({ repeatRefresh: true, repeat: -1 }).add(maskConstrict, 3).add(nextImg, 3.15);
}
