/** Import: Styles **/
import './css/normalize.min.css';
import './css/main.scss';
import '../node_modules/vanillajs-datepicker/dist/css/datepicker.min.css';

/** Import: Utils **/
import { Datepicker } from 'vanillajs-datepicker';

/** Import: Modules **/
import Steps from './lib/steps';

/** Polifills - Closest **/
(function(ELEMENT) {
  ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
  ELEMENT.closest = ELEMENT.closest || function closest(selector) {
      if (!this) return null;
      if (this.matches(selector)) return this;
      if (!this.parentElement) {return null}
      else return this.parentElement.closest(selector)
    };
}(Element.prototype));

/** Polifills - After **/
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('after')) {
      return;
    }
    Object.defineProperty(item, 'after', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function after() {
        var argArr = Array.prototype.slice.call(arguments),
          docFrag = document.createDocumentFragment();
        
        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });
        
        this.parentNode.insertBefore(docFrag, this.nextSibling);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);


/** Initialization **/
document.addEventListener('DOMContentLoaded', function() {

  /* Datepicker init */
  const datepickerEl = document.querySelector('.form-group__field_date');
  const datepicker = new Datepicker(datepickerEl, {minDate: new Date()});

  /* Get Amount from parent */
  window.addEventListener('message', function (e) {
    if (e.data) {
      document.querySelector('.form-actions__btn_submit').innerHTML = `Pay ${e.data} $`;
    }
  });

  /* Steps init */
  const stepEls = document.querySelectorAll('.step-section');
  const stepComps = [];  

  stepEls.forEach((el, index) => {
    stepComps[index] = new Steps(el);
    stepComps[index].init();
  });

});