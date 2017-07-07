
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

// change this from params of the route
userGardenID = '0';

// this obj will be populated by data from ajax call, and stored on server on save, but for now is built only by this script, still have to write the parts where it is gotten and updated
let gardenData = {
  id: userGardenID,
  data: []  //array contains items in the form {locx:'number',locy:'number',url:'aURL'}
};

///////////////////////////////////////////////////////////////////////////////
// USER GARDEN API PART

// callGardenAPI(userGardenID);

// lets try this internal api call thing
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

JQitems.forEach(function (handle, idx) {
  url = droppableItems[idx].url;
  droppableItems[idx].jqhandle = handle;
  handle.css('background-image', 'url('+url+')');
  handle.attr({'onClick': 'evalClickEvent(this)'});
});


///////////////////////////////////////////////////////////////////////////////
// GIPHY API PART

droppableGiphyItems = [];

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

// need to add arg for offset.

function callGiphyAPI (searchterm,offset) {
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

//perhaps put all of this at top and track mouse status within an obj
// status like item/noitem/eraser/stuff like that
$(document).on('mousemove', function(e){
    $('#held-item').css({
       left:  e.pageX,
       top:   e.pageY
    });
});


