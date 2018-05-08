(function ($) {
  'use strict'

  var showBackToTopButton = function () {
    if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
      $('#back-to-top')[0].style.display = 'block'
    } else {
      $('#back-to-top')[0].style.display = 'none'
    }
  }

  showBackToTopButton()

  document.addEventListener('scroll', function (e) {
    showBackToTopButton()
  }, true)

  window.topFunction = function () {
    window.scroll({
      top: 0,
      behavior: 'smooth'
    })
  }
})(jQuery)
