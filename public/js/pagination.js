var currentPage = 0;
var numberOfPages = 0;
var arr;
$(document).ready( function() {
  numberOfPages = parseInt($("#max_page_div").attr("max_page"));
  //for(var i = 0; i < numberOfPages; i++) {
      //$("#button_box").append("<button onclick=displayPage(" + i + ")>" + (i + 1) + "</button>");
  //};
  //console.log($("#button_box"));
  arr= $(".pageselector");
  displayPage(0);

});

function displayPage(pageNumber){
  currentPage=pageNumber;
  $('.paged').each(function(){
      if(parseInt($(this).attr('page')) ==  pageNumber) { // attr('page') gets data from the class 'page'
          //console.log("page 0");
          $(this).show();
      } else {
        $(this).hide();
      }


      if(parseInt($(this).attr('page')) <  pageNumber){
        $(this).hide();
      }

    })

if (currentPage < 5){
  for(var i=0; i<5;i++ ){
    $(arr[i]).attr("onclick", "displayPage("+ parseInt(i)+")");
    $(arr[i]).html(parseInt(i + 1));
    console.log("test statment");
  }

  for(var i=5; i<10;i++ ){
    $(arr[i]).attr("onclick", "displayPage("+ parseInt(i)+")");
    $(arr[i]).html(parseInt(i + 1));
  }
}

else {
    for(var i=0; i<5;i++ ){
      $(arr[i]).attr("onclick", "displayPage("+ parseInt(pageNumber-5+i)+")");
      $(arr[i]).html(parseInt((pageNumber-5+i) + 1 ));
      console.log("test statment");
    }

    for(var i=5; i<10;i++ ){
      $(arr[i]).attr("onclick", "displayPage("+ parseInt(pageNumber+i-5)+")");
      $(arr[i]).html(parseInt((pageNumber+i-5)+ 1));
    }
  }

if (currentPage == numberOfPages){
      for(var i = 0; i < numberOfPages; i++){
          $(arr[i]).attr("onclick", "displayPage("+ parseInt(pageNumber-numberOfPages-i)+")");
          $(arr[i]).html(parseInt(pageNumber-i-numberOfPages) - 1);
          console.log("test statment");
      }
  }


  $(arr).each(function(){
    if(parseInt($(this).html())-1 == currentPage){
      $(this).addClass('btn-success');
    } else {
      $(this).removeClass('btn-success');
    }
  });

};


function nextPage(){
  currentPage++;
  displayPage(currentPage);
};

function previousPage(){
  currentPage--;
  displayPage(currentPage);
};
