import { debounce } from "lodash";
import anime from "animejs/lib/anime.es.js";

export const webp = {
  data: () => ({
    supportWepb: false,
  }),
  async created() {
    if (await this.checkWebP()) {
      this.supportWepb = true;
    }
  },
  methods: {
    async checkWebP() {
      if (!self.createImageBitmap) return false;
      const webpData =
        "data:image/webp;base64,UklGRhIAAABXRUJQVlA4TAYAAAAvQWxvAGs=";

      const blob = await fetch(webpData).then((r) => r.blob());
      return createImageBitmap(blob).then(
        () => true,
        () => false
      );
    },
    webpUrl(url) {
      if (this.supportWepb) {
        const pos = url.lastIndexOf(".");
        const webpUrl = url.substr(0, pos < 0 ? url.length : pos);
        return webpUrl + ".webp";
      } else {
        return url;
      }
    },
  },
};

export class Blob {
  constructor(el, options) {
    this.DOM = {};
    this.DOM.el = el;
    this.options = {};
    Object.assign(this.options, options);
    this.init();
  }
  init() {
    this.rect = this.DOM.el.getBoundingClientRect();
    this.descriptions = [];
    this.layers = Array.from(this.DOM.el.querySelectorAll("path"), (t) => {
      t.style.transformOrigin = `${this.rect.left + this.rect.width / 2}px ${
        this.rect.top + this.rect.height / 2
      }px`;
      t.style.opacity = 0;
      this.descriptions.push(t.getAttribute("d"));
      return t;
    });

    window.addEventListener(
      "resize",
      debounce(() => {
        this.rect = this.DOM.el.getBoundingClientRect();
        this.layers.forEach(
          (layer) =>
            (layer.style.transformOrigin = `${
              this.rect.left + this.rect.width / 2
            }px ${this.rect.top + this.rect.height / 2}px`)
        );
      }, 20)
    );
  }
  intro() {
    // anime.remove(this.layers);
    anime({
      targets: this.layers,
      duration: 1800,
      delay: (t, i) => i * 120,
      easing: "cubicBezier(0.2, 1, 0.1, 1)",
      scale: [0.2, 1],
      opacity: {
        value: [0, 1],
        duration: 300,
        delay: (t, i) => i * 120,
        easing: "linear",
      },
    });
  }
  expand() {
    return new Promise((resolve, reject) => {
      let halfway = false;
      anime({
        targets: this.layers,
        duration: 1000,
        delay: (t, i) => i * 50 + 200,
        easing: [0.8, 0, 0.1, 0],
        d: (t) => t.getAttribute("pathdata:id"),
        update: function (anim) {
          if (anim.progress > 75 && !halfway) {
            halfway = true;
            resolve();
          }
        },
      });
    });
  }
  collapse() {
    return new Promise((resolve, reject) => {
      let halfway = false;
      anime({
        targets: this.layers,
        duration: 800,
        delay: (t, i, total) => (total - i - 1) * 50 + 400,
        easing: [0.2, 1, 0.1, 1],
        d: (t, i) => this.descriptions[i],
        update: function (anim) {
          if (anim.progress > 75 && !halfway) {
            halfway = true;
            resolve();
          }
        },
      });
    });
  }
  hide() {
    anime.remove(this.layers);
    anime({
      targets: this.layers,
      duration: 800,
      delay: (t, i, total) => (total - i - 1) * 80,
      easing: "easeInOutExpo",
      scale: 0,
      opacity: {
        value: 0,
        duration: 500,
        delay: (t, i, total) => (total - i - 1) * 80,
        easing: "linear",
      },
    });
  }
  show() {
    setTimeout(() => this.intro(), 400);
  }
}
