function saveVariable(input) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     alert("Saved");
    }
  };
  xhttp.open("POST", "save?var=" + variable, true);
  xhttp.send();
}