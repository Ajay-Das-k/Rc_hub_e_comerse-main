function formatDate(date) {
  var day = date.getDate();
  var month = date.toLocaleString('default', { month: 'long' });
  var year = date.getFullYear();

  var suffix = "th";
  if (day === 1 || day === 21 || day === 31) {
      suffix = "st";
  } else if (day === 2 || day === 22) {
      suffix = "nd";
  } else if (day === 3 || day === 23) {
      suffix = "rd";
  }

  return day + suffix + "-" + month + "-" + year;
}

function updateClock() {
  // Get the current date and time
  var now = new Date();

  // Format the date and time
  var formattedDate = formatDate(now);
  var formattedTime = now.toLocaleTimeString();

  // Update the clock element with the formatted date and time
  document.getElementById("clock").innerHTML = formattedDate + " " + formattedTime;
}

// Call the updateClock function initially
updateClock();

// Set an interval to update the clock every second (1000 milliseconds)
setInterval(updateClock, 1000);




(function($) {
  'use strict';
  $(function() {
    var body = $('body');
    var contentWrapper = $('.content-wrapper');
    var scroller = $('.container-scroller');
    var footer = $('.footer');
    var sidebar = $('.sidebar');
    var navbar = $('.navbar').not('.top-navbar');


    //Add active class to nav-link based on url dynamically
    //Active class can be hard coded directly in html file also as required




    function addActiveClass(element) {
      if (current === "") {
        //for root url
        if (element.attr('href').indexOf("index.html") !== -1) {
          element.parents('.nav-item').last().addClass('active');
          if (element.parents('.sub-menu').length) {
            element.closest('.collapse').addClass('show');
            element.addClass('active');
          }
        }
      } else {
        //for other url
        if (element.attr('href').indexOf(current) !== -1) {
          element.parents('.nav-item').last().addClass('active');
          if (element.parents('.sub-menu').length) {
            element.closest('.collapse').addClass('show');
            element.addClass('active');
          }
          if (element.parents('.submenu-item').length) {
            element.addClass('active');
          }
        }
      }
    }

    var current = location.pathname.split("/").slice(-1)[0].replace(/^\/|\/$/g, '');
    $('.nav li a', sidebar).each(function() {
      var $this = $(this);
      addActiveClass($this);
    })

    //Close other submenu in sidebar on opening any

    sidebar.on('show.bs.collapse', '.collapse', function() {
      sidebar.find('.collapse.show').collapse('hide');
    });


    //Change sidebar and content-wrapper height
    applyStyles();

    function applyStyles() {
      //Applying perfect scrollbar
    }

    $('[data-toggle="minimize"]').on("click", function() {
      if (body.hasClass('sidebar-toggle-display')) {
        body.toggleClass('sidebar-hidden');
      } else {
        body.toggleClass('sidebar-icon-only');
      }
    });

    //checkbox and radios
    $(".form-check label,.form-radio label").append('<i class="input-helper"></i>');


    // fixed navbar on scroll
    $(window).scroll(function() {
      if(window.matchMedia('(min-width: 991px)').matches) {
        if ($(window).scrollTop() >= 197) {
          $(navbar).addClass('navbar-mini fixed-top');
          $(body).addClass('navbar-fixed-top');
        } else {
          $(navbar).removeClass('navbar-mini fixed-top');
          $(body).removeClass('navbar-fixed-top');
        }
      }
      if(window.matchMedia('(max-width: 991px)').matches) {
        $(navbar).addClass('navbar-mini fixed-top');
        $(body).addClass('navbar-fixed-top');
      } 
    });  
  });
})(jQuery);