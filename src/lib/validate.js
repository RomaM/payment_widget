export default class Validate {
  constructor(formEl, currentSection, prevSection, nextSection) {
    this.formEl = formEl;
    this.currentSection = currentSection;
    this.prevSection = prevSection;
    this.nextSection = nextSection;
    this.countryCode = null;
    this.paymentMethods = null;
  }

  validateRegEx(regEx, value) {
      if(regEx.test(value)) {
        return true;
      } 
      return false;
  }

  luhnAlgorithm(value) {  
    let arr = (num + '')
    .split('')
    .reverse()
    .map(x => parseInt(x));
    let lastDigit = arr.splice(0, 1)[0];
    let sum = arr.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
    sum += lastDigit;
    return sum % 10 === 0;
  }

  getGeoData() {
    return new Promise((res, rej) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://get.geojs.io/v1/ip/country.json');
      xhr.onload = () => res(xhr.responseText);
      xhr.onerror = () => rej(xhr.statusText);
      xhr.send();
    });
  }

  getPaymentMethods(countryCode) {
    return new Promise((res, rej) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 
        `https://api.paymentwall.com/api/payment-systems/?key=af1536cd62a51777a06b0dfeda6a78eb&country_code=${countryCode}&sign_version=2`
      );
      xhr.onload = () => res(xhr.responseText);
      xhr.onerror = () => rej(xhr.statusText);
      xhr.send();
    });
  }

  validateField(field) {
    const lettersRegEx = /^[a-zA-Z]+$/;
    const numbersRegEx = /^[0-9]+$/;
    const emailRegEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const errorMsgs = {
      country: 'Select country',
      anotherCountry: 'Select another country',
      paymentmethod: 'Choose payment method',
      cardname: 'Enter a valid name',
      cardnumber: 'Enter a valid card number',
      carddate: 'Enter a valid card expiry date',
      cvv: 'Enter a valid cvv'
    }

    switch (field.dataset.type) {
      case 'country':
        if(!field.value) {
          return errorMsgs.country;
        } else if(!this.paymentMethods || this.countryCode != field.value) {
          this.countryCode = field.value;
          return this.getPaymentMethods(field.value);
        } else if(this.paymentMethods && this.countryCode == field.value) {
          // console.log('Result');
          return Promise.resolve(JSON.stringify(this.paymentMethods));
        } else {
          return errorMsgs.anotherCountry;
        }
        break;
      case 'paymentmethod':
        return field.value ? true : errorMsgs.paymentmethod;
        break;
      case 'cardholder':
        return field.value && this.validateRegEx(lettersRegEx, field.value) && field.value.length >= 3 ? true : errorMsgs.cardname;
        break;
      case 'cardnumber':
        return field.value && this.validateRegEx(numbersRegEx, field.value) && this.luhnAlgorithm && field.value.length === 16 ? true : errorMsgs.cardnumber;
        break;
      case 'expdate':
        return field.value ? true : errorMsgs.carddate;
        break;
      case 'cvv':
        return field.value && this.validateRegEx(numbersRegEx, field.value) && field.value.length === 3 ? true : errorMsgs.cvv;  
        break;
      default:
        console.log('No validation functionality');
    }
  }

  errorToggle(el) {
    if(el) {
      let result = this.validateField(el);    
      if(result instanceof Promise && el.classList.contains('form-group__field_country')) {        
        el.parentNode.querySelector('.form-group__error').innerHTML = '';
        return result.then(data => {
          this.paymentMethods = JSON.parse(data);
          return 'payments';
        })
      } else if (result !== true) {
        el.parentNode.querySelector('.form-group__error').innerHTML = result;
        return false;
      } else {
        el.parentNode.querySelector('.form-group__error').innerHTML = '';
        return true;
      }
    }
    
  }

  paymentElems(paymentMethods, parent) {
    if(paymentMethods) {
      let checkboxes = parent.querySelectorAll('.form-group__checkbox');
      const paymentField = parent.querySelector('.form-group__field_payment');

      checkboxes.forEach(el => {
        parent.removeChild(el);
      });

      paymentMethods.map(item => {
        const newEl = document.createElement('div');
        newEl.classList.add('form-group__checkbox' ,'checkbox');
        newEl.dataset.payment = item.name;
  
        newEl.innerHTML = `
          <span class="checkbox__name">${item.name}</span><img class="checkbox__img" src="${item.img_url}" alt="${item.name}">
        `;
        paymentField.after(newEl);
      });

      checkboxes = parent.querySelectorAll('.form-group__checkbox');

      if (checkboxes) {
        parent.addEventListener('click', (ev) => {
          const closestCheckbox = ev.target.closest('.form-group__checkbox');

          if (closestCheckbox) {
            this.removeClass(checkboxes, 'active');
            closestCheckbox.classList.add('active');
            paymentField.value = closestCheckbox.dataset.payment;
            this.errorToggle(paymentField);
          }
        });
      }
      
    }    
  }  

  toggleClass(elArr, className) {
    if(elArr) {
      elArr.forEach(el => {
        el.classList.toggle(className);
      })
    }
  }

  removeClass(elems, className) {
      if (elems && className) {
        elems.forEach(el => {
          el.classList.remove(className);
        })
      }
  }

  init() {
    const formFields = this.formEl.querySelectorAll('input, select');

    if(!formFields) {
      return;
    }

    formFields.forEach((el, index) => {
      
      if(el.classList.contains('form-group__field_country')) {
        this.getGeoData()
          .then(data => {
            data = JSON.parse(data);
            el.value = data['country'];
            this.countryCode = data['country'];
            this.errorToggle(el);
          })
          .catch(err => {console.log(err)})
      }

      el.addEventListener('input', (ev) => {
        this.errorToggle(el);
      });

      el.addEventListener('change', (ev) => {
        this.errorToggle(el);
      });

      el.addEventListener('blur', (ev) => {
        this.errorToggle(el);
      });
    });

    let backBtn = this.formEl.querySelector('.form-actions__btn_back');
    let nextBtn = this.formEl.querySelector('.form-actions__btn_next');
    let submitBtn = this.formEl.querySelector('.form-actions__btn_submit');

    if(backBtn && this.prevSection) {
      backBtn.addEventListener('click', () => {
        this.toggleClass([this.currentSection, this.prevSection], 'active')
      });
    }

    if(nextBtn && this.nextSection) {
      nextBtn.addEventListener('click', () => {
        let result = false;

        formFields.forEach((el, index) => {
          result = this.errorToggle(el);
        });

        if (result instanceof Promise) {
          result.then(data => {
            
            if(data === 'payments') {
              const parent = document.querySelector('.form-group__field_payment').parentNode;
              this.paymentElems(this.paymentMethods, parent);
            }

            this.toggleClass([this.currentSection, this.nextSection], 'active');
          });
        } else if (result) {
          this.toggleClass([this.currentSection, this.nextSection], 'active');
        }
      });
    }
  

    if(submitBtn) {
      submitBtn.addEventListener('click', (ev) => {
        let valid = false;
        ev.preventDefault();
        formFields.forEach((el, index) => {
          valid = this.errorToggle(el);
        });

        if (valid) {

          this.toggleClass([this.currentSection, this.nextSection], 'active');
        }
      });
    }
  }

}

