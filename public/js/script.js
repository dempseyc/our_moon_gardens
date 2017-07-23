/////////////////////////////////////////////////////////////////////////////////////////////
// DOM BUILDING FE
// LIST OF USEABLE ITEMS

let droppableItems =
[
{
  name: 'stepstone',
  url: '/images/stepstone.png'
},
{
  name: 'puddle',
  url: '/images/puddle.png'
},
{
  name: 'bigrocks',
  url: '/images/bigrocks.png'
},
{
  name: 'verticalbarrier',
  url: '/images/verticalbarrier.png'
},
{
  name: 'horizontalbarrier',
  url: '/images/horizontalbarrier.png'
},
{
  name: 'squarehedges',
  url: '/images/squarehedges.png'
},
{
  name: 'birdbath',
  url: '/images/birdbath.png'
},
{
  name: 'masonry',
  url: '/images/masonry.png'
},
{
  name: 'shrubbery',
  url: '/images/shrubbery.png'
}
];

// MAY BE A MORE SAVVY WAY TO FILL IN THIS GRID
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

JQitems.forEach((handle, idx) => {
  url = droppableItems[idx].url;
  droppableItems[idx].jqhandle = handle;
  handle.css('background-image', 'url('+url+')');
  handle.attr({'onClick': 'evalClickEvent(this)'});
});

let contentField = $('#contents');

//// CACHE DOM

let b = $('body');

  // this guys width is 2000px his height is 1200px btw, i'm talking about Mr. Gspace
let Gspace = $('#garden-space');
let GspaceCont = $('.scrollbar-container');
let Eraser = $('.erase-mode');

let HELD = $('<div id="held-item">');  // instantiating this element for append to b later

// the "this" target should be either an item or the Gspace
// the "evalClickEvent(this)"" feels like a good funct so far in this adventure tho
Gspace.attr({'onClick': 'evalClickEvent(this)'});
Eraser.attr({'onClick': 'evalClickEvent(this)'});

/////////////////////////////////////////////////////////////////////////////////////////////

// the main utility at work now
let mouseStatus = {
  xPos: 0,
  yPos: 0,
  holding: false,
  erase: false
};

//// clientX and clientY make no difference, but what I want is the return of the absolute position of the mouse within the Gspace..   is that so much to ask for????
let updateMouseStatus = function(e) {
  mouseStatus.xPos = e.pageX;
  mouseStatus.yPos = e.pageY;
  updateHeldItem();
};

let updateHeldItem = function() {
  HELD.css({
       left:  mouseStatus.xPos - 25,
       top:   mouseStatus.yPos - 25
    });
};

b.on('mousemove', function(e){
  updateMouseStatus(e);
});

Gspace.on('mousemove', function(e) {
  updateMouseStatus(e);
});

//////////////////////////////////////////////////////////////////////////////////////////////////
// USER GARDEN API PART

// change this from params of the route
userGardenID = '0';

// this obj will be populated by data from ajax call, and stored on server on save, but for now is built only by this script, still have to write the parts where it is gotten and updated
let gardenData = {
  id: userGardenID,
  data: []  //array contains items in the form {locx:'number',locy:'number',url:'aURL'}
};

//////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////
// GIPHY API PART

droppableGiphyItems = [];

// may need a little function in here to handle larger widths
// def can get width from droppableGiphyItems[i].width ??
//////////////////////////////////////////////////////////////////////////////////////////////////


let TheForm = $('#giphy-search');
let Ginput = "";
let Page = $('.giphy-page');
let offsetReturn = Number(Page.text());
let Back = $('.giphy-back');
let Forward = $('.giphy-forward');

Back.click(function(){
  if (offsetReturn > 0) {
    offsetReturn--;
    Page.text(offsetReturn);
  }
});
Forward.click(function(){
  Ginput = $('#search').val();
  if (Ginput) {
    offsetReturn++;
    Page.text(offsetReturn);
  }
});

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

JQgiphyItems.forEach((item, idx) =>{
  item.attr({'onclick': 'evalClickEvent(this)'});  //the 'this' reference works, but who knows why?
});

//user has made a giphy search stickers only
TheForm.submit(function(event){
  Ginput = $('#search').val();
  event.preventDefault();
  if (Ginput) {
    callGiphyAPI(Ginput,Page.text());
  }
});

// need to add page argument for offset.
//// also would like to return width of gif and resize for app ********************************
//// ******************************************************************************************
//// how shall we return the width of the gif?

function callGiphyAPI (searchterm,offset) {
  offset *= 9;
  let key = "dc6zaTOxFJmzC";
  let URL = "http://api.giphy.com/v1/stickers/search?q="+searchterm+"&offset="+offset+"&api_key="+key;
     $.ajax(URL, {  //howcome this syntax works for me and no other does?
      success: function(json) {
        console.log(json); //json is an array  also json.data is an array
        for (i=0;i<9;i++){
          JQgiphyItems[i].css('background-image','url('+json.data[i].images.downsized.url+')');
          let droppableGiphyItem = {
            name: searchterm+'-'+droppableGiphyItems.length,
            url: json.data[i].images.downsized.url,
            jqhandle: JQgiphyItems[i],
            width: json.data[i].images.downsized.width
          };
          let cloneOfObj = JSON.parse(JSON.stringify(droppableGiphyItem));
          //even if i get the width, how do i modulate the clone?
          droppableGiphyItems.push(cloneOfObj);
        }
      },
      error: function() {
         console.log('An error occurred in API call');
      }
     });
}

let dropItem = function (url,x,y) {
  let img = $('<img>');
  img.attr({'src': url});
  let gardenItem = $('<div class="garden-item">');
  //dubious because this is in evalclickevent?
  gardenItem.attr({'onclick': 'evalClickEvent(this)'});
  gardenItem.append(img);
  // set position of dropped item

  gardenItem.css({
    'position':'absolute',
    'left': x,
    'top':  y
  });
  Gspace.append(gardenItem);
};

let appUpdateData = function (url,x,y) {
  let newGardenDataItem = {};
  newGardenDataItem.url = url;
  // replace these with garden locations /////////////////////////////////
  newGardenDataItem.locx = x;
  newGardenDataItem.locy = y;
  gardenData.data.push(newGardenDataItem);
  let str = JSON.stringify(gardenData);
  contentField.val(str);
  console.log(str);
};

function evalClickEvent(target) {

    // go back to normal pointer state
  if (mouseStatus.erase && target.classList.contains('erase-mode')) {
    console.log("unerase mode");
    HELD.empty();
    mouseStatus.holding = false;
    mouseStatus.erase = false;
    Eraser.css('color', '#FFF');
    $('.garden-item').each(function (){
      $(this).css({'pointer-events': 'none'});
    });
    Gspace.css({'pointer-events': 'all'});

    // go to erase mode
  } else if (!mouseStatus.erase && target.classList.contains('erase-mode')) {
    console.log("erase mode");
    HELD.empty();
    mouseStatus.holding = false;
    mouseStatus.erase = true;
    Eraser.css('color', '#F00');  //turns
    $('.garden-item').each(function (){
      $(this).css({'pointer-events': 'all'});
    });
    Gspace.css({'pointer-events': 'none'});

    // pickup item  // this condition is failing
  } else if (!mouseStatus.erase && !mouseStatus.holding && target.classList.contains('item')) {
    mouseStatus.holding = true;
    mouseStatus.erase = false;
    let url = target.style.backgroundImage;
    url = url.replace('url(','').replace(')','').replace(/\"/gi, "");
    let img = $('<img>');
    img.attr({ 'src': url });

    HELD.append(img);
    b.append(HELD);

    holdingItem = true;

    // switch items
  } else if (!mouseStatus.erase && mouseStatus.holding && target.classList.contains('item')) {
    console.log("switch items");
    HELD.empty();
    let url = target.style.backgroundImage;
    url = url.replace('url(','').replace(')','').replace(/\"/gi, "");
    let img = $('<img>');
    img.attr({'src':url});
    HELD.append(img);
    b.append(HELD);
    holdingItem = true;

    // drop item in garden
  } else if (!mouseStatus.erase && mouseStatus.holding && target.classList.contains('inner')) {
    console.log("drop item");
    let url = $('#held-item').find('img').attr('src');
    url = url.replace('url(','').replace(')','').replace(/\"/gi, "");

    let relPos = {
      left: mouseStatus.xPos - Gspace.offset().left - 25,
      top : mouseStatus.yPos - Gspace.offset().top - 25
    };

    //////////////////////////////////////////////////////////////////////////
    // this is the most important part
    // build obj to add to gardenData, and later send it to server
    dropItem(url, relPos.left, relPos.top);
    appUpdateData(url, relPos.left, relPos.top);

    // erase garden item  //////// target.classList.contains('garden-item') is not true here
  } else if (mouseStatus.erase && target.classList.contains('garden-item')){
    console.log(target);
    let obj = JSON.stringify(mouseStatus);
    console.log("mouseStatus = " + obj + "in erase condition ");
    console.log("erase target");
    target.remove();

    // send error info
  } else {
    let obj = JSON.stringify(mouseStatus);
    console.log(target);
    console.log("mouseStatus = " + obj);
  }
} //eval click event

let data = JSON.parse(contentField.val());

let loadItems = function(arr) {
  arr.forEach((item) => {
    dropItem(item.url,item.locx,item.locy);
    appUpdateData(item.url,item.locx,item.locy);
  })
};

loadItems(data.data);

console.log(contentField.val() + " new load");

//// old code

// let ranColors = ['#88A','#78A','#87A','#889'];  // not used now

// put a bunch of divs in garden-space div
// for (i=0;i<120;i++) {
//   for(j=0;j<200;j++){
//     let c = $('<div>');
//     c.addClass('block');
//     c.addClass(i+'-'+j);  //this classname locates the fucker
//     c.css('background-color', ranColors[ranNum(0,3)]);
//     c.css('top', i*10+'px');
//     c.css('left', j*10+'px');
//     c.attr({'onClick': 'evalClickEvent(this)'});
//     Gspace.append(c);
//   }
// }

// let ranNum = function (min,max) {
//   return Math.floor(Math.random() * (max + 1 - min)) + min;
// };
//
//// still a good guy though, good utility to keep bouncing around in different projs
////////////////////////////////////   should be included in a craig.js

