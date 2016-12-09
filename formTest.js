console.log("reloaded");

var cancelHide = new Event('cancelHide');

window.addEventListener("cancelHide", function() {
  console.log("cancelHide");
  //confirm("You are trying to leave the page. That is not allowed");
});
window.onunload = function() {
  console.log("onunload");
}

window.onbeforeunload = function() {
  console.log("onbeforeunload");
  //return 'Why are you leaving, dave?';
}

window.addEventListener("pagehide", function(e) {
  e.preventDefault();
  e.stopPropagation();
  window.dispatchEvent(cancelHide);

  console.log("pagehide");
}, true);

console.log("Hello, world");

if(window.performance) {
  if(performance.navigation.type == 1) {
    alert('page reloaded');
  }
}
