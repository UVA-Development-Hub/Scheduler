var currentPage = 0;
$(document).ready( function() {
  displayPage(0);

});


function displayPage(pageNumber){
  $('.paged').each(function(){
      if(parseInt($(this).attr('page')) == pageNumber) { // attr('page') gets data from the class 'page'
          console.log("page 0");
          $(this).show();
      } else {
        $(this).hide();
      }
    })
};


function nextPage(){
  currentPage++;
  displayPage(currentPage);
};

function previousPage(){
  currentPage--;
  displayPage(currentPage);
};
