$(function(){
alert("test");
/*  if(window.location.href.indexOf("chats") > -1) {
      alert("your url contains the name chats");
   }

   var name;
if(typeof module !== 'undefined' && typeof module.exports !== 'undefined'){

   module.exports = {
     firstName: 'Noel',
     lastName: 'placeHolder'
  };
}else{
  window.name = '';
}
*/
function validator(){

  module.exports = {
    firstName: 'Noel',
    lastName: 'placeHolder'
 };

    return validator;
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = validator;
  }else{
    window.name = validator;
}
});
