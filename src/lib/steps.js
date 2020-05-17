import Validate from './validate';

export default class Steps {
  constructor(sectionEl) {
    this.sectionEl = sectionEl;
    this.formEl = this.sectionEl.querySelector('.select-form');
  }

  init() {
    const formEl = this.sectionEl.querySelector('.select-form');
    const prevSection = this.sectionEl.previousElementSibling;
    const nextSection = this.sectionEl.nextElementSibling;
    let formValidationInstance;

    if(formEl) {
      formValidationInstance = new Validate(formEl, this.sectionEl, prevSection, nextSection);
      formValidationInstance.init();      
    }
  }
}