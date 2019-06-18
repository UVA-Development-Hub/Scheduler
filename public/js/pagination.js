var currentPage = 0;
var numberOfPages = 0;
$(document).ready( function() {
  numberOfPages = parseInt($("#max_page_div").attr("max_page"));
  for(var i = 0; i < numberOfPages; i++) {
      $("#button_box").append("<button onclick=displayPage(" + i + ")>" + (i + 1) + "</button>");
  };
  console.log($("#button_box"));
  displayPage(0);

});


function displayPage(pageNumber){
  $('.paged').each(function(){
      if(parseInt($(this).attr('page')) ==  pageNumber) { // attr('page') gets data from the class 'page'
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
