/**
 * HeroAnimation class for animating the hero section.
 */
class HeroAnimation {
  /**
   * Initializes the HeroAnimation with default values and event listeners.
   */
  constructor() {
    this.stage = document.querySelector('.hero');
    this.imgFg = document.querySelector('.foreground');
    this.imgBg = document.querySelector('.background');
    this.imgs = [
      'assets/images/hero/7.webp',
      'assets/images/hero/6.webp',
      'assets/images/hero/5.webp',
      'assets/images/hero/4.webp',
      'assets/images/hero/3.webp',
      'assets/images/hero/2.webp',
      'assets/images/hero/1.webp',
    ];
    this.pos = { x: innerWidth / 2, y: innerHeight / 2 };

    this.initImages();
    this.addEventListeners();
    this.initializeAnimations();
  }

  /**
   * Populates the background with images.
   */
  initImages() {
    for (let i = 0; i < this.imgs.length; i++) {
      const img = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'image',
      );
      this.imgBg.appendChild(img);
      gsap.set(img, {
        attr: {
          x: '-5%',
          y: '-5%',
          width: '110%',
          height: '110%',
          href: this.imgs[i],
          preserveAspectRatio: 'xMidYMid slice',
        },
      });
    }
  }

  /**
   * Adds necessary event listeners.
   */
  addEventListeners() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.stage.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.stage.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  /**
   * Handler for the window resize event.
   */
  handleResize() {
    this.pos.x = innerWidth / 2;
    this.pos.y = innerHeight / 2;
    gsap.set('circle', {
      duration: 0.3,
      attr: { cx: this.pos.x, cy: this.pos.y },
    });
  }

  /**
   * Handler for the stage mouseenter event.
   * @param {Event} e - The mouseenter event.
   */
  handleMouseEnter(e) {
    this.loop.pause();
    this.stage.addEventListener('mousemove', this.mouseFollow.bind(this));
    this.mouseClickOn();
  }

  /**
   * Handler for the stage mouseleave event.
   * @param {Event} e - The mouseleave event.
   */
  handleMouseLeave(e) {
    this.mouseClickOff();
    this.pos.x = innerWidth / 2;
    this.pos.y = innerHeight / 2;
    gsap.to('circle', {
      attr: { cx: this.pos.x, cy: this.pos.y },
      ease: 'power2.inOut',
    });
    gsap.to(this.imgFg.children[0], { attr: { x: '-5%', y: '-5%' } });
    this.loop.play(0);
  }

  /**
   * Attach mousedown and mouseup event listeners to the stage.
   */
  mouseClickOn() {
    this.stage.addEventListener('mousedown', this.maskConstrict.bind(this));
    this.stage.addEventListener('mouseup', this.nextImg.bind(this));
  }

  /**
   * Remove mousedown and mouseup event listeners from the stage.
   */
  mouseClickOff() {
    this.stage.removeEventListener('mousedown', this.maskConstrict);
    this.stage.removeEventListener('mouseup', this.nextImg);
  }

  /**
   * Handler for the stage mousemove event. Moves the image and the circle.
   * @param {Event} e - The mousemove event.
   */
  mouseFollow(e) {
    this.pos.x = e.pageX;
    this.pos.y = e.pageY;
    gsap.to('circle', {
      duration: 0.3,
      attr: { cx: this.pos.x, cy: this.pos.y },
    });
    gsap.to(this.imgFg.children[0], {
      attr: {
        x: gsap.utils.interpolate('0%', '-10%', this.pos.x / innerWidth),
        y: gsap.utils.interpolate('0%', '-10%', this.pos.y / innerHeight),
      },
    });
  }

  /**
   * Handler for the stage mousedown event. Constricts the mask size.
   * @param {Event} e - The mousedown event.
   */
  maskConstrict(e) {
    gsap.to('circle', { duration: 0.3, attr: { r: (i) => [30, 50][i] } });
  }

  /**
   * Transitions to the next image.
   */
  nextImg() {
    this.mouseClickOff();
    gsap
      .timeline()
      .to('circle', {
        duration: 0.4,
        attr: { r: innerWidth },
        ease: 'power3.in',
        stagger: -0.1,
      })
      .add(() => {
        this.imgFg.append(this.imgBg.children[this.imgBg.children.length - 1]);
        this.imgBg.prepend(this.imgFg.children[0]);
        gsap.set('circle', { attr: { r: 0 } });
      })
      .fromTo(
        'circle',
        { attr: { r: 0, cx: this.pos.x, cy: this.pos.y } },
        {
          attr: { r: (i) => [35, 45][i] },
          ease: 'power2.inOut',
          stagger: -0.1,
        },
        0.5,
      )
      .add(this.mouseClickOn.bind(this));
  }

  /**
   * Initializes the initial animations and loops.
   */
  initializeAnimations() {
    this.imgFg.append(this.imgBg.children[this.imgBg.children.length - 1]);

    gsap.fromTo(
      'circle',
      { attr: { cx: this.pos.x, cy: this.pos.y } },
      { attr: { r: (i) => [35, 45][i] }, ease: 'power2.inOut' },
    );

    this.loop = gsap
      .timeline({ repeatRefresh: true, repeat: -1 })
      .add(this.maskConstrict.bind(this), 3)
      .add(this.nextImg.bind(this), 6);
  }
}

// Initialize the HeroAnimation once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
  new HeroAnimation();
});
