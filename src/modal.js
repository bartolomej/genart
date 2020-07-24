class Modal {

  constructor ({ title, description }) {
    this.title = title;
    this.description = description;
  }

  show () {
    this.container = this._createDomElement();
    document.body.appendChild(this.container);
  }

  hide () {
    if (this.container) {
      document.body.removeChild(this.container);
    }
  }

  _createDomElement () {
    const light = 'rgb(245, 247, 251)';
    const darkish = 'rgb(52, 52, 64)';
    const red = 'rgb(232, 74, 95)';

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.padding = '20px';
    container.style.fontFamily = 'Verdana, sans-serif';
    container.style.borderRadius = '12px';
    container.style.background = light;
    container.style.boxSizing = 'border-box';

    const title = document.createElement('h1');
    title.innerText = this.title;
    title.style.color = red;

    const description = document.createElement('div');
    description.innerHTML = this.description;
    description.style.color = darkish;
    description.style.padding = '10px 0'

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Got it !';
    closeBtn.style.background = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.padding = '10px';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.border = `2px solid ${red}`;
    closeBtn.style.fontWeight = `bold`;
    closeBtn.style.color = red;
    closeBtn.addEventListener('click', () => this.hide());
    closeBtn.addEventListener('mouseover', () => {
      closeBtn.style.background = red;
      closeBtn.style.color = light;
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'none';
      closeBtn.style.color = red;
    });

    // media queries
    const mobileQuery = window.matchMedia('(max-width: 700px)');
    window.addEventListener('resize', onResize);
    onResize();
    function onResize () {
      if (mobileQuery.matches) {
        container.style.width = '90vw';
      }
    }

    // set html background as black in case that modal overflows height
    document.documentElement.style.background = 'black';

    container.append(title, description, closeBtn);

    return container;
  }

}

module.exports = Modal;
