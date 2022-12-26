import { gsap } from './gsap/index.js';

const stage = document.querySelector('.hero');
const imgFg = document.querySelector('.foreground');
const imgBg = document.querySelector('.background');
const imgs = [
  'https://res.cloudinary.com/gregrickaby/image/upload/c_scale,w_1920,f_auto/v1671890296/portfolio/DSC4730.jpg',
  'https://res.cloudinary.com/gregrickaby/image/upload/c_scale,w_1920,f_auto/v1671890296/portfolio/DSC02796.jpg',
  'https://res.cloudinary.com/gregrickaby/image/upload/c_scale,w_1920,f_auto/v1671890296/portfolio/P1000785.jpg',
  'https://res.cloudinary.com/gregrickaby/image/upload/c_scale,w_1920,f_auto/v1671890296/portfolio/DSC03286.jpg',
  'https://res.cloudinary.com/gregrickaby/image/upload/c_scale,w_1920,f_auto/v1671890296/portfolio/DSC00177.jpg',
];
const pos = { x: innerWidth / 2, y: innerHeight / 2 };

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
  gsap.to('circle', {
    attr: { cx: pos.x, cy: pos.y },
    ease: 'power2.inOut',
  });
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
    .to('circle', {
      duration: 0.4,
      attr: { r: innerWidth },
      ease: 'power3.in',
      stagger: -0.1,
    })
    .add(() => {
      imgFg.append(imgBg.children[imgBg.children.length - 1]);
      imgBg.prepend(imgFg.children[0]);
      gsap.set('circle', { attr: { r: 0 } });
    })
    .fromTo(
      'circle',
      { attr: { r: 0, cx: pos.x, cy: pos.y } },
      {
        attr: { r: (i) => [35, 45][i] },
        ease: 'power2.inOut',
        stagger: -0.1,
      },
      0.5
    )
    .add(mouseClickOn);
}

imgFg.append(imgBg.children[imgBg.children.length - 1]);

gsap.fromTo(
  'circle',
  { attr: { cx: pos.x, cy: pos.y } },
  { attr: { r: (i) => [35, 45][i] }, ease: 'power2.inOut' }
);

const loop = gsap
  .timeline({ repeatRefresh: true, repeat: -1 })
  .add(maskConstrict, 3)
  .add(nextImg, 3.15);
