//// thinking out how this should work
//
// we have functs for picking up and dropping items
// we have a funct for erasing items
//// actually, we don't have a funct for that it's just a dream at this point
////////// what we might do is switch the mouseStatus to erase
////////// then be able to somehow remove particular divs from the Gspace
////////// how we will achieve this is yet to be discovered
////////// that it will be done is an eventuality
//
// we have a funct for hitting giphy api which includes offset meaning the next 8 results
//
////////// let's do that next in the implementation because that will be really fun
//////////
// we have functs for changing the status of the mouse from adding, to changing paintbrush, to erasing, to saving changes in the data
// we have a funct to build the string to be saved in server
// organize better into utilities, interactions, and apis
// the big built string should be stored in a hidden form regularly... when user saves, the body will be parsed and the string will be updated in database

/////////////////////////////////////////////////////////////////////////////////////////////
// DOM BUILDING FE
// LIST OF USEABLE ITEMS

let droppableItems =
[
{
  name: 'stepstone',
  url: '../../public/images/stepstone.png'
},
{
  name: 'puddle',
  url: '../../public/images/puddle.png'
},
{
  name: 'bigrocks',
  url: '../../public/images/bigrocks.png'
},
{
  name: 'verticalbarrier',
  url: '../../public/images/verticalbarrier.png'
},
{
  name: 'horizontalbarrier',
  url: '../../public/images/horizontalbarrier.png'
},
{
  name: 'squarehedges',
  url: '../../public/images/squarehedges.png'
},
{
  name: 'birdbath',
  url: '../../public/images/birdbath.png'
},
{
  name: 'masonry',
  url: '../../public/images/masonry.png'
},
{
  name: 'shrubbery',
  url: '../../public/images/shrubbery.png'
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

JQitems.forEach(function (handle, idx) {
  url = droppableItems[idx].url;
  droppableItems[idx].jqhandle = handle;
  handle.css('background-image', 'url('+url+')');
  handle.attr({'onClick': 'evalClickEvent(this)'});
});

//// CACHE DOM

let b = $('body');

  // this guys width is 2000px his height is 1200px btw, i'm talking about Mr. Gspace
let Gspace = $('#garden-space');
let HELD = $('<div id="held-item">');  // instantiating this element for append to b later

// the "this" target should be either an item or the Gspace
// the "evalClickEvent(this)"" feels like a good funct so far in this adventure tho
Gspace.attr({'onClick': 'evalClickEvent(this)'});

/////////////////////////////////////////////////////////////////////////////////////////////
// UTILITIES

// the main utility at work now
let mouseStatus = {
  xPos: 0,
  yPos: 0,
  holding: false,
  erasing: false
};

//// clientX and clientY make no difference, but what I want is the return of the absolute position of the mouse within the Gspace..   is that so much to ask for????
let updateMouseStatus = function(e) {
  mouseStatus.xPos = e.pageX;
  mouseStatus.yPos = e.pageY;
  mouseStatus.holding = true;
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


// END UTILITIES
//////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////
// USER GARDEN API PART

// change this from params of the route
userGardenID = '0';

// this obj will be populated by data from ajax call, and stored on server on save, but for now is built only by this script, still have to write the parts where it is gotten and updated
let gardenData = {
  id: userGardenID,
  data: []  //array contains items in the form {locx:'number',locy:'number',url:'aURL'}
};

// callGardenAPI(userGardenID);

// function callGardenAPI (gardenID) {
//   // this should route to a get in app.js that responds with the gardendata column of the correlated gardenID....
//   let URL = "#";
//      $.ajax(URL, {
//       success: function(gardenInDB) {
//         gardenData.data = gardenInDB;  //maybe do this ????
//         console.log(gardenInDB);
//       },
//       error: function() {
//          console.log('An error occurred in garden API call');
//       }
//      });
// }

//////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////
// GIPHY API PART

droppableGiphyItems = [];

// may need a little function in here to handle larger widths
// def can get width from droppableGiphyItems[i].width ??
//////////////////////////////////////////////////////////////////////////////////////////////////


let page = 0;
let theForm = $('#giphy-search');

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
  let input = $('#search-form').val();
  callGiphyAPI(input,page);
});

// need to add page argument for offset.
//// also would like to return width of gif and resize for app ********************************
//// ******************************************************************************************
//// how shall we return the width of the gif?

function callGiphyAPI (searchterm,offset) {
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



// from here you have to use mouseStatus for holding mouse events

function evalClickEvent(target) {

  //if not holding item, and in items divs, mouse picks up item

  if (!mouseStatus.holding && target.classList.contains('item')) {
    mouseStatus.holding = true;
    let url = target.style.backgroundImage;
    url = url.replace('url(','').replace(')','').replace(/\"/gi, "");
    let img = $('<img>');
    img.attr({ 'src': url });

    // this kinda looks right?
    HELD.append(img);
    b.append(HELD);

    holdingItem = true;
  };

  //if holding item, and in items divs, switch items

  if (mouseStatus.holding && target.classList.contains('item')) {
    HELD.empty();
    let url = target.style.backgroundImage;
    url = url.replace('url(','').replace(')','').replace(/\"/gi, "");
    let img = $('<img>');
    img.attr({'src':url});
    HELD.append(img);
    b.append(HELD);
    holdingItem = true;
  };

  //if in garden area, and holding item, drop copy of item

  if (mouseStatus.holding && target.classList.contains('inner')) {
    console.log("drop item");
    let url = $('#held-item').find('img').attr('src');
    url = url.replace('url(','').replace(')','').replace(/\"/gi, "");
    let img = $('<img>');
    img.attr({'src': url});
    let gardenItem = $('<div class="garden-item">');
    gardenItem.append(img);

    // this line should give mouseposition in gspace instead
    gardenItem.css({
      'position':'absolute',
      'left': mouseStatus.xPos+'px',
      'top': mouseStatus.yPos+'px'
    });

    Gspace.append(gardenItem);

    //////////////////////////////////////////////////////////////////////////
    // this is the most important part
    // build obj to add to gardenData, and later send it to server
    let appUpdateData = function () {
      let newGardenDataItem = {};
      newGardenDataItem.url = url;
      // replace these with garden locations /////////////////////////////////
      // newGardenDataItem.locx = location[0];
      // newGardenDataItem.locy = location[1];
      gardenData.data.push(newGardenDataItem);
      console.log(gardenData.data);
    };

    appUpdateData();

  }
} //eval click event

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

