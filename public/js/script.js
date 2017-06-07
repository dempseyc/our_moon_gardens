
let ranNum = function (min,max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

let b = $('body');
let Gspace = $('#garden-space');
// this guys width is 2000px his height is 1200px;

let ranColors = ['#88A','#78A','#87A','#889'];

// put a bunch of divs in garden-space div
for (i=0;i<120;i++) {
  for(j=0;j<200;j++){
    let c = $('<div>');
    c.addClass('block');
    c.addClass(i+'-'+j);  //this classname locates the fucker
    c.css('background-color', ranColors[ranNum(0,3)]);
    c.css('top', i*10+'px');
    c.css('left', j*10+'px');
    c.attr({'onClick': 'evalClickEvent(this)'});
    Gspace.append(c);
  }
}
// all this does is produces a bunch of random colored divs to show me where i am in this garden in the scrollable dialog

// change this from params of the route
userGardenID = '0';


// this obj will be populated by data from ajax call, and stored on server, but for now is built only by this script, still have to write the parts where it is gotten and updated
let gardenData = {
  id: userGardenID,
  data: []  //array contains items in the form {locx:'number',locy:'number',url:'aURL'}
};
//still need to write ajax call to internal api to populate garden data

// droppableItems not the same as gardenData.data.  gardenData.data should include some of this stuff.  Craig, figure out where you are keeping things.

// Craig, droppableItems is a reference, not a storage space.  all storage should go to gardenData.data array.
// that object will be stringified and stored in the db
// on with the droppableItems, a list of built-in pixel-paintings Craig made.
let droppableItems =
[
{
  name: 'stepstone',
  url: 'images/stepstone.png'
},
{
  name: 'puddle',
  url: 'images/puddle.png'
},
{
  name: 'bigrocks',
  url: 'images/bigrocks.png'
},
{
  name: 'verticalbarrier',
  url: 'images/verticalbarrier.png'
},
{
  name: 'horizontalbarrier',
  url: 'images/horizontalbarrier.png'
},
{
  name: 'squarehedges',
  url: 'images/squarehedges.png'
},
{
  name: 'birdbath',
  url: 'images/birdbath.png'
},
{
  name: 'masonry',
  url: 'images/masonry.png'
},
{
  name: 'shrubbery',
  url: 'images/shrubbery.png'
}
];  //fill this in with objs

let JQitems = [
$('.item1'),
$('.item2'),
$('.item3'),
$('.item4'),
$('.item5'),
$('.item6'),
$('.item7'),
$('.item8'),
$('.item9')
];

//why type this out when i can get javascript to build the css and html?
JQitems.forEach(function (handle, idx) {
  url = droppableItems[idx].url;
  droppableItems[idx].jqhandle = handle;
  handle.css('background-image', 'url('+url+')');
  handle.attr({'onClick': 'evalClickEvent(this)'});
});

// what does this do?  it assigns a url from the droppable items list to a background attribute of the jquery dom element
// this fills items display with images from /images for the user to choose from

///////////////////////////////////////////////////////////////////////////////
// GIPHY API PART

// again, Craig, droppableGiphyItems should be a reference, not a storage space.  all storage should go to gardenData.data
// that is the object which will be stringified and stored in the db.
droppableGiphyItems = [];

let theForm = $('#giphysearch');

let JQgiphyItems = [
$('.giphy-item1'),
$('.giphy-item2'),
$('.giphy-item3'),
$('.giphy-item4'),
$('.giphy-item5'),
$('.giphy-item6'),
$('.giphy-item7'),
$('.giphy-item8'),
$('.giphy-item9')
];

JQgiphyItems.forEach(function (item, idx){
  item.attr({'onclick': 'evalClickEvent(this)'});  //the 'this' reference works, but who knows why?
});

//user has made a giphy search stickers only
theForm.submit(function(event){
  event.preventDefault();
  let input = $('#searchform').val();
  callGiphyAPI(input);
});

// there is a param for the giphy api url string that will offset results by a number and i will build a button to make the call for next 9 items, just for fun
// right now only the first 9 results are available

function callGiphyAPI (searchterm) {
  let key = "dc6zaTOxFJmzC";
  let URL = "http://api.giphy.com/v1/stickers/search?q="+searchterm+"&api_key="+key;
     $.ajax(URL, {  //howcome this syntax works for me and no other does?
      success: function(json) {
        console.log(json); //json is an array  also json.data is an array
        for (i=0;i<9;i++){
          JQgiphyItems[i].css('background-image','url('+json.data[i].images.downsized.url+')');
          let droppableGiphyItem = {
            name: searchterm+'-'+droppableGiphyItems.length,
            url: json.data[i].images.downsized.url,
            jqhandle: JQgiphyItems[i]
          };
          let cloneOfObj = JSON.parse(JSON.stringify(droppableGiphyItem));
          droppableGiphyItems.push(cloneOfObj);
        }
      },
      error: function() {
         console.log('An error occurred in API call');
      }
     });
}


let holdingItem = false;

function evalClickEvent(target) {

  //if not holding item, and in items divs, pickup item

  if (!holdingItem && target.classList.contains('item')) {
    let url = target.style.backgroundImage;
    url = url.replace('url(','').replace(')','').replace(/\"/gi, "");
    let img = $('<img>');
    img.attr({'src':url});
    let heldItem = $('<div id="held-item">');
    // gardenItem.addClass('.held-item');
    heldItem.append(img);
    b.append(heldItem);
    holdingItem = true;
  }

  //if holding item, and in items divs, switch items

  if (holdingItem && target.classList.contains('item')) {
    $('#held-item').remove();
    let url = target.style.backgroundImage;
    url = url.replace('url(','').replace(')','').replace(/\"/gi, "");
    let img = $('<img>');
    img.attr({'src':url});
    let heldItem = $('<div id="held-item">');
    heldItem.append(img);
    b.append(heldItem);
    holdingItem = true;
  }

  //if in garden area, and holding item, drop copy of item

  if (holdingItem && target.classList.contains('block')) {
    let location = target.classList[1];
    location = location.split("-");
    location = location.map(function (item){
      item = Number(item)*10;
      return item;
    });
    console.log(location);
    let url = $('#held-item').find('img').attr('src');
    url = url.replace('url(','').replace(')','').replace(/\"/gi, "");
    console.log(url);
    let img = $('<img>');
    img.attr({'src':url});
    let gardenItem = $('<div class="garden-item">');
    gardenItem.append(img);
    gardenItem.css({'position':'absolute','top':location[0]+'px','left':location[1]+'px',});
    Gspace.append(gardenItem);


    //////////////////////////////////////////////////////////////////////////
    //this is the most importatnt part

    //build obj to add to gardenData, and later send it to server
    let newGardenDataItem = {};
    newGardenDataItem.url = url;
    newGardenDataItem.locx = location[0];
    newGardenDataItem.locy = location[1];
    gardenData.data.push(newGardenDataItem);
    console.log(gardenData.data);  //this does work
    //this should build gardenData obj to send to server on "$ave Change$" click
  }
  // console.log("evalClickEvent called on "+target);
}


$(document).on('mousemove', function(e){
    $('#held-item').css({
       left:  e.pageX,
       top:   e.pageY
    });
});

/////////////////////////////////////////////////////////////////

// notes

/////////////////////////////////////////////////////////////////

// $(this).css( 'cursor', 'url(cursor.png), auto' );


// function dragStart(event) {
//     event.dataTransfer.setData("Text", event.target.id);
//     document.getElementById("demo").innerHTML = "Started to drag the p element";
// }

// function allowDrop(event) {
//     event.preventDefault();
// }

// function drop(event) {
//     event.preventDefault();
//     var data = event.dataTransfer.getData("Text");
//     event.target.appendChild(document.getElementById(data));
//     document.getElementById("demo").innerHTML = "The p element was dropped";
// }


/////////////////////////////////////////////////////

// document.onmousemove = mouseMove;
// function mouseMove(ev){
//   ev           = ev || window.event;
//   var mousePos = mouseCoords(ev);
// }
// function mouseCoords(ev){
//   if(ev.pageX || ev.pageY){
//     return {x:ev.pageX, y:ev.pageY};
//   }
//   return {
//     x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
//     y:ev.clientY + document.body.scrollTop  - document.body.clientTop
//   };
// }


// document.onmouseup = mouseUp;
// var dragObject     = null;
// function makeClickable(object){
//   object.onmousedown = function(){
//     dragObject = this;
//   }
// }
// function mouseUp(ev){
//   dragObject = null;
// }



// $("#button").on('click', function (e) {
//     e.preventDefault();
//     var $self = $(this);
//     $self.before($self.prev('table').clone());
// });
